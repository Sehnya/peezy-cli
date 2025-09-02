/**
 * Bun version checker implementation
 */

import { BaseVersionChecker } from "./base-version-checker.js";
import {
  CheckResult,
  VersionInfo,
  SecurityAdvisory,
  BreakingChange,
  RateLimitConfig,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

interface BunRelease {
  tag_name: string;
  name: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  body: string;
  html_url: string;
  assets: Array<{
    name: string;
    download_count: number;
    browser_download_url: string;
  }>;
}

export class BunVersionChecker extends BaseVersionChecker {
  private static readonly GITHUB_API_URL =
    "https://api.github.com/repos/oven-sh/bun/releases";
  private static readonly GITHUB_TAGS_URL =
    "https://api.github.com/repos/oven-sh/bun/tags";

  constructor(rateLimit?: RateLimitConfig) {
    super("Bun", BunVersionChecker.GITHUB_API_URL, rateLimit);
  }

  async checkVersion(): Promise<CheckResult> {
    try {
      logger.info("Checking Bun versions...");

      // Get release data from GitHub
      const [releasesData, tagsData] = await Promise.allSettled([
        this.fetchBunReleases(),
        this.fetchBunTags(),
      ]);

      if (releasesData.status === "rejected") {
        logger.error("Failed to fetch Bun release data:", releasesData.reason);
        return {
          success: false,
          error: `Failed to fetch Bun releases: ${releasesData.reason}`,
        };
      }

      const releases = releasesData.value;
      const tags = tagsData.status === "fulfilled" ? tagsData.value : [];

      // Extract version numbers from releases and tags
      const releaseVersions = releases
        .filter((release) => !release.draft)
        .map((release) => release.tag_name);

      const tagVersions = tags.map((tag: any) => tag.name);

      // Combine and deduplicate versions
      const allVersions = [...new Set([...releaseVersions, ...tagVersions])]
        .filter((version) => this.isValidBunVersion(version))
        .sort((a, b) => this.compareVersions(b, a));

      if (allVersions.length === 0) {
        const versionInfo: VersionInfo = {
          name: "Bun",
          current: "",
          latest: "",
          latestStable: "",
          eolDate: undefined,
          securityAdvisories: [],
          breakingChanges: [],
          migrationGuide: this.getMigrationGuideUrl(""),
          releaseNotes: this.getReleaseNotesUrl(""),
          publishedAt: undefined,
        };
        logger.info("Bun version check completed. Latest stable:");
        return { success: true, data: versionInfo };
      }

      // Find latest stable version
      const stableVersions = this.filterStableVersions(allVersions);
      const latestStable = this.getLatestStable(stableVersions);
      const latest = allVersions[0];

      // Extract security advisories and breaking changes
      const securityAdvisories = this.extractSecurityAdvisories(releases);
      const breakingChanges = this.extractBreakingChanges(releases);

      const versionInfo: VersionInfo = {
        name: "Bun",
        current: "", // Will be set by the monitoring service
        latest,
        latestStable,
        eolDate: undefined, // Bun doesn't have formal EOL dates yet
        securityAdvisories,
        breakingChanges,
        migrationGuide: this.getMigrationGuideUrl(latestStable),
        releaseNotes: this.getReleaseNotesUrl(latestStable),
        publishedAt: this.getPublishedDate(latestStable, releases),
      };

      logger.info(
        `Bun version check completed. Latest stable: ${latestStable}`
      );

      return {
        success: true,
        data: versionInfo,
      };
    } catch (error) {
      logger.error("Bun version check failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  parseVersion(versionString: string): string {
    // Remove 'bun-' prefix and 'v' prefix if present
    let cleaned = versionString.replace(/^(bun-)?v?/, "");

    // Handle Bun's version format (e.g., "1.0.15", "1.0.0-canary.123", "0.8.1")
    const match = cleaned.match(/^(\d+\.\d+\.\d+)(?:-([a-z]+)\.?(\d+))?/);
    if (match) {
      const [, version, preType, preNum] = match;
      if (preType && preNum) {
        return `${version}-${preType}${preNum}`;
      }
      return version;
    }

    return cleaned;
  }

  protected getChangelogUrl(version: string): string {
    return `https://github.com/oven-sh/bun/releases/tag/${version}`;
  }

  protected getUpdateCommand(version: string): string {
    return `# Update Bun to ${version}\ncurl -fsSL https://bun.sh/install | bash\n# Or using npm:\nnpm install -g bun@${version}`;
  }

  private async fetchBunReleases(): Promise<BunRelease[]> {
    const response = await this.makeRequest(BunVersionChecker.GITHUB_API_URL);
    return await response.json();
  }

  private async fetchBunTags(): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        BunVersionChecker.GITHUB_TAGS_URL
      );
      return await response.json();
    } catch (error) {
      logger.warn("Failed to fetch Bun tags:", error);
      return [];
    }
  }

  private isValidBunVersion(version: string): boolean {
    // Check if it's a valid Bun version format
    const cleaned = this.parseVersion(version);
    return /^\d+\.\d+\.\d+/.test(cleaned);
  }

  protected extractSecurityAdvisories(
    releases: BunRelease[]
  ): SecurityAdvisory[] {
    const advisories: SecurityAdvisory[] = [];

    for (const release of releases) {
      if (release.body && release.body.toLowerCase().includes("security")) {
        // Look for CVE references or security-related keywords
        const securityKeywords = [
          "vulnerability",
          "exploit",
          "security fix",
          "security patch",
          "cve-",
          "security issue",
          "security update",
        ];

        const hasSecurityContent = securityKeywords.some((keyword) =>
          release.body.toLowerCase().includes(keyword)
        );

        if (hasSecurityContent) {
          const cveMatches = release.body.match(/CVE-\d{4}-\d{4,}/gi) || [];

          if (cveMatches.length > 0) {
            for (const cve of cveMatches) {
              advisories.push({
                id: `bun-${release.tag_name}-${cve}`,
                severity: this.determineSeverityFromText(release.body),
                affectedVersions: this.extractAffectedVersions(release.body),
                fixedVersion: release.tag_name,
                description: `Security fix in Bun ${release.tag_name}`,
                cveId: cve,
                publishedAt: new Date(release.published_at),
                references: [release.html_url],
              });
            }
          } else {
            // Generic security advisory without specific CVE
            advisories.push({
              id: `bun-${release.tag_name}-security`,
              severity: this.determineSeverityFromText(release.body),
              affectedVersions: this.extractAffectedVersions(release.body),
              fixedVersion: release.tag_name,
              description: `Security improvements in Bun ${release.tag_name}`,
              publishedAt: new Date(release.published_at),
              references: [release.html_url],
            });
          }
        }
      }
    }

    return advisories;
  }

  protected extractBreakingChanges(releases: BunRelease[]): BreakingChange[] {
    const breakingChanges: BreakingChange[] = [];

    for (const release of releases) {
      if (release.body) {
        const body = release.body.toLowerCase();

        // Look for breaking change indicators
        const breakingKeywords = [
          "breaking change",
          "breaking:",
          "breaking changes",
          "incompatible",
          "removed",
          "deprecated",
          "no longer",
          "changed behavior",
        ];

        const hasBreakingChanges = breakingKeywords.some((keyword) =>
          body.includes(keyword)
        );

        if (hasBreakingChanges || this.isMajorVersionChange(release.tag_name)) {
          const version = this.parseVersion(release.tag_name);

          breakingChanges.push({
            version,
            description: this.extractBreakingChangeDescription(release.body),
            migrationGuide: this.getMigrationGuideUrl(version),
            affectedFeatures: this.extractAffectedFeatures(release.body),
            workarounds: this.extractWorkarounds(release.body),
          });
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
    const versionMatches = text.match(/\d+\.\d+\.\d+/g) || [];
    return [...new Set(versionMatches)];
  }

  private extractBreakingChangeDescription(body: string): string {
    // Extract the first sentence or paragraph that mentions breaking changes
    const lines = body.split("\n");

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes("breaking") ||
        lowerLine.includes("incompatible")
      ) {
        return line.trim();
      }
    }

    return "Breaking changes detected in this release";
  }

  private extractAffectedFeatures(text: string): string[] {
    const features: string[] = [];

    // Look for common Bun feature patterns
    const patterns = [
      /\b(bundler|runtime|package manager|transpiler|test runner)\b/gi,
      /\b(bun run|bun install|bun build|bun test|bun create)\b/gi,
      /\b(jsx|typescript|css|sass|less)\b/gi,
      /\b(node_modules|package\.json|tsconfig\.json)\b/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      features.push(...matches.map((m) => m.toLowerCase()));
    }

    return [...new Set(features)];
  }

  private extractWorkarounds(text: string): string[] {
    const workarounds: string[] = [];

    // Look for workaround patterns in release notes
    const workaroundPatterns = [
      /workaround:?\s*([^\n]+)/gi,
      /alternatively:?\s*([^\n]+)/gi,
      /you can:?\s*([^\n]+)/gi,
    ];

    for (const pattern of workaroundPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          workarounds.push(match[1].trim());
        }
      }
    }

    return workarounds;
  }

  private isMajorVersionChange(version: string): boolean {
    const parsed = this.parseVersion(version);
    const parts = parsed.split(".");

    // For Bun, consider 1.0.0 and above as stable, with major changes at x.0.0
    if (parts.length >= 3) {
      return parts[1] === "0" && parts[2] === "0" && parseInt(parts[0]) > 0;
    }

    return false;
  }

  private getMigrationGuideUrl(version: string): string {
    return `https://github.com/oven-sh/bun/releases/tag/${version}`;
  }

  private getReleaseNotesUrl(version: string): string {
    return `https://github.com/oven-sh/bun/releases/tag/${version}`;
  }

  private getPublishedDate(
    version: string,
    releases: BunRelease[]
  ): Date | undefined {
    const release = releases.find(
      (r) =>
        r.tag_name === version ||
        r.tag_name === `v${version}` ||
        r.tag_name === `bun-${version}`
    );
    return release ? new Date(release.published_at) : undefined;
  }
}
