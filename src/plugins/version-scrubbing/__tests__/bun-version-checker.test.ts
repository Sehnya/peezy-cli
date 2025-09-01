/**
 * Tests for Bun version checker
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { BunVersionChecker } from "../checkers/bun-version-checker.js";

// Mock the logger
vi.mock("../utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("BunVersionChecker", () => {
  let checker: BunVersionChecker;
  const mockFetch = fetch as Mock;

  beforeEach(() => {
    checker = new BunVersionChecker();
    vi.clearAllMocks();
  });

  describe("parseVersion", () => {
    it("should parse standard Bun versions", () => {
      expect(checker.parseVersion("1.0.15")).toBe("1.0.15");
      expect(checker.parseVersion("v1.0.14")).toBe("1.0.14");
      expect(checker.parseVersion("bun-1.0.13")).toBe("1.0.13");
    });

    it("should parse prerelease versions", () => {
      expect(checker.parseVersion("1.0.0-canary.123")).toBe("1.0.0-canary123");
      expect(checker.parseVersion("0.8.1-beta.1")).toBe("0.8.1-beta1");
    });

    it("should handle various prefixes", () => {
      expect(checker.parseVersion("bun-v1.0.15")).toBe("1.0.15");
      expect(checker.parseVersion("v1.0.15")).toBe("1.0.15");
    });
  });

  describe("compareVersions", () => {
    it("should compare Bun versions correctly", () => {
      expect(checker.compareVersions("1.0.15", "1.0.14")).toBe(1);
      expect(checker.compareVersions("1.0.13", "1.0.15")).toBe(-1);
      expect(checker.compareVersions("1.0.15", "1.0.15")).toBe(0);
    });

    it("should handle major version differences", () => {
      expect(checker.compareVersions("1.0.0", "0.8.1")).toBe(1);
      expect(checker.compareVersions("0.8.1", "1.0.0")).toBe(-1);
    });

    it("should handle prerelease versions", () => {
      expect(checker.compareVersions("1.0.0", "1.0.0-canary123")).toBe(1);
      expect(
        checker.compareVersions("1.0.0-canary124", "1.0.0-canary123")
      ).toBe(1);
    });
  });

  describe("checkVersion", () => {
    it("should successfully fetch Bun version information", async () => {
      const mockReleasesResponse = [
        {
          tag_name: "bun-v1.0.15",
          name: "Bun v1.0.15",
          published_at: "2023-12-01T00:00:00Z",
          draft: false,
          prerelease: false,
          body: "Bug fixes and performance improvements",
          html_url: "https://github.com/oven-sh/bun/releases/tag/bun-v1.0.15",
          assets: [],
        },
        {
          tag_name: "bun-v1.0.14",
          name: "Bun v1.0.14",
          published_at: "2023-11-15T00:00:00Z",
          draft: false,
          prerelease: false,
          body: "Minor bug fixes",
          html_url: "https://github.com/oven-sh/bun/releases/tag/bun-v1.0.14",
          assets: [],
        },
      ];

      const mockTagsResponse = [
        { name: "bun-v1.0.15" },
        { name: "bun-v1.0.14" },
        { name: "bun-v1.0.13" },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockReleasesResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTagsResponse),
        });

      const result = await checker.checkVersion();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe("Bun");
      expect(result.data!.latest).toBe("bun-v1.0.15");
      expect(result.data!.latestStable).toBe("bun-v1.0.15");
    });

    it("should handle API failures gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await checker.checkVersion();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    it("should extract security advisories from release notes", async () => {
      const mockReleasesResponse = [
        {
          tag_name: "bun-v1.0.15",
          name: "Bun v1.0.15",
          published_at: "2023-12-01T00:00:00Z",
          draft: false,
          prerelease: false,
          body: "Security fix for CVE-2023-54321. Critical vulnerability in bundler.",
          html_url: "https://github.com/oven-sh/bun/releases/tag/bun-v1.0.15",
          assets: [],
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockReleasesResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        });

      const result = await checker.checkVersion();

      expect(result.success).toBe(true);
      expect(result.data!.securityAdvisories).toHaveLength(1);
      expect(result.data!.securityAdvisories[0].cveId).toBe("CVE-2023-54321");
      expect(result.data!.securityAdvisories[0].severity).toBe("critical");
    });

    it("should detect breaking changes", async () => {
      const mockReleasesResponse = [
        {
          tag_name: "bun-v1.0.0",
          name: "Bun v1.0.0",
          published_at: "2023-09-08T00:00:00Z",
          draft: false,
          prerelease: false,
          body: "Breaking change: Removed deprecated API. The old bundler API is no longer supported.",
          html_url: "https://github.com/oven-sh/bun/releases/tag/bun-v1.0.0",
          assets: [],
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockReleasesResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        });

      const result = await checker.checkVersion();

      expect(result.success).toBe(true);
      expect(result.data!.breakingChanges).toHaveLength(1);
      expect(result.data!.breakingChanges[0].version).toBe("1.0.0");
      expect(result.data!.breakingChanges[0].description).toContain(
        "Breaking change"
      );
    });

    it("should filter out draft releases", async () => {
      const mockReleasesResponse = [
        {
          tag_name: "bun-v1.0.16",
          name: "Bun v1.0.16",
          published_at: "2023-12-05T00:00:00Z",
          draft: true, // This should be filtered out
          prerelease: false,
          body: "Draft release",
          html_url: "https://github.com/oven-sh/bun/releases/tag/bun-v1.0.16",
          assets: [],
        },
        {
          tag_name: "bun-v1.0.15",
          name: "Bun v1.0.15",
          published_at: "2023-12-01T00:00:00Z",
          draft: false,
          prerelease: false,
          body: "Stable release",
          html_url: "https://github.com/oven-sh/bun/releases/tag/bun-v1.0.15",
          assets: [],
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockReleasesResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        });

      const result = await checker.checkVersion();

      expect(result.success).toBe(true);
      expect(result.data!.latest).toBe("bun-v1.0.15");
    });
  });

  describe("getUpdateRecommendation", () => {
    it("should recommend patch updates", () => {
      const recommendation = checker.getUpdateRecommendation(
        "1.0.14",
        "1.0.15"
      );

      expect(recommendation.priority).toBe("low");
      expect(recommendation.type).toBe("bugfix");
      expect(recommendation.impact).toBe("compatible");
      expect(recommendation.recommendation).toContain("patch release");
    });

    it("should recommend major updates with caution", () => {
      const recommendation = checker.getUpdateRecommendation("0.8.1", "1.0.0");

      expect(recommendation.priority).toBe("medium");
      expect(recommendation.type).toBe("feature");
      expect(recommendation.impact).toBe("breaking");
      expect(recommendation.recommendation).toContain("Major update");
    });

    it("should handle same version", () => {
      const recommendation = checker.getUpdateRecommendation(
        "1.0.15",
        "1.0.15"
      );

      expect(recommendation.priority).toBe("low");
      expect(recommendation.recommendation).toContain("latest version");
    });
  });

  describe("rate limiting", () => {
    it("should respect rate limits", async () => {
      const rateLimitedChecker = new BunVersionChecker({
        maxRequests: 1,
        windowMs: 1000,
        backoffMultiplier: 2,
        maxBackoffMs: 5000,
      });

      // First request should succeed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Second request should be rate limited
      const result1 = await rateLimitedChecker.checkVersion();
      const result2 = await rateLimitedChecker.checkVersion();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain("Rate limit exceeded");
    });
  });
});
