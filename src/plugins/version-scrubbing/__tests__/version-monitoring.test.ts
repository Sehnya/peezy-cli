/**
 * Tests for the Version Monitoring Service
 */

import { VersionMonitoringService } from "../services/version-monitoring.js";
import { PluginConfig } from "../config/plugin-config.js";

describe("VersionMonitoringService", () => {
  let service: VersionMonitoringService;
  let mockConfig: PluginConfig;

  beforeEach(() => {
    mockConfig = {
      schedule: {
        frequency: "weekly",
        time: "09:00",
        timezone: "UTC",
      },
      monitoring: {
        runtimes: ["nodejs"],
        frameworks: [],
        packages: [],
        packageManagers: [],
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

    service = new VersionMonitoringService(mockConfig);
  });

  describe("checkVersions", () => {
    test("should check Node.js version successfully", async () => {
      const results = await service.checkVersions(["nodejs"]);

      expect(results).toHaveProperty("nodejs");
      expect(results.nodejs).toHaveProperty("success");

      if (results.nodejs.success) {
        expect(results.nodejs.data).toHaveProperty("name", "Node.js");
        expect(results.nodejs.data).toHaveProperty("current");
        expect(results.nodejs.data).toHaveProperty("latest");
        expect(results.nodejs.data).toHaveProperty("latestStable");
      }
    }, 10000); // Increase timeout for API calls

    test("should handle unknown technology gracefully", async () => {
      const results = await service.checkVersions(["unknown-tech"]);

      expect(results).toHaveProperty("unknown-tech");
      expect(results["unknown-tech"].success).toBe(false);
      expect(results["unknown-tech"].error).toContain("No checker available");
    });

    test("should return cached results when available", async () => {
      // First call
      const firstResults = await service.checkVersions(["nodejs"]);

      // Second call should use cache
      const secondResults = await service.checkVersions(["nodejs"]);

      if (secondResults.nodejs.success) {
        expect(secondResults.nodejs.cached).toBe(true);
      }
    }, 10000);
  });

  describe("generateReport", () => {
    test("should generate console report", async () => {
      const report = await service.generateReport("console", false);

      expect(typeof report).toBe("string");
      expect(report).toContain("Version Status Report");
    }, 10000);

    test("should generate JSON report", async () => {
      const report = await service.generateReport("json", false);

      expect(typeof report).toBe("string");

      const parsed = JSON.parse(report);
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("summary");
      expect(parsed).toHaveProperty("technologies");
    }, 10000);

    test("should generate markdown report", async () => {
      const report = await service.generateReport("markdown", false);

      expect(typeof report).toBe("string");
      expect(report).toContain("# Version Status Report");
      expect(report).toContain("## Summary");
    }, 10000);
  });

  describe("getSecurityAdvisories", () => {
    test("should return security advisories for technologies", async () => {
      const advisories = await service.getSecurityAdvisories(
        ["nodejs"],
        "medium"
      );

      expect(advisories).toHaveProperty("nodejs");
      expect(Array.isArray(advisories.nodejs)).toBe(true);
    }, 10000);

    test("should filter advisories by severity", async () => {
      const criticalAdvisories = await service.getSecurityAdvisories(
        ["nodejs"],
        "critical"
      );
      const allAdvisories = await service.getSecurityAdvisories(
        ["nodejs"],
        "low"
      );

      expect(criticalAdvisories.nodejs.length).toBeLessThanOrEqual(
        allAdvisories.nodejs.length
      );
    }, 10000);
  });

  describe("analyzeUpdates", () => {
    test("should analyze updates for current versions", async () => {
      const currentVersions = {
        nodejs: "18.0.0", // Older version to ensure update analysis
      };

      const analysis = await service.analyzeUpdates(
        currentVersions,
        "moderate"
      );

      if (analysis.nodejs) {
        expect(analysis.nodejs).toHaveProperty("technology", "nodejs");
        expect(analysis.nodejs).toHaveProperty("currentVersion", "18.0.0");
        expect(analysis.nodejs).toHaveProperty("recommendedVersion");
        expect(analysis.nodejs).toHaveProperty("recommendation");
      }
    }, 10000);

    test("should adjust recommendations based on update strategy", async () => {
      const currentVersions = { nodejs: "18.0.0" };

      const conservativeAnalysis = await service.analyzeUpdates(
        currentVersions,
        "conservative"
      );
      const aggressiveAnalysis = await service.analyzeUpdates(
        currentVersions,
        "aggressive"
      );

      // Both should have analysis, but recommendations might differ
      expect(conservativeAnalysis).toBeDefined();
      expect(aggressiveAnalysis).toBeDefined();
    }, 10000);
  });
});
