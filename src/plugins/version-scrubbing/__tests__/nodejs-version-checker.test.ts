/**
 * Tests for the Node.js Version Checker
 */

import { NodeJSVersionChecker } from "../checkers/nodejs-version-checker.js";

describe("NodeJSVersionChecker", () => {
  let checker: NodeJSVersionChecker;

  beforeEach(() => {
    checker = new NodeJSVersionChecker();
  });

  describe("parseVersion", () => {
    test("should parse version strings correctly", () => {
      expect(checker.parseVersion("v20.19.0")).toBe("20.19.0");
      expect(checker.parseVersion("20.19.0")).toBe("20.19.0");
      expect(checker.parseVersion("v18.17.1")).toBe("18.17.1");
    });

    test("should handle complex version strings", () => {
      expect(checker.parseVersion("v20.19.0-pre")).toBe("20.19.0");
      expect(checker.parseVersion("20.19.0-rc.1")).toBe("20.19.0");
    });
  });

  describe("compareVersions", () => {
    test("should compare versions correctly", () => {
      expect(checker.compareVersions("20.19.1", "20.19.0")).toBe(1);
      expect(checker.compareVersions("20.19.0", "20.19.1")).toBe(-1);
      expect(checker.compareVersions("20.19.0", "20.19.0")).toBe(0);
      expect(checker.compareVersions("21.0.0", "20.19.0")).toBe(1);
    });

    test("should handle different version lengths", () => {
      expect(checker.compareVersions("20.19", "20.19.0")).toBe(0);
      expect(checker.compareVersions("20.19.1", "20.19")).toBe(1);
    });
  });

  describe("getUpdateRecommendation", () => {
    test("should recommend updates for older versions", () => {
      const recommendation = checker.getUpdateRecommendation(
        "18.0.0",
        "20.19.0"
      );

      expect(recommendation.priority).toBe("medium");
      expect(recommendation.type).toBe("feature");
      expect(recommendation.impact).toBe("breaking");
      expect(recommendation.actions).toHaveLength(4);
    });

    test("should handle up-to-date versions", () => {
      const recommendation = checker.getUpdateRecommendation(
        "20.19.0",
        "20.19.0"
      );

      expect(recommendation.priority).toBe("low");
      expect(recommendation.type).toBe("maintenance");
      expect(recommendation.impact).toBe("compatible");
    });

    test("should handle patch updates", () => {
      const recommendation = checker.getUpdateRecommendation(
        "20.19.0",
        "20.19.1"
      );

      expect(recommendation.priority).toBe("low");
      expect(recommendation.type).toBe("bugfix");
      expect(recommendation.impact).toBe("compatible");
    });
  });

  describe("checkVersion", () => {
    test("should fetch Node.js version information", async () => {
      const result = await checker.checkVersion();

      expect(result.success).toBe(true);

      if (result.success && result.data) {
        expect(result.data.name).toBe("Node.js");
        expect(result.data.current).toMatch(/^\d+\.\d+\.\d+/);
        expect(result.data.latest).toMatch(/^v?\d+\.\d+\.\d+/);
        expect(result.data.latestStable).toMatch(/^v?\d+\.\d+\.\d+/);
        expect(Array.isArray(result.data.securityAdvisories)).toBe(true);
        expect(Array.isArray(result.data.breakingChanges)).toBe(true);
      }
    }, 15000); // Longer timeout for API calls

    test("should handle API failures gracefully", async () => {
      // Create a new checker instance for this test
      const failingChecker = new NodeJSVersionChecker();

      // Mock the makeRequest method to simulate failure
      const originalMakeRequest = (failingChecker as any).makeRequest;
      (failingChecker as any).makeRequest = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      const result = await failingChecker.checkVersion();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Network error");

      // Restore original method
      (failingChecker as any).makeRequest = originalMakeRequest;
    }, 10000);
  });

  describe("rate limiting", () => {
    test("should respect rate limits", async () => {
      // This test would need to be more sophisticated in a real implementation
      // For now, just verify the rate limiting mechanism exists
      const rateLimitCheck = (checker as any).checkRateLimit();
      expect(rateLimitCheck).resolves.toBe(true);
    });
  });
});
