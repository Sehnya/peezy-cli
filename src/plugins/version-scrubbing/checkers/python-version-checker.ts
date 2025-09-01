/**
 * Python version checker implementation
 */

import { BaseVersionChecker } from "./base-version-checker.js";
import {
  CheckResult,
  VersionInfo,
  SecurityAdvisory,
  BreakingChange,
  EOLInfo,
  RateLimitConfig,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

interface PythonRelease {
  version: string;
  release_date: string;
  is_prerelease: boolean;
  resource_uri: string;
}

interface PythonVersionData {
  releases: Record<string, PythonRelease[]>;
}

interface PythonEOLData {
  cycle: string;
  release: string;
  eol: string | boolean;
  latest: string;
  lts: boolean;
  support: string | boolean;
}

export class PythonVersionChecker extends BaseVersionChecker {
  private static readonly PYTHON_API_URL =
    "https://api.python.org/v3/downloads/release/";
  private static readonly EOL_API_URL =
    "https://endoflife.date/api/python.json";
  private static readonly GITHUB_API_URL =
    "https://api.github.com/repos/python/cpython/releases";

  constructor(rateLimit?: RateLimitConfig) {
    super("Python", PythonVersionChecker.PYTHON_API_URL, rateLimit);
  }

  async checkVersion(): Promise<CheckResult> {
    try {
      logger.info("Checking Python versions...");

      // Get version data from multiple sources
      const [versionData, eolData, githubData] = await Promise.allSettled([
        this.fetchPythonVersions(),
        this.fetchEOLData(),
        this.fetchGitHubReleases(),
      ]);

      if (versionData.status === "rejected") {
        logger.error(
          "Failed to fetch Python version data:",
          versionData.reason
        );
        return {
          success: false,
          error: `Failed to fetch Python versions: ${versionData.reason}`,
        };
      }

      const versions = versionData.value;
      const eolInfo = eolData.status === "fulfilled" ? eolData.value : [];
      const releases =
        githubData.status === "fulfilled" ? githubData.value : [];

      // Find latest stable version
      const stableVersions = this.filterStableVersions(versions);
      const latestStable = this.getLatestStable(stableVersions);
      const latest = versions[0] || latestStable;

      // Get EOL information for latest version
      const eolDate = this.getEOLDate(latestStable, eolInfo);

      // Extract security advisories and breaking changes
      const securityAdvisories = this.extractSecurityAdvisories(releases);
      const breakingChanges = this.extractBreakingChanges(releases);

      const versionInfo: VersionInfo = {
        name: "Python",
        current: "", // Will be set by the monitoring service
        latest,
        latestStable,
        eolDate,
        securityAdvisories,
        breakingChanges,
        migrationGuide: this.getMigrationGuideUrl(latestStable),
        releaseNotes: this.getReleaseNotesUrl(latestStable),
        publishedAt: this.getPublishedDate(latestStable, releases),
      };

      logger.info(
        `Python version check completed. Latest stable: ${latestStable}`
      );

      return {
        success: true,
        data: versionInfo,
      };
    } catch (error) {
      logger.error("Python version check failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  parseVersion(versionString: string): string {
    // Remove 'v' prefix and any build metadata
    const cleaned = versionString.replace(/^v?/, "").split("+")[0];

    // Handle Python version format (e.g., "3.12.1", "3.11.0a1", "3.10.0rc1")
    const match = cleaned.match(/^(\d+\.\d+\.\d+)(?:([a-z]+)(\d+))?/);
    if (match) {
      const [, version, preType, preNum] = match;
      if (preType && preNum) {
        // Convert prerelease identifiers to standard format
        const preMap: Record<string, string> = {
          a: "alpha",
          b: "beta",
          rc: "rc",
        };
        return `${version}-${preMap[preType] || preType}${preNum}`;
      }
      return version;
    }

    return cleaned;
  }

  protected getChangelogUrl(version: string): string {
    const majorMinor = version.split(".").slice(0, 2).join(".");
    return `https://docs.python.org/${majorMinor}/whatsnew/${majorMinor}.html`;
  }

  protected getUpdateCommand(version: string): string {
    return `# Update Python to ${version}\n# Visit https://www.python.org/downloads/ for installation instructions\n# Or use a version manager like pyenv:\npyenv install ${version}\npyenv global ${version}`;
  }

  private async fetchPythonVersions(): Promise<string[]> {
    try {
      // Use GitHub API as primary source for Python versions
      const response = await this.makeRequest(
        PythonVersionChecker.GITHUB_API_URL
      );
      const releases = await response.json();

      const versions = releases
        .filter((release: any) => !release.draft)
        .map((release: any) => release.tag_name)
        .filter((tag: string) => /^v?\d+\.\d+\.\d+/.test(tag))
        .sort((a: string, b: string) => this.compareVersions(b, a));

      return versions;
    } catch (error) {
      logger.warn(
        "Failed to fetch from GitHub, trying alternative source:",
        error
      );

      // Fallback to a simpler approach - return known recent versions
      return [
        "3.12.1",
        "3.12.0",
        "3.11.7",
        "3.11.6",
        "3.11.5",
        "3.10.13",
        "3.10.12",
        "3.10.11",
        "3.9.18",
        "3.9.17",
        "3.9.16",
        "3.8.18",
        "3.8.17",
        "3.8.16",
      ];
    }
  }

  private async fetchEOLData(): Promise<PythonEOLData[]> {
    try {
      const response = await this.makeRequest(PythonVersionChecker.EOL_API_URL);
      return await response.json();
    } catch (error) {
      logger.warn("Failed to fetch Python EOL data:", error);
      return [];
    }
  }

  private async fetchGitHubReleases(): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        PythonVersionChecker.GITHUB_API_URL
      );
      return await response.json();
    } catch (error) {
      logger.warn("Failed to fetch Python GitHub releases:", error);
      return [];
    }
  }

  private getEOLDate(
    version: string,
    eolData: PythonEOLData[]
  ): Date | undefined {
    const majorMinor = version.split(".").slice(0, 2).join(".");
    const eolInfo = eolData.find((info) => info.cycle === majorMinor);

    if (eolInfo && typeof eolInfo.eol === "string") {
      return new Date(eolInfo.eol);
    }

    return undefined;
  }

  protected extractSecurityAdvisories(releases: any[]): SecurityAdvisory[] {
    const advisories: SecurityAdvisory[] = [];

    for (const release of releases) {
      if (release.body && release.body.toLowerCase().includes("security")) {
        // Look for CVE references in release notes
        const cveMatches = release.body.match(/CVE-\d{4}-\d{4,}/g) || [];

        for (const cve of cveMatches) {
          advisories.push({
            id: `python-${release.tag_name}-${cve}`,
            severity: this.determineSeverityFromText(release.body),
            affectedVersions: this.extractAffectedVersions(release.body),
            fixedVersion: release.tag_name,
            description: `Security fix in Python ${release.tag_name}`,
            cveId: cve,
            publishedAt: new Date(release.published_at),
            references: [release.html_url],
          });
        }
      }
    }

    return advisories;
  }

  protected extractBreakingChanges(releases: any[]): BreakingChange[] {
    const breakingChanges: BreakingChange[] = [];

    for (const release of releases) {
      if (release.body) {
        const body = release.body.toLowerCase();

        // Look for breaking change indicators
        if (
          body.includes("breaking") ||
          body.includes("incompatible") ||
          body.includes("removed") ||
          body.includes("deprecated")
        ) {
          const version = this.parseVersion(release.tag_name);
          const majorVersion = version.split(".")[0];

          // Major version changes are likely to have breaking changes
          if (this.isMajorVersionChange(version)) {
            breakingChanges.push({
              version,
              description: `Major version update with potential breaking changes`,
              migrationGuide: this.getMigrationGuideUrl(version),
              affectedFeatures: this.extractAffectedFeatures(release.body),
              workarounds: [],
            });
          }
        }
      }
    }

    return breakingChanges;
  }

  private determineSeverityFromText(
    text: string
  ): "critical" | "high" | "medium" | "low" {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("critical") ||
      lowerText.includes("remote code execution")
    ) {
      return "critical";
    }
    if (
      lowerText.includes("high") ||
      lowerText.includes("privilege escalation")
    ) {
      return "high";
    }
    if (
      lowerText.includes("medium") ||
      lowerText.includes("information disclosure")
    ) {
      return "medium";
    }

    return "low";
  }

  private extractAffectedVersions(text: string): string[] {
    // Simple extraction - in practice, this would be more sophisticated
    const versionMatches = text.match(/\d+\.\d+\.\d+/g) || [];
    return [...new Set(versionMatches)];
  }

  private extractAffectedFeatures(text: string): string[] {
    // Extract feature names from release notes
    const features: string[] = [];

    // Look for common Python feature patterns
    const patterns = [
      /\b(asyncio|typing|dataclasses|pathlib|json|urllib|ssl|socket)\b/gi,
      /\b(f-strings?|walrus operator|match statements?)\b/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      features.push(...matches.map((m) => m.toLowerCase()));
    }

    return [...new Set(features)];
  }

  private isMajorVersionChange(version: string): boolean {
    const parts = version.split(".");
    return parts.length >= 2 && parts[1] === "0" && parts[2] === "0";
  }

  private getMigrationGuideUrl(version: string): string {
    const majorMinor = version.split(".").slice(0, 2).join(".");
    return `https://docs.python.org/${majorMinor}/whatsnew/${majorMinor}.html#porting-to-python-${majorMinor.replace(".", "")}`;
  }

  private getReleaseNotesUrl(version: string): string {
    const majorMinor = version.split(".").slice(0, 2).join(".");
    return `https://docs.python.org/${majorMinor}/whatsnew/${majorMinor}.html`;
  }

  private getPublishedDate(version: string, releases: any[]): Date | undefined {
    const release = releases.find(
      (r) => r.tag_name === version || r.tag_name === `v${version}`
    );
    return release ? new Date(release.published_at) : undefined;
  }
}
