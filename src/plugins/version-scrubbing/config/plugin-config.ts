/**
 * Configuration management for the Version Scrubbing Plugin
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  NotificationConfig,
  RateLimitConfig,
  UpdateStrategy,
} from "../types/index.js";

export interface PluginConfig {
  schedule: {
    frequency: "daily" | "weekly" | "monthly" | "manual";
    time?: string;
    timezone?: string;
  };
  monitoring: {
    runtimes: string[];
    frameworks: string[];
    packages: string[];
    packageManagers: string[];
  };
  notifications: NotificationConfig;
  sources: {
    customEndpoints?: Record<string, string>;
    rateLimits?: Record<string, RateLimitConfig>;
    apiKeys?: Record<string, string>;
  };
  cache: {
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum cache entries
    directory?: string;
  };
  analysis: {
    defaultStrategy: UpdateStrategy;
    includePrerelease: boolean;
    securityOnly: boolean;
    breakingChangeThreshold: "patch" | "minor" | "major";
  };
  integration: {
    peezyCliPath?: string;
    autoUpdateDocs: boolean;
    createPullRequests: boolean;
    githubToken?: string;
  };
}

const DEFAULT_CONFIG: PluginConfig = {
  schedule: {
    frequency: "weekly",
    time: "09:00",
    timezone: "UTC",
  },
  monitoring: {
    runtimes: ["nodejs", "python", "bun"],
    frameworks: ["react", "vue", "vite", "flask", "fastapi", "tailwindcss"],
    packages: [],
    packageManagers: ["npm", "pnpm", "yarn", "pip"],
  },
  notifications: {
    enabled: true,
    channels: ["console"],
    severity: "major",
  },
  sources: {
    rateLimits: {
      github: {
        maxRequests: 60,
        windowMs: 3600000, // 1 hour
        backoffMultiplier: 2,
        maxBackoffMs: 300000, // 5 minutes
      },
      npm: {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
        backoffMultiplier: 1.5,
        maxBackoffMs: 60000, // 1 minute
      },
    },
  },
  cache: {
    ttl: 3600000, // 1 hour
    maxSize: 1000,
    directory: ".cache/version-scrubbing",
  },
  analysis: {
    defaultStrategy: "moderate",
    includePrerelease: false,
    securityOnly: false,
    breakingChangeThreshold: "minor",
  },
  integration: {
    autoUpdateDocs: false,
    createPullRequests: false,
  },
};

export function loadConfig(configPath?: string): PluginConfig {
  const possiblePaths = [
    configPath,
    ".kiro/settings/version-scrubbing.json",
    "version-scrubbing.config.json",
    process.env.VERSION_SCRUBBING_CONFIG,
  ].filter(Boolean) as string[];

  let userConfig: Partial<PluginConfig> = {};

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      try {
        const configContent = readFileSync(path, "utf-8");
        userConfig = JSON.parse(configContent);
        break;
      } catch (error) {
        console.warn(`Failed to load config from ${path}:`, error);
      }
    }
  }

  // Load environment variables
  const envConfig = loadEnvironmentConfig();

  // Merge configurations: default < file < environment
  return mergeConfigs(DEFAULT_CONFIG, userConfig, envConfig);
}

function loadEnvironmentConfig(): Partial<PluginConfig> {
  const envConfig: Partial<PluginConfig> = {};

  // Schedule configuration
  if (process.env.VS_SCHEDULE_FREQUENCY) {
    envConfig.schedule = {
      ...envConfig.schedule,
      frequency: process.env.VS_SCHEDULE_FREQUENCY as any,
    };
  }

  // Notification configuration
  if (process.env.VS_NOTIFICATIONS_ENABLED) {
    envConfig.notifications = {
      enabled: process.env.VS_NOTIFICATIONS_ENABLED === "true",
      channels: ["console"],
      severity: "major",
      ...envConfig.notifications,
    };
  }

  if (process.env.VS_WEBHOOK_URL) {
    envConfig.notifications = {
      enabled: true,
      channels: ["console"],
      severity: "major",
      ...envConfig.notifications,
      webhookUrl: process.env.VS_WEBHOOK_URL,
    };
  }

  // API keys
  if (process.env.GITHUB_TOKEN) {
    envConfig.sources = {
      ...envConfig.sources,
      apiKeys: {
        ...envConfig.sources?.apiKeys,
        github: process.env.GITHUB_TOKEN,
      },
    };
  }

  // Integration settings
  if (process.env.VS_AUTO_UPDATE_DOCS) {
    envConfig.integration = {
      autoUpdateDocs: process.env.VS_AUTO_UPDATE_DOCS === "true",
      createPullRequests: false,
      ...envConfig.integration,
    };
  }

  return envConfig;
}

function mergeConfigs(...configs: Partial<PluginConfig>[]): PluginConfig {
  const result = { ...DEFAULT_CONFIG };

  for (const config of configs) {
    if (!config) continue;

    // Deep merge objects
    for (const [key, value] of Object.entries(config)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        result[key as keyof PluginConfig] = {
          ...result[key as keyof PluginConfig],
          ...value,
        } as any;
      } else if (value !== undefined) {
        result[key as keyof PluginConfig] = value as any;
      }
    }
  }

  return result;
}

export function validateConfig(config: PluginConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate schedule
  if (
    !["daily", "weekly", "monthly", "manual"].includes(
      config.schedule.frequency
    )
  ) {
    errors.push(`Invalid schedule frequency: ${config.schedule.frequency}`);
  }

  // Validate notification channels
  const validChannels = ["console", "file", "webhook"];
  for (const channel of config.notifications.channels) {
    if (!validChannels.includes(channel)) {
      errors.push(`Invalid notification channel: ${channel}`);
    }
  }

  // Validate webhook URL if webhook channel is enabled
  if (
    config.notifications.channels.includes("webhook") &&
    !config.notifications.webhookUrl
  ) {
    errors.push(
      "Webhook URL is required when webhook notifications are enabled"
    );
  }

  // Validate cache settings
  if (config.cache.ttl < 0) {
    errors.push("Cache TTL must be non-negative");
  }

  if (config.cache.maxSize < 1) {
    errors.push("Cache max size must be at least 1");
  }

  // Validate rate limits
  if (config.sources.rateLimits) {
    for (const [source, rateLimit] of Object.entries(
      config.sources.rateLimits
    )) {
      if (rateLimit.maxRequests < 1) {
        errors.push(`Rate limit maxRequests for ${source} must be at least 1`);
      }
      if (rateLimit.windowMs < 1000) {
        errors.push(
          `Rate limit windowMs for ${source} must be at least 1000ms`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createDefaultConfig(outputPath: string): void {
  const fs = require("fs");
  const path = require("path");

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write default configuration
  fs.writeFileSync(outputPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
}
