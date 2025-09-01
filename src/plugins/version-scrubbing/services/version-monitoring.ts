/**
 * Main version monitoring service
 */

import { PluginConfig } from "../config/plugin-config.js";
import {
  VersionInfo,
  SecurityAdvisory,
  UpdateAnalysis,
  UpdateStrategy,
  CheckResult,
  VersionRegistry,
} from "../types/index.js";
import { NodeJSVersionChecker } from "../checkers/nodejs-version-checker.js";
import { logger } from "../utils/logger.js";

export class VersionMonitoringService {
  private config: PluginConfig;
  private checkers: Map<string, any> = new Map();
  private cache: Map<string, { data: any; timestamp: Date; ttl: number }> =
    new Map();

  constructor(config: PluginConfig) {
    this.config = config;
    this.initializeCheckers();
  }

  private initializeCheckers() {
    // Initialize version checkers for configured technologies
    if (this.config.monitoring.runtimes.includes("nodejs")) {
      this.checkers.set("nodejs", new NodeJSVersionChecker());
    }

    // TODO: Add other checkers as they're implemented
    // if (this.config.monitoring.runtimes.includes("python")) {
    //   this.checkers.set("python", new PythonVersionChecker());
    // }
    // if (this.config.monitoring.runtimes.includes("bun")) {
    //   this.checkers.set("bun", new BunVersionChecker());
    // }
  }

  async checkVersions(
    technologies?: string[],
    includePrerelease: boolean = false
  ): Promise<Record<string, CheckResult>> {
    const techsToCheck = technologies || Array.from(this.checkers.keys());
    const results: Record<string, CheckResult> = {};

    logger.info(`Checking versions for: ${techsToCheck.join(", ")}`);

    // Check versions in parallel
    const promises = techsToCheck.map(async (tech) => {
      const checker = this.checkers.get(tech);
      if (!checker) {
        results[tech] = {
          success: false,
          error: `No checker available for ${tech}`,
        };
        return;
      }

      try {
        // Check cache first
        const cached = this.getCachedResult(tech);
        if (cached) {
          results[tech] = {
            success: true,
            data: cached,
            cached: true,
          };
          return;
        }

        // Fetch fresh data
        const result = await checker.checkVersion();

        if (result.success && result.data) {
          // Cache the result
          this.cacheResult(tech, result.data);
          results[tech] = result;
        } else {
          results[tech] = result;
        }
      } catch (error) {
        logger.error(`Error checking ${tech}:`, error);
        results[tech] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    await Promise.all(promises);

    return results;
  }

  async getSecurityAdvisories(
    technologies: string[],
    severity: "critical" | "high" | "medium" | "low" = "medium"
  ): Promise<Record<string, SecurityAdvisory[]>> {
    const results: Record<string, SecurityAdvisory[]> = {};

    for (const tech of technologies) {
      const checker = this.checkers.get(tech);
      if (!checker) {
        results[tech] = [];
        continue;
      }

      try {
        const versionResult = await checker.checkVersion();
        if (versionResult.success && versionResult.data) {
          const advisories = versionResult.data.securityAdvisories || [];

          // Filter by severity
          const severityLevels = ["critical", "high", "medium", "low"];
          const minSeverityIndex = severityLevels.indexOf(severity);

          results[tech] = advisories.filter((advisory: SecurityAdvisory) => {
            const advisorySeverityIndex = severityLevels.indexOf(
              advisory.severity
            );
            return advisorySeverityIndex <= minSeverityIndex;
          });
        } else {
          results[tech] = [];
        }
      } catch (error) {
        logger.error(`Error getting security advisories for ${tech}:`, error);
        results[tech] = [];
      }
    }

    return results;
  }

  async analyzeUpdates(
    currentVersions: Record<string, string>,
    updateStrategy: UpdateStrategy = "moderate"
  ): Promise<Record<string, UpdateAnalysis>> {
    const results: Record<string, UpdateAnalysis> = {};

    for (const [tech, currentVersion] of Object.entries(currentVersions)) {
      const checker = this.checkers.get(tech);
      if (!checker) {
        continue;
      }

      try {
        const versionResult = await checker.checkVersion();
        if (!versionResult.success || !versionResult.data) {
          continue;
        }

        const versionInfo = versionResult.data;
        const recommendation = checker.getUpdateRecommendation(
          currentVersion,
          versionInfo.latestStable
        );

        // Adjust recommendation based on update strategy
        const adjustedRecommendation = this.adjustRecommendationForStrategy(
          recommendation,
          updateStrategy
        );

        results[tech] = {
          technology: tech,
          currentVersion,
          recommendedVersion: this.getRecommendedVersion(
            versionInfo,
            updateStrategy
          ),
          updatePath: this.calculateUpdatePath(
            currentVersion,
            versionInfo.latestStable,
            checker
          ),
          risks: this.assessRisks(versionInfo, currentVersion),
          benefits: this.identifyBenefits(versionInfo, currentVersion),
          recommendation: adjustedRecommendation,
        };
      } catch (error) {
        logger.error(`Error analyzing updates for ${tech}:`, error);
      }
    }

    return results;
  }

  async generateReport(
    format: "json" | "markdown" | "console" = "markdown",
    includeRecommendations: boolean = true
  ): Promise<string> {
    const versionResults = await this.checkVersions();

    switch (format) {
      case "json":
        return this.generateJSONReport(versionResults, includeRecommendations);
      case "markdown":
        return this.generateMarkdownReport(
          versionResults,
          includeRecommendations
        );
      case "console":
        return this.generateConsoleReport(
          versionResults,
          includeRecommendations
        );
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }

  private getCachedResult(technology: string): VersionInfo | null {
    const cached = this.cache.get(technology);
    if (!cached) return null;

    const now = new Date();
    const age = now.getTime() - cached.timestamp.getTime();

    if (age > cached.ttl) {
      this.cache.delete(technology);
      return null;
    }

    return cached.data;
  }

  private cacheResult(technology: string, data: VersionInfo): void {
    this.cache.set(technology, {
      data,
      timestamp: new Date(),
      ttl: this.config.cache.ttl,
    });

    // Clean up old cache entries if we exceed max size
    if (this.cache.size > this.config.cache.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private adjustRecommendationForStrategy(
    recommendation: any,
    strategy: UpdateStrategy
  ) {
    switch (strategy) {
      case "conservative":
        // Only recommend critical security updates and patch releases
        if (
          recommendation.type !== "security" &&
          recommendation.impact === "breaking"
        ) {
          return {
            ...recommendation,
            priority: "low",
            recommendation: "Consider updating during next major release cycle",
          };
        }
        break;

      case "aggressive":
        // Recommend all updates, prioritize latest versions
        return {
          ...recommendation,
          priority:
            recommendation.priority === "low"
              ? "medium"
              : recommendation.priority,
          recommendation: recommendation.recommendation.replace(
            "Consider",
            "Recommended to"
          ),
        };

      case "moderate":
      default:
        // Default behavior - no adjustment needed
        break;
    }

    return recommendation;
  }

  private getRecommendedVersion(
    versionInfo: VersionInfo,
    strategy: UpdateStrategy
  ): string {
    switch (strategy) {
      case "conservative":
        // Prefer stable versions, avoid major updates
        return versionInfo.latestStable;
      case "aggressive":
        // Use latest available version
        return versionInfo.latest;
      case "moderate":
      default:
        // Use latest stable version
        return versionInfo.latestStable;
    }
  }

  private calculateUpdatePath(
    currentVersion: string,
    targetVersion: string,
    checker: any
  ) {
    // Simplified update path calculation
    // In a real implementation, this would analyze intermediate versions
    const comparison = checker.compareVersions(targetVersion, currentVersion);

    if (comparison <= 0) {
      return [];
    }

    const currentParts = checker
      .parseVersion(currentVersion)
      .split(".")
      .map(Number);
    const targetParts = checker
      .parseVersion(targetVersion)
      .split(".")
      .map(Number);

    let updateType: "patch" | "minor" | "major" = "patch";

    if (targetParts[0] > currentParts[0]) {
      updateType = "major";
    } else if (targetParts[1] > currentParts[1]) {
      updateType = "minor";
    }

    return [
      {
        from: currentVersion,
        to: targetVersion,
        type: updateType,
        breakingChanges: updateType === "major" ? [] : [], // TODO: Get actual breaking changes
        required: true,
      },
    ];
  }

  private assessRisks(versionInfo: VersionInfo, currentVersion: string) {
    const risks = [];

    // Check for breaking changes
    if (versionInfo.breakingChanges && versionInfo.breakingChanges.length > 0) {
      risks.push({
        type: "breaking" as const,
        severity: "high" as const,
        description: "Update includes breaking changes",
        mitigation: "Review migration guide and test thoroughly",
      });
    }

    // Check for security advisories
    if (
      versionInfo.securityAdvisories &&
      versionInfo.securityAdvisories.length > 0
    ) {
      const criticalAdvisories = versionInfo.securityAdvisories.filter(
        (a) => a.severity === "critical"
      );

      if (criticalAdvisories.length > 0) {
        risks.push({
          type: "security" as const,
          severity: "critical" as const,
          description: "Current version has critical security vulnerabilities",
          mitigation: "Update immediately to address security issues",
        });
      }
    }

    return risks;
  }

  private identifyBenefits(
    versionInfo: VersionInfo,
    currentVersion: string
  ): string[] {
    const benefits = [];

    // Security fixes
    if (
      versionInfo.securityAdvisories &&
      versionInfo.securityAdvisories.length > 0
    ) {
      benefits.push("Security vulnerability fixes");
    }

    // Bug fixes (for patch releases)
    const currentParts = versionInfo.current.split(".");
    const latestParts = versionInfo.latestStable.split(".");

    if (latestParts[2] > currentParts[2]) {
      benefits.push("Bug fixes and stability improvements");
    }

    // New features (for minor/major releases)
    if (latestParts[1] > currentParts[1] || latestParts[0] > currentParts[0]) {
      benefits.push("New features and capabilities");
      benefits.push("Performance improvements");
    }

    return benefits;
  }

  private generateJSONReport(
    versionResults: Record<string, CheckResult>,
    includeRecommendations: boolean
  ): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(versionResults),
      technologies: versionResults,
      recommendations: includeRecommendations
        ? this.generateRecommendations(versionResults)
        : undefined,
    };

    return JSON.stringify(report, null, 2);
  }

  private generateMarkdownReport(
    versionResults: Record<string, CheckResult>,
    includeRecommendations: boolean
  ): string {
    const lines = [
      "# Version Status Report",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      "## Summary",
      "",
    ];

    const summary = this.generateSummary(versionResults);
    lines.push(`- **Total Technologies**: ${summary.total}`);
    lines.push(`- **Up to Date**: ${summary.upToDate}`);
    lines.push(`- **Updates Available**: ${summary.updatesAvailable}`);
    lines.push(`- **Security Issues**: ${summary.securityIssues}`);
    lines.push("");

    lines.push("## Technology Status");
    lines.push("");

    for (const [tech, result] of Object.entries(versionResults)) {
      if (result.success && result.data) {
        const data = result.data;
        lines.push(`### ${data.name}`);
        lines.push("");
        lines.push(`- **Current**: ${data.current}`);
        lines.push(`- **Latest**: ${data.latest}`);
        lines.push(`- **Latest Stable**: ${data.latestStable}`);

        if (data.eolDate) {
          lines.push(
            `- **EOL Date**: ${data.eolDate.toISOString().split("T")[0]}`
          );
        }

        if (data.securityAdvisories && data.securityAdvisories.length > 0) {
          lines.push(
            `- **Security Advisories**: ${data.securityAdvisories.length}`
          );
        }

        lines.push("");
      } else {
        lines.push(`### ${tech}`);
        lines.push("");
        lines.push(`❌ **Error**: ${result.error}`);
        lines.push("");
      }
    }

    return lines.join("\n");
  }

  private generateConsoleReport(
    versionResults: Record<string, CheckResult>,
    includeRecommendations: boolean
  ): string {
    const lines = [];

    lines.push("📊 Version Status Report");
    lines.push("=".repeat(50));

    for (const [tech, result] of Object.entries(versionResults)) {
      if (result.success && result.data) {
        const data = result.data;
        const isUpToDate = data.current === data.latestStable;
        const status = isUpToDate ? "✅" : "⚠️";

        lines.push(
          `${status} ${data.name}: ${data.current} → ${data.latestStable}`
        );

        if (data.securityAdvisories && data.securityAdvisories.length > 0) {
          lines.push(
            `   🔒 ${data.securityAdvisories.length} security advisory(ies)`
          );
        }
      } else {
        lines.push(`❌ ${tech}: ${result.error}`);
      }
    }

    return lines.join("\n");
  }

  private generateSummary(versionResults: Record<string, CheckResult>) {
    let total = 0;
    let upToDate = 0;
    let updatesAvailable = 0;
    let securityIssues = 0;

    for (const result of Object.values(versionResults)) {
      total++;

      if (result.success && result.data) {
        const isUpToDate = result.data.current === result.data.latestStable;
        if (isUpToDate) {
          upToDate++;
        } else {
          updatesAvailable++;
        }

        if (
          result.data.securityAdvisories &&
          result.data.securityAdvisories.length > 0
        ) {
          securityIssues++;
        }
      }
    }

    return {
      total,
      upToDate,
      updatesAvailable,
      securityIssues,
    };
  }

  private generateRecommendations(versionResults: Record<string, CheckResult>) {
    const recommendations = [];

    for (const [tech, result] of Object.entries(versionResults)) {
      if (result.success && result.data) {
        const data = result.data;
        const isUpToDate = data.current === data.latestStable;

        if (!isUpToDate) {
          recommendations.push({
            technology: tech,
            action: "update",
            from: data.current,
            to: data.latestStable,
            priority: data.securityAdvisories?.length > 0 ? "high" : "medium",
          });
        }
      }
    }

    return recommendations;
  }
}
