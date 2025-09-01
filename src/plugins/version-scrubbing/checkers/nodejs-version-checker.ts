/**
 * Node.js version checker implementation
 */

import { BaseVersionChecker } from "./base-version-checker.js";
import {
  CheckResult,
  VersionInfo,
  SecurityAdvisory,
  BreakingChange,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

interface NodeJSRelease {
  version: string;
  date: string;
  files: string[];
  npm?: string;
  v8?: string;
  uv?: string;
  zlib?: string;
  openssl?: string;
  modules?: string;
  lts?: string | false;
  security?: boolean;
}

interface NodeJSSchedule {
  [version: string]: {
    start: string;
    lts?: string;
    maintenance?: string;
    end: string;
    codename?: string;
  };
}

export class NodeJSVersionChecker extends BaseVersionChecker {
  private static readonly NODEJS_API = "https://nodejs.org/dist/index.json";
  private static readonly NODEJS_SCHEDULE_API =
    "https://raw.githubusercontent.com/nodejs/Release/main/schedule.json";
  private static readonly SECURITY_API = "https://nodejs.org/en/security/";

  constructor() {
    super("Node.js", NodeJSVersionChecker.NODEJS_API, {
      maxRequests: 60,
      windowMs: 3600000, // 1 hour
      backoffMultiplier: 2,
      maxBackoffMs: 300000, // 5 minutes
    });
  }

  async checkVersion(): Promise<CheckResult> {
    try {
      logger.debug("Checking Node.js versions...");

      // Fetch release data
      const [releases, schedule] = await Promise.all([
        this.fetchReleases(),
        this.fetchReleaseSchedule(),
      ]);

      if (!releases || releases.length === 0) {
        return {
          success: false,
          error: "No Node.js releases found",
        };
      }

      const latest = releases[0].version;
      const latestStable = this.getLatestStable(releases.map((r) => r.version));
      const ltsVersions = releases
        .filter((r) => r.lts && typeof r.lts === "string")
        .map((r) => r.version);
      const currentLTS = ltsVersions[0];

      // Get EOL information
      const eolInfo = this.getEOLInfo(schedule, latestStable);

      // Extract security advisories
      const securityAdvisories = await this.getSecurityAdvisories();

      // Extract breaking changes (for major versions)
      const breakingChanges = this.getBreakingChanges(releases);

      const versionInfo: VersionInfo = {
        name: "Node.js",
        current: process.version.slice(1), // Remove 'v' prefix
        latest,
        latestStable,
        eolDate: eolInfo?.eolDate,
        securityAdvisories,
        breakingChanges,
        releaseNotes: `https://nodejs.org/en/blog/release/${latest.replace(/\./g, "-")}/`,
        publishedAt: new Date(releases[0].date),
      };

      return {
        success: true,
        data: versionInfo,
      };
    } catch (error) {
      logger.error("Failed to check Node.js version:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  parseVersion(versionString: string): string {
    // Remove 'v' prefix if present
    const cleaned = versionString.replace(/^v/, "");

    // Extract semantic version (major.minor.patch)
    const match = cleaned.match(/^(\d+\.\d+\.\d+)/);
    return match ? match[1] : cleaned;
  }

  protected getChangelogUrl(version: string): string {
    return `https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V${version.split(".")[0]}.md`;
  }

  protected getUpdateCommand(version: string): string {
    return `# Update Node.js to ${version}
# Using Node Version Manager (nvm):
nvm install ${version}
nvm use ${version}

# Or download from: https://nodejs.org/en/download/`;
  }

  private async fetchReleases(): Promise<NodeJSRelease[]> {
    const response = await this.makeRequest(NodeJSVersionChecker.NODEJS_API);
    const releases: NodeJSRelease[] = await response.json();

    // Sort by version (newest first)
    return releases.sort((a, b) => this.compareVersions(b.version, a.version));
  }

  private async fetchReleaseSchedule(): Promise<NodeJSSchedule> {
    try {
      const response = await this.makeRequest(
        NodeJSVersionChecker.NODEJS_SCHEDULE_API
      );
      return await response.json();
    } catch (error) {
      logger.warn("Failed to fetch Node.js release schedule:", error);
      return {};
    }
  }

  private getEOLInfo(
    schedule: NodeJSSchedule,
    version: string
  ): { eolDate: Date } | null {
    const majorVersion = `v${version.split(".")[0]}`;
    const scheduleInfo = schedule[majorVersion];

    if (!scheduleInfo) return null;

    return {
      eolDate: new Date(scheduleInfo.end),
    };
  }

  private async getSecurityAdvisories(): Promise<SecurityAdvisory[]> {
    // Note: Node.js doesn't have a structured security API
    // This would need to be implemented by scraping the security page
    // or using a third-party vulnerability database

    try {
      // Placeholder implementation
      // In a real implementation, you would:
      // 1. Scrape https://nodejs.org/en/security/
      // 2. Parse CVE information
      // 3. Match against version ranges

      return [];
    } catch (error) {
      logger.warn("Failed to fetch Node.js security advisories:", error);
      return [];
    }
  }

  private getBreakingChanges(releases: NodeJSRelease[]): BreakingChange[] {
    const breakingChanges: BreakingChange[] = [];

    // Identify major version releases
    const majorReleases = releases.filter((release) => {
      const version = this.parseVersion(release.version);
      const parts = version.split(".");
      return parts[1] === "0" && parts[2] === "0";
    });

    for (const release of majorReleases.slice(0, 5)) {
      // Last 5 major releases
      const majorVersion = this.parseVersion(release.version).split(".")[0];

      breakingChanges.push({
        version: release.version,
        description: `Node.js ${majorVersion} includes breaking changes`,
        migrationGuide: `https://nodejs.org/en/blog/release/${release.version.replace(/\./g, "-")}/`,
        affectedFeatures: this.getMajorVersionChanges(majorVersion),
      });
    }

    return breakingChanges;
  }

  private getMajorVersionChanges(majorVersion: string): string[] {
    // Known breaking changes for major Node.js versions
    const knownChanges: Record<string, string[]> = {
      "22": [
        "V8 engine updated to 12.4",
        "require() support for ES modules",
        "WebStreams API stable",
      ],
      "21": [
        "V8 engine updated to 11.8",
        "Stable fetch API",
        "Built-in WebSocket client",
      ],
      "20": [
        "V8 engine updated to 11.3",
        "Permissions model",
        "Custom ESM loader hooks",
      ],
      "18": [
        "V8 engine updated to 10.2",
        "Global fetch API",
        "Web Streams API",
        "Test runner module",
      ],
    };

    return (
      knownChanges[majorVersion] || [
        `Major version ${majorVersion} breaking changes`,
      ]
    );
  }
}
