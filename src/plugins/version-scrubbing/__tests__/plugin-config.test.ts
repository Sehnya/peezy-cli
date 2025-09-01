/**
 * Tests for the Plugin Configuration
 */

import { validateConfig, loadConfig } from "../config/plugin-config.js";
import { PluginConfig } from "../config/plugin-config.js";

function getValidConfig(): PluginConfig {
  return {
    schedule: {
      frequency: "weekly",
      time: "09:00",
      timezone: "UTC",
    },
    monitoring: {
      runtimes: ["nodejs", "python"],
      frameworks: ["react", "vue"],
      packages: [],
      packageManagers: ["npm", "yarn"],
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
          windowMs: 3600000,
          backoffMultiplier: 2,
          maxBackoffMs: 300000,
        },
      },
    },
    cache: {
      ttl: 3600000,
      maxSize: 1000,
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
}

describe("Plugin Configuration", () => {
  describe("validateConfig", () => {
    test("should validate a correct configuration", () => {
      const validConfig = getValidConfig();
      const result = validateConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject invalid schedule frequency", () => {
      const invalidConfig = {
        ...getValidConfig(),
        schedule: { frequency: "invalid" as any },
      };

      const result = validateConfig(invalidConfig as PluginConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid schedule frequency: invalid");
    });

    test("should reject invalid notification channels", () => {
      const invalidConfig = {
        ...getValidConfig(),
        notifications: {
          enabled: true,
          channels: ["invalid" as any],
          severity: "major" as const,
        },
      };

      const result = validateConfig(invalidConfig as PluginConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid notification channel: invalid");
    });

    test("should require webhook URL when webhook notifications are enabled", () => {
      const invalidConfig = {
        ...getValidConfig(),
        notifications: {
          enabled: true,
          channels: ["webhook" as const],
          severity: "major" as const,
        },
      };

      const result = validateConfig(invalidConfig as PluginConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Webhook URL is required when webhook notifications are enabled"
      );
    });

    test("should reject negative cache TTL", () => {
      const invalidConfig = {
        ...getValidConfig(),
        cache: { ttl: -1000, maxSize: 1000 },
      };

      const result = validateConfig(invalidConfig as PluginConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Cache TTL must be non-negative");
    });

    test("should reject invalid cache max size", () => {
      const invalidConfig = {
        ...getValidConfig(),
        cache: { ttl: 3600000, maxSize: 0 },
      };

      const result = validateConfig(invalidConfig as PluginConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Cache max size must be at least 1");
    });

    test("should validate rate limits", () => {
      const invalidConfig = {
        ...getValidConfig(),
        sources: {
          rateLimits: {
            github: {
              maxRequests: 0,
              windowMs: 500,
              backoffMultiplier: 2,
              maxBackoffMs: 300000,
            },
          },
        },
      };

      const result = validateConfig(invalidConfig as PluginConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Rate limit maxRequests for github must be at least 1"
      );
      expect(result.errors).toContain(
        "Rate limit windowMs for github must be at least 1000ms"
      );
    });
  });

  describe("loadConfig", () => {
    test("should load default configuration when no config file exists", () => {
      const config = loadConfig("non-existent-config.json");

      expect(config).toBeDefined();
      expect(config.schedule.frequency).toBe("weekly");
      expect(config.monitoring.runtimes).toContain("nodejs");
      expect(config.notifications.enabled).toBe(true);
    });

    test("should merge environment variables", () => {
      // Set environment variables
      process.env.VS_SCHEDULE_FREQUENCY = "daily";
      process.env.VS_NOTIFICATIONS_ENABLED = "false";

      const config = loadConfig("non-existent-config.json");

      expect(config.schedule.frequency).toBe("daily");
      expect(config.notifications.enabled).toBe(false);

      // Clean up
      delete process.env.VS_SCHEDULE_FREQUENCY;
      delete process.env.VS_NOTIFICATIONS_ENABLED;
    });

    test("should handle GitHub token from environment", () => {
      process.env.GITHUB_TOKEN = "test-token";

      const config = loadConfig("non-existent-config.json");

      expect(config.sources.apiKeys?.github).toBe("test-token");

      // Clean up
      delete process.env.GITHUB_TOKEN;
    });
  });
});
