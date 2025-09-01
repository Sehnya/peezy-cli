/**
 * Tests for Python version checker
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { PythonVersionChecker } from "../checkers/python-version-checker.js";

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

describe("PythonVersionChecker", () => {
  let checker: PythonVersionChecker;
  const mockFetch = fetch as Mock;

  beforeEach(() => {
    checker = new PythonVersionChecker();
    vi.clearAllMocks();
  });

  describe("parseVersion", () => {
    it("should parse standard Python versions", () => {
      expect(checker.parseVersion("3.12.1")).toBe("3.12.1");
      expect(checker.parseVersion("v3.11.0")).toBe("3.11.0");
      expect(checker.parseVersion("3.10.5")).toBe("3.10.5");
    });

    it("should parse prerelease versions", () => {
      expect(checker.parseVersion("3.12.0a1")).toBe("3.12.0-alpha1");
      expect(checker.parseVersion("3.11.0b2")).toBe("3.11.0-beta2");
      expect(checker.parseVersion("3.10.0rc1")).toBe("3.10.0-rc1");
    });

    it("should handle version with build metadata", () => {
      expect(checker.parseVersion("3.12.1+build.123")).toBe("3.12.1");
    });
  });

  describe("compareVersions", () => {
    it("should compare Python versions correctly", () => {
      expect(checker.compareVersions("3.12.1", "3.12.0")).toBe(1);
      expect(checker.compareVersions("3.11.0", "3.12.0")).toBe(-1);
      expect(checker.compareVersions("3.12.0", "3.12.0")).toBe(0);
    });

    it("should handle prerelease versions", () => {
      expect(checker.compareVersions("3.12.0", "3.12.0-alpha1")).toBe(1);
      expect(checker.compareVersions("3.12.0-beta1", "3.12.0-alpha1")).toBe(1);
    });
  });

  describe("checkVersion", () => {
    it("should successfully fetch Python version information", async () => {
      const mockGitHubResponse = [
        {
          tag_name: "v3.12.1",
          published_at: "2023-12-07T00:00:00Z",
          draft: false,
          body: "Bug fixes and improvements",
          html_url: "https://github.com/python/cpython/releases/tag/v3.12.1",
        },
        {
          tag_name: "v3.12.0",
          published_at: "2023-10-02T00:00:00Z",
          draft: false,
          body: "Major release with new features",
          html_url: "https://github.com/python/cpython/releases/tag/v3.12.0",
        },
      ];

      const mockEOLResponse = [
        {
          cycle: "3.12",
          release: "2023-10-02",
          eol: "2028-10-02",
          latest: "3.12.1",
          lts: false,
          support: "2024-10-02",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGitHubResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEOLResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGitHubResponse),
        });

      const result = await checker.checkVersion();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe("Python");
      expect(result.data!.latest).toBe("v3.12.1");
      expect(result.data!.latestStable).toBe("v3.12.1");
      expect(result.data!.eolDate).toEqual(new Date("2028-10-02"));
    });

    it("should handle API failures gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await checker.checkVersion();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    it("should extract security advisories from release notes", async () => {
      const mockGitHubResponse = [
        {
          tag_name: "v3.12.1",
          published_at: "2023-12-07T00:00:00Z",
          draft: false,
          body: "Security fix for CVE-2023-12345. Critical vulnerability in urllib module.",
          html_url: "https://github.com/python/cpython/releases/tag/v3.12.1",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGitHubResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGitHubResponse),
        });

      const result = await checker.checkVersion();

      expect(result.success).toBe(true);
      expect(result.data!.securityAdvisories).toHaveLength(1);
      expect(result.data!.securityAdvisories[0].cveId).toBe("CVE-2023-12345");
      expect(result.data!.securityAdvisories[0].severity).toBe("critical");
    });
  });

  describe("getUpdateRecommendation", () => {
    it("should recommend patch updates", () => {
      const recommendation = checker.getUpdateRecommendation(
        "3.12.0",
        "3.12.1"
      );

      expect(recommendation.priority).toBe("low");
      expect(recommendation.type).toBe("bugfix");
      expect(recommendation.impact).toBe("compatible");
      expect(recommendation.recommendation).toContain("patch release");
    });

    it("should recommend minor updates", () => {
      const recommendation = checker.getUpdateRecommendation(
        "3.11.5",
        "3.12.0"
      );

      expect(recommendation.priority).toBe("medium");
      expect(recommendation.type).toBe("feature");
      expect(recommendation.impact).toBe("breaking");
      expect(recommendation.recommendation).toContain("Major update");
    });

    it("should handle same version", () => {
      const recommendation = checker.getUpdateRecommendation(
        "3.12.1",
        "3.12.1"
      );

      expect(recommendation.priority).toBe("low");
      expect(recommendation.recommendation).toContain("latest version");
    });
  });

  describe("rate limiting", () => {
    it("should respect rate limits", async () => {
      const rateLimitedChecker = new PythonVersionChecker({
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
