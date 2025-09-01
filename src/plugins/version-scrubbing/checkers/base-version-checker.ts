/**
 * Base class for version checkers
 */

import {
  VersionChecker,
  CheckResult,
  VersionInfo,
  UpdateRecommendation,
  UpdateAction,
  SecurityAdvisory,
  BreakingChange,
  RateLimitConfig,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

export abstract class BaseVersionChecker implements VersionChecker {
  protected name: string;
  protected apiEndpoint: string;
  protected rateLimit?: RateLimitConfig;
  protected lastRequest: Date = new Date(0);
  protected requestCount: number = 0;
  protected backoffMs: number = 0;

  constructor(name: string, apiEndpoint: string, rateLimit?: RateLimitConfig) {
    this.name = name;
    this.apiEndpoint = apiEndpoint;
    this.rateLimit = rateLimit;
  }

  abstract checkVersion(): Promise<CheckResult>;
  abstract parseVersion(versionString: string): string;

  /**
   * Compare two semantic versions
   * Returns: 1 if version1 > version2, -1 if version1 < version2, 0 if equal
   */
  compareVersions(version1: string, version2: string): number {
    const v1Parts = this.parseVersion(version1).split(".").map(Number);
    const v2Parts = this.parseVersion(version2).split(".").map(Number);

    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }

    return 0;
  }

  /**
   * Generate update recommendation based on version difference
   */
  getUpdateRecommendation(
    current: string,
    latest: string
  ): UpdateRecommendation {
    const comparison = this.compareVersions(latest, current);

    if (comparison <= 0) {
      return {
        priority: "low",
        type: "maintenance",
        impact: "compatible",
        recommendation: "You are using the latest version or a newer version.",
        actions: [],
      };
    }

    const currentParts = this.parseVersion(current).split(".").map(Number);
    const latestParts = this.parseVersion(latest).split(".").map(Number);

    // Determine update type
    let updateType: "patch" | "minor" | "major" = "patch";
    let impact: "breaking" | "compatible" | "unknown" = "compatible";
    let priority: "critical" | "high" | "medium" | "low" = "low";

    if (latestParts[0] > currentParts[0]) {
      updateType = "major";
      impact = "breaking";
      priority = "medium";
    } else if (latestParts[1] > currentParts[1]) {
      updateType = "minor";
      impact = "compatible";
      priority = "low";
    } else if (latestParts[2] > currentParts[2]) {
      updateType = "patch";
      impact = "compatible";
      priority = "low";
    }

    return {
      priority,
      type: updateType === "patch" ? "bugfix" : "feature",
      impact,
      recommendation: this.generateRecommendationText(
        updateType,
        current,
        latest
      ),
      actions: this.generateUpdateActions(updateType, current, latest),
      timeline: this.getUpdateTimeline(updateType, priority),
    };
  }

  protected generateRecommendationText(
    updateType: "patch" | "minor" | "major",
    current: string,
    latest: string
  ): string {
    switch (updateType) {
      case "patch":
        return `Consider updating from ${current} to ${latest}. This is a patch release with bug fixes and security updates.`;
      case "minor":
        return `Update available from ${current} to ${latest}. This minor release includes new features while maintaining backward compatibility.`;
      case "major":
        return `Major update available from ${current} to ${latest}. Review breaking changes before upgrading.`;
      default:
        return `Update available from ${current} to ${latest}.`;
    }
  }

  protected generateUpdateActions(
    updateType: "patch" | "minor" | "major",
    current: string,
    latest: string
  ): UpdateAction[] {
    const actions: UpdateAction[] = [
      {
        type: "review",
        description: `Review changelog for ${this.name} ${latest}`,
        documentation: `${this.getChangelogUrl(latest)}`,
        automated: false,
      },
    ];

    if (updateType === "major") {
      actions.push({
        type: "review",
        description: "Review breaking changes and migration guide",
        documentation: `${this.getChangelogUrl(latest)}`,
        automated: false,
      });
    }

    actions.push({
      type: "test",
      description: "Test the update in a development environment",
      automated: false,
    });

    actions.push({
      type: "upgrade",
      description: `Update ${this.name} to ${latest}`,
      command: this.getUpdateCommand(latest),
      automated: true,
    });

    return actions;
  }

  protected getUpdateTimeline(
    updateType: "patch" | "minor" | "major",
    priority: "critical" | "high" | "medium" | "low"
  ): string {
    if (priority === "critical") return "Immediate";

    switch (updateType) {
      case "patch":
        return "Within 1-2 weeks";
      case "minor":
        return "Within 1 month";
      case "major":
        return "Plan for next major release cycle";
      default:
        return "At your convenience";
    }
  }

  protected abstract getChangelogUrl(version: string): string;
  protected abstract getUpdateCommand(version: string): string;

  /**
   * Check if we're within rate limits
   */
  protected async checkRateLimit(): Promise<boolean> {
    if (!this.rateLimit) return true;

    const now = new Date();
    const windowStart = new Date(now.getTime() - this.rateLimit.windowMs);

    // Reset counter if we're in a new window
    if (this.lastRequest < windowStart) {
      this.requestCount = 0;
      this.backoffMs = 0;
    }

    // Check if we've exceeded the limit
    if (this.requestCount >= this.rateLimit.maxRequests) {
      // Apply exponential backoff
      this.backoffMs = Math.min(
        this.backoffMs * this.rateLimit.backoffMultiplier || 1000,
        this.rateLimit.maxBackoffMs
      );

      logger.warn(
        `Rate limit exceeded for ${this.name}. Backing off for ${this.backoffMs}ms`
      );
      return false;
    }

    return true;
  }

  /**
   * Wait for backoff period if needed
   */
  protected async waitForBackoff(): Promise<void> {
    if (this.backoffMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.backoffMs));
      this.backoffMs = 0;
    }
  }

  /**
   * Record a request for rate limiting
   */
  protected recordRequest(): void {
    this.requestCount++;
    this.lastRequest = new Date();
  }

  /**
   * Make an HTTP request with error handling and rate limiting
   */
  protected async makeRequest(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    // Check rate limits
    if (!(await this.checkRateLimit())) {
      await this.waitForBackoff();
      if (!(await this.checkRateLimit())) {
        throw new Error(`Rate limit exceeded for ${this.name}`);
      }
    }

    try {
      this.recordRequest();

      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "Peezy-CLI-Version-Scrubbing-Plugin/1.0.0",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      logger.error(`Request failed for ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Extract security advisories from version data
   */
  protected extractSecurityAdvisories(data: any): SecurityAdvisory[] {
    // Default implementation - override in subclasses
    return [];
  }

  /**
   * Extract breaking changes from version data
   */
  protected extractBreakingChanges(data: any): BreakingChange[] {
    // Default implementation - override in subclasses
    return [];
  }

  /**
   * Determine if a version is a prerelease
   */
  protected isPrerelease(version: string): boolean {
    const cleanVersion = this.parseVersion(version);
    return /-(alpha|beta|rc|pre|dev|canary|next)/i.test(cleanVersion);
  }

  /**
   * Filter out prerelease versions
   */
  protected filterStableVersions(versions: string[]): string[] {
    return versions.filter((version) => !this.isPrerelease(version));
  }

  /**
   * Get the latest stable version from a list
   */
  protected getLatestStable(versions: string[]): string {
    const stableVersions = this.filterStableVersions(versions);
    if (stableVersions.length === 0) return versions[0] || "";

    return stableVersions.sort((a, b) => this.compareVersions(b, a))[0];
  }
}
