/**
 * Tests for Package Manager version checker
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { PackageManagerVersionChecker } from "../checkers/package-manager-version-checker.js";

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

describe("PackageManagerVersionChecker", () => {
  const mockFetch = fetch as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("npm", () => {
    let checker: PackageManagerVersionChecker;

    beforeEach(() => {
      checker = new PackageManagerVersionChecker("npm");
    });

    describe("parseVersion", () => {
      it("should parse standard npm versions", () => {
        expect(checker.parseVersion("10.2.4")).toBe("10.2.4");
        expect(checker.parseVersion("v9.8.1")).toBe("9.8.1");
      });

      it("should parse prerelease versions", () => {
        expect(checker.parseVersion("10.0.0-beta.1")).toBe("10.0.0-beta1");
        expect(checker.parseVersion("9.9.0-rc.1")).toBe("9.9.0-rc1");
      });
    });

    describe("checkVersion", () => {
      it("should successfully fetch npm version information", async () => {
        const mockRegistryResponse = {
          "dist-tags": {
            latest: "10.2.4",
            beta: "10.3.0-beta.1",
          },
          versions: {
            "10.2.4": {
              version: "10.2.4",
              dist: {
                tarball: "https://registry.npmjs.org/npm/-/npm-10.2.4.tgz",
              },
              engines: { node: "^18.17.0 || >=20.5.0" },
            },
            "10.2.3": {
              version: "10.2.3",
              dist: {
                tarball: "https://registry.npmjs.org/npm/-/npm-10.2.3.tgz",
              },
            },
          },
          time: {
            "10.2.4": "2023-12-01T00:00:00.000Z",
            "10.2.3": "2023-11-15T00:00:00.000Z",
          },
        };

        const mockGitHubResponse = [
          {
            tag_name: "v10.2.4",
            name: "npm v10.2.4",
            published_at: "2023-12-01T00:00:00Z",
            draft: false,
            prerelease: false,
            body: "Bug fixes and improvements",
            html_url: "https://github.com/npm/cli/releases/tag/v10.2.4",
          },
        ];

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRegistryResponse),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockGitHubResponse),
          });

        const result = await checker.checkVersion();

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.name).toBe("NPM");
        expect(result.data!.latest).toBe("10.2.4");
        expect(result.data!.latestStable).toBe("10.2.4");
      });

      it("should handle registry API failures", async () => {
        mockFetch.mockRejectedValue(new Error("Registry unavailable"));

        const result = await checker.checkVersion();

        expect(result.success).toBe(false);
        expect(result.error).toContain("Registry unavailable");
      });
    });

    describe("getCompatibilityInfo", () => {
      it("should return npm compatibility information", () => {
        const compatibility = checker.getCompatibilityInfo();
        expect(compatibility.node).toEqual([">=14.0.0"]);
      });
    });
  });

  describe("pnpm", () => {
    let checker: PackageManagerVersionChecker;

    beforeEach(() => {
      checker = new PackageManagerVersionChecker("pnpm");
    });

    describe("checkVersion", () => {
      it("should successfully fetch pnpm version information", async () => {
        const mockRegistryResponse = {
          "dist-tags": {
            latest: "8.12.1",
          },
          versions: {
            "8.12.1": {
              version: "8.12.1",
              dist: {
                tarball: "https://registry.npmjs.org/pnpm/-/pnpm-8.12.1.tgz",
              },
              engines: { node: ">=16.14" },
            },
          },
          time: {
            "8.12.1": "2023-12-01T00:00:00.000Z",
          },
        };

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRegistryResponse),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([]),
          });

        const result = await checker.checkVersion();

        expect(result.success).toBe(true);
        expect(result.data!.name).toBe("PNPM");
        expect(result.data!.latest).toBe("8.12.1");
      });
    });

    describe("getCompatibilityInfo", () => {
      it("should return pnpm compatibility information", () => {
        const compatibility = checker.getCompatibilityInfo();
        expect(compatibility.node).toEqual([">=16.14.0"]);
      });
    });
  });

  describe("yarn", () => {
    let checker: PackageManagerVersionChecker;

    beforeEach(() => {
      checker = new PackageManagerVersionChecker("yarn");
    });

    describe("checkVersion", () => {
      it("should successfully fetch yarn version information", async () => {
        const mockRegistryResponse = {
          "dist-tags": {
            latest: "1.22.21",
          },
          versions: {
            "1.22.21": {
              version: "1.22.21",
              dist: {
                tarball: "https://registry.npmjs.org/yarn/-/yarn-1.22.21.tgz",
              },
            },
          },
          time: {
            "1.22.21": "2023-11-01T00:00:00.000Z",
          },
        };

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRegistryResponse),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([]),
          });

        const result = await checker.checkVersion();

        expect(result.success).toBe(true);
        expect(result.data!.name).toBe("YARN");
        expect(result.data!.latest).toBe("1.22.21");
      });
    });

    describe("getCompatibilityInfo", () => {
      it("should return yarn compatibility information", () => {
        const compatibility = checker.getCompatibilityInfo();
        expect(compatibility.node).toEqual([">=14.15.0"]);
      });
    });
  });

  describe("pip", () => {
    let checker: PackageManagerVersionChecker;

    beforeEach(() => {
      checker = new PackageManagerVersionChecker("pip");
    });

    describe("checkVersion", () => {
      it("should successfully fetch pip version information", async () => {
        const mockGitHubResponse = [
          {
            tag_name: "23.3.1",
            name: "pip 23.3.1",
            published_at: "2023-12-01T00:00:00Z",
            draft: false,
            prerelease: false,
            body: "Bug fixes and improvements",
            html_url: "https://github.com/pypa/pip/releases/tag/23.3.1",
          },
          {
            tag_name: "23.3",
            name: "pip 23.3",
            published_at: "2023-11-15T00:00:00Z",
            draft: false,
            prerelease: false,
            body: "New features",
            html_url: "https://github.com/pypa/pip/releases/tag/23.3",
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGitHubResponse),
        });

        const result = await checker.checkVersion();

        expect(result.success).toBe(true);
        expect(result.data!.name).toBe("PIP");
        expect(result.data!.latest).toBe("23.3.1");
      });

      it("should extract security advisories from pip releases", async () => {
        const mockGitHubResponse = [
          {
            tag_name: "23.3.1",
            name: "pip 23.3.1",
            published_at: "2023-12-01T00:00:00Z",
            draft: false,
            prerelease: false,
            body: "Security fix for CVE-2023-99999. Critical vulnerability in package installation.",
            html_url: "https://github.com/pypa/pip/releases/tag/23.3.1",
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGitHubResponse),
        });

        const result = await checker.checkVersion();

        expect(result.success).toBe(true);
        expect(result.data!.securityAdvisories).toHaveLength(1);
        expect(result.data!.securityAdvisories[0].cveId).toBe("CVE-2023-99999");
        expect(result.data!.securityAdvisories[0].severity).toBe("critical");
      });
    });

    describe("getCompatibilityInfo", () => {
      it("should return pip compatibility information", () => {
        const compatibility = checker.getCompatibilityInfo();
        expect(compatibility.python).toEqual([">=3.7"]);
      });
    });
  });

  describe("compareVersions", () => {
    let checker: PackageManagerVersionChecker;

    beforeEach(() => {
      checker = new PackageManagerVersionChecker("npm");
    });

    it("should compare package manager versions correctly", () => {
      expect(checker.compareVersions("10.2.4", "10.2.3")).toBe(1);
      expect(checker.compareVersions("9.8.1", "10.0.0")).toBe(-1);
      expect(checker.compareVersions("8.19.4", "8.19.4")).toBe(0);
    });

    it("should handle prerelease versions", () => {
      expect(checker.compareVersions("10.0.0", "10.0.0-beta1")).toBe(1);
      expect(checker.compareVersions("10.0.0-rc1", "10.0.0-beta1")).toBe(1);
    });
  });

  describe("getUpdateRecommendation", () => {
    let checker: PackageManagerVersionChecker;

    beforeEach(() => {
      checker = new PackageManagerVersionChecker("npm");
    });

    it("should recommend patch updates", () => {
      const recommendation = checker.getUpdateRecommendation(
        "10.2.3",
        "10.2.4"
      );

      expect(recommendation.priority).toBe("low");
      expect(recommendation.type).toBe("bugfix");
      expect(recommendation.impact).toBe("compatible");
      expect(recommendation.recommendation).toContain("patch release");
    });

    it("should recommend major updates with caution", () => {
      const recommendation = checker.getUpdateRecommendation("9.8.1", "10.0.0");

      expect(recommendation.priority).toBe("medium");
      expect(recommendation.type).toBe("feature");
      expect(recommendation.impact).toBe("breaking");
      expect(recommendation.recommendation).toContain("Major update");
    });
  });

  describe("rate limiting", () => {
    it("should respect rate limits", async () => {
      const rateLimitedChecker = new PackageManagerVersionChecker("npm", {
        maxRequests: 1,
        windowMs: 1000,
        backoffMultiplier: 2,
        maxBackoffMs: 5000,
      });

      // First request should succeed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            "dist-tags": { latest: "10.2.4" },
            versions: { "10.2.4": { version: "10.2.4" } },
            time: { "10.2.4": "2023-12-01T00:00:00.000Z" },
          }),
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
