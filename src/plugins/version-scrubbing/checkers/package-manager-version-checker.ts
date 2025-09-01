/**
 * Package manager version checker implementation
 */

import { BaseVersionChecker } from "./base-version-checker.js";
import {
  CheckResult,
  VersionInfo,
  SecurityAdvisory,
  BreakingChange,
  RateLimitConfig,
  PackageManagerInfo,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

interface NpmRegistryResponse {
  "dist-tags": {
    latest: string;
    beta?: string;
    next?: string;
  };
  versions: Record<
    string,
    {
      version: string;
      dist: {
        tarball: string;
      };
      engines?: {
        node?: string;
      };
    }
  >;
  time: Record<string, string>;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  body: string;
  html_url: string;
}

export type PackageManagerType = "npm" | "pnpm" | "yarn" | "pip";

export class PackageManagerVersionChecker extends BaseVersionChecker {
  private packageManager: PackageManagerType;
  private static readonly ENDPOINTS = {
    npm: "https://registry.npmjs.org/npm",
    pnpm: "https://registry.npmjs.org/pnpm",
    yarn: "https://registry.npmjs.org/yarn",
    pip: "https://api.github.com/repos/pypa/pip/releases",
  };

  private static readonly GITHUB_ENDPOINTS = {
    npm: "https://api.github.com/repos/npm/cli/releases",
    pnpm: "https://api.github.com/repos/pnpm/pnpm/releases",
    yarn: "https://api.github.com/repos/yarnpkg/yarn/releases",
    pip: "https://api.github.com/repos/pypa/pip/releases",
  };

  constructor(packageManager: PackageManagerType, rateLimit?: RateLimitConfig) {
    super(
      packageManager.toUpperCase(),
      PackageManagerVersionChecker.ENDPOINTS[packageManager],
      rateLimit
    );
    this.packageManager = packageManager;
  }

  async checkVersion(): Promise<CheckResult> {
    try {
      logger.info(`Checking ${this.packageManager} versions...`);

      let versionData: VersionInfo;

      if (this.packageManager === "pip") {
        versionData = await this.checkPipVersion();
      } else {
        versionData = await this.checkNpmBasedPackageManager();
      }

      logger.info(
        `${this.packageManager} version check completed. Latest stable: ${versionData.latestStable}`
      );

      return {
        success: true,
        data: versionData,
      };
    } catch (error) {
      logger.error(`${this.packageManager} version check failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  parseVersion(versionString: string): string {
    // Remove 'v' prefix and any build metadata
    const cleaned = versionString.replace(/^v?/, "").split("+")[0];

    // Handle various package manager version formats
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
    const urls = {
      npm: `https://github.com/npm/cli/releases/tag/v${version}`,
      pnpm: `https://github.com/pnpm/pnpm/releases/tag/v${version}`,
      yarn: `https://github.com/yarnpkg/yarn/releases/tag/v${version}`,
      pip: `https://github.com/pypa/pip/releases/tag/${version}`,
    };

    return urls[this.packageManager];
  }

  protected getUpdateCommand(version: string): string {
    const commands = {
      npm: `npm install -g npm@${version}`,
      pnpm: `npm install -g pnpm@${version}`,
      yarn: `npm install -g yarn@${version}`,
      pip: `python -m pip install --upgrade pip==${version}`,
    };

    return commands[this.packageManager];
  }

  private async checkNpmBasedPackageManager(): Promise<VersionInfo> {
    // Get data from npm registry and GitHub
    const [registryData, githubData] = await Promise.allSettled([
      this.fetchFromNpmRegistry(),
      this.fetchFromGitHub(),
    ]);

    if (registryData.status === "rejected") {
      throw new Error(
        `Failed to fetch ${this.packageManager} registry data: ${registryData.reason}`
      );
    }

    const registry = registryData.value;
    const releases = githubData.status === "fulfilled" ? githubData.value : [];

    // Extract versions
    const latest = registry["dist-tags"].latest;
    const allVersions = Object.keys(registry.versions)
      .filter((version) => this.isValidVersion(version))
      .sort((a, b) => this.compareVersions(b, a));

    const stableVersions = this.filterStableVersions(allVersions);
    const latestStable = this.getLatestStable(stableVersions);

    // Get compatibility information
    const compatibleRuntimes = this.extractCompatibleRuntimes(
      registry,
      latestStable
    );

    // Extract security advisories and breaking changes
    const securityAdvisories = this.extractSecurityAdvisories(releases);
    const breakingChanges = this.extractBreakingChanges(releases);

    return {
      name: this.packageManager.toUpperCase(),
      current: "", // Will be set by the monitoring service
      latest,
      latestStable,
      eolDate: undefined, // Package managers don't typically have EOL dates
      securityAdvisories,
      breakingChanges,
      migrationGuide: this.getMigrationGuideUrl(latestStable),
      releaseNotes: this.getReleaseNotesUrl(latestStable),
      publishedAt: this.getPublishedDate(latestStable, registry.time),
    };
  }

  private async checkPipVersion(): Promise<VersionInfo> {
    const releases = await this.fetchFromGitHub();

    // Extract versions from GitHub releases
    const allVersions = releases
      .filter((release) => !release.draft && !release.prerelease)
      .map((release) => release.tag_name)
      .filter((version) => this.isValidVersion(version))
      .sort((a, b) => this.compareVersions(b, a));

    if (allVersions.length === 0) {
      throw new Error("No valid pip versions found");
    }

    const latest = allVersions[0];
    const stableVersions = this.filterStableVersions(allVersions);
    const latestStable = this.getLatestStable(stableVersions);

    // Extract security advisories and breaking changes
    const securityAdvisories = this.extractSecurityAdvisories(releases);
    const breakingChanges = this.extractBreakingChanges(releases);

    return {
      name: "PIP",
      current: "", // Will be set by the monitoring service
      latest,
      latestStable,
      eolDate: undefined,
      securityAdvisories,
      breakingChanges,
      migrationGuide: this.getMigrationGuideUrl(latestStable),
      releaseNotes: this.getReleaseNotesUrl(latestStable),
      publishedAt: this.getPublishedDate(latestStable, releases),
    };
  }

  private async fetchFromNpmRegistry(): Promise<NpmRegistryResponse> {
    const response = await this.makeRequest(this.apiEndpoint);
    return await response.json();
  }

  private async fetchFromGitHub(): Promise<GitHubRelease[]> {
    const githubUrl =
      PackageManagerVersionChecker.GITHUB_ENDPOINTS[this.packageManager];
    const response = await this.makeRequest(githubUrl);
    return await response.json();
  }

  private isValidVersion(version: string): boolean {
    const cleaned = this.parseVersion(version);
    return /^\d+\.\d+\.\d+/.test(cleaned);
  }

  private extractCompatibleRuntimes(
    registry: NpmRegistryResponse,
    version: string
  ): Record<string, string[]> {
    const versionData = registry.versions[version];
    const compatibleRuntimes: Record<string, string[]> = {};

    if (versionData?.engines?.node) {
      compatibleRuntimes.node = [versionData.engines.node];
    }

    // Add default compatibility based on package manager
    switch (this.packageManager) {
      case "npm":
      case "pnpm":
      case "yarn":
        if (!compatibleRuntimes.node) {
          compatibleRuntimes.node = [">=14.0.0"]; // Default Node.js compatibility
        }
        break;
      case "pip":
        compatibleRuntimes.python = [">=3.7"]; // Default Python compatibility
        break;
    }

    return compatibleRuntimes;
  }

  protected extractSecurityAdvisories(
    releases: GitHubRelease[]
  ): SecurityAdvisory[] {
    const advisories: SecurityAdvisory[] = [];

    for (const release of releases) {
      if (release.body && release.body.toLowerCase().includes("security")) {
        const cveMatches = release.body.match(/CVE-\d{4}-\d{4,}/gi) || [];

        if (cveMatches.length > 0) {
          for (const cve of cveMatches) {
            advisories.push({
              id: `${this.packageManager}-${release.tag_name}-${cve}`,
              severity: this.determineSeverityFromText(release.body),
              affectedVersions: this.extractAffectedVersions(release.body),
              fixedVersion: release.tag_name,
              description: `Security fix in ${this.packageManager} ${release.tag_name}`,
              cveId: cve,
              publishedAt: new Date(release.published_at),
              references: [release.html_url],
            });
          }
        } else if (release.body.toLowerCase().includes("security")) {
          advisories.push({
            id: `${this.packageManager}-${release.tag_name}-security`,
            severity: this.determineSeverityFromText(release.body),
            affectedVersions: this.extractAffectedVersions(release.body),
            fixedVersion: release.tag_name,
            description: `Security improvements in ${this.packageManager} ${release.tag_name}`,
            publishedAt: new Date(release.published_at),
            references: [release.html_url],
          });
        }
      }
    }

    return advisories;
  }

  protected extractBreakingChanges(
    releases: GitHubRelease[]
  ): BreakingChange[] {
    const breakingChanges: BreakingChange[] = [];

    for (const release of releases) {
      if (release.body) {
        const body = release.body.toLowerCase();

        const breakingKeywords = [
          "breaking change",
          "breaking:",
          "breaking changes",
          "incompatible",
          "removed",
          "deprecated",
          "no longer supported",
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
            workarounds: [],
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

    // Package manager specific feature patterns
    const patterns = {
      npm: [/\b(install|publish|audit|run|scripts?)\b/gi],
      pnpm: [/\b(install|publish|run|workspace|monorepo)\b/gi],
      yarn: [/\b(install|add|run|workspace|berry)\b/gi],
      pip: [/\b(install|download|wheel|requirements)\b/gi],
    };

    const packagePatterns = patterns[this.packageManager] || [];

    for (const pattern of packagePatterns) {
      const matches = text.match(pattern) || [];
      features.push(...matches.map((m) => m.toLowerCase()));
    }

    return [...new Set(features)];
  }

  private isMajorVersionChange(version: string): boolean {
    const parsed = this.parseVersion(version);
    const parts = parsed.split(".");
    return parts.length >= 3 && parts[1] === "0" && parts[2] === "0";
  }

  private getMigrationGuideUrl(version: string): string {
    return this.getChangelogUrl(version);
  }

  private getReleaseNotesUrl(version: string): string {
    return this.getChangelogUrl(version);
  }

  private getPublishedDate(
    version: string,
    timeData: Record<string, string> | GitHubRelease[]
  ): Date | undefined {
    if (Array.isArray(timeData)) {
      // GitHub releases format
      const release = timeData.find(
        (r) => r.tag_name === version || r.tag_name === `v${version}`
      );
      return release ? new Date(release.published_at) : undefined;
    } else {
      // npm registry time format
      const timestamp = timeData[version];
      return timestamp ? new Date(timestamp) : undefined;
    }
  }

  /**
   * Get compatibility information for this package manager
   */
  getCompatibilityInfo(): Record<string, string[]> {
    const compatibility: Record<string, string[]> = {};

    switch (this.packageManager) {
      case "npm":
        compatibility.node = [">=14.0.0"];
        break;
      case "pnpm":
        compatibility.node = [">=16.14.0"];
        break;
      case "yarn":
        compatibility.node = [">=14.15.0"];
        break;
      case "pip":
        compatibility.python = [">=3.7"];
        break;
    }

    return compatibility;
  }
}
