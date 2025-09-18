#!/usr/bin/env node

/**
 * Version Scrubbing Plugin for Kiro
 *
 * An MCP server that automatically monitors version updates for runtimes,
 * frameworks, and dependencies used in the Peezy CLI tool.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { VersionMonitoringService } from "./services/version-monitoring.js";
import { PluginConfig, loadConfig } from "./config/plugin-config.js";
import { logger } from "./utils/logger.js";
import { uniqueNormalizedTechs } from "./utils/tech-list.js";
import { normalizeTech } from "./utils/normalize-tech.js";

class VersionScrubbingServer {
  private server: Server;
  private versionService: VersionMonitoringService;
  private config: PluginConfig;

  constructor() {
    this.server = new Server(
      {
        name: "version-scrubbing-plugin",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = loadConfig();
    this.versionService = new VersionMonitoringService(this.config);
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "check_versions",
            description:
              "Check for latest versions of runtimes, frameworks, and dependencies",
            inputSchema: {
              type: "object",
              properties: {
                technologies: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Specific technologies to check (optional, defaults to all configured)",
                },
                includePrerelease: {
                  type: "boolean",
                  description: "Include prerelease versions in results",
                  default: false,
                },
              },
            },
          },
          {
            name: "get_security_advisories",
            description: "Get security advisories for specified technologies",
            inputSchema: {
              type: "object",
              properties: {
                technologies: {
                  type: "array",
                  items: { type: "string" },
                  description: "Technologies to check for security advisories",
                },
                severity: {
                  type: "string",
                  enum: ["critical", "high", "medium", "low"],
                  description: "Minimum severity level to include",
                  default: "medium",
                },
              },
            },
          },
          {
            name: "analyze_updates",
            description: "Analyze version updates and provide recommendations",
            inputSchema: {
              type: "object",
              properties: {
                currentVersions: {
                  type: "object",
                  description: "Current versions to analyze against latest",
                },
                updateStrategy: {
                  type: "string",
                  enum: ["conservative", "moderate", "aggressive"],
                  description: "Update strategy preference",
                  default: "moderate",
                },
              },
            },
          },
          {
            name: "generate_report",
            description: "Generate a comprehensive version status report",
            inputSchema: {
              type: "object",
              properties: {
                format: {
                  type: "string",
                  enum: ["json", "markdown", "console"],
                  description: "Output format for the report",
                  default: "markdown",
                },
                includeRecommendations: {
                  type: "boolean",
                  description: "Include update recommendations in the report",
                  default: true,
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "check_versions":
            return await this.handleCheckVersions(args);
          case "get_security_advisories":
            return await this.handleGetSecurityAdvisories(args);
          case "analyze_updates":
            return await this.handleAnalyzeUpdates(args);
          case "generate_report":
            return await this.handleGenerateReport(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async handleCheckVersions(args: any) {
    const allDetectedTechs =
      args?.technologies ||
      this.config.monitoring.runtimes.concat(
        this.config.monitoring.frameworks,
        this.config.monitoring.packages
      );

    // Normalize first, then de‑dupe
    const techsToCheck = uniqueNormalizedTechs(allDetectedTechs, normalizeTech);

    const includePrerelease = args?.includePrerelease || false;

    const results = await this.versionService.checkVersions(
      techsToCheck,
      includePrerelease
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  private async handleGetSecurityAdvisories(args: any) {
    const technologies = args?.technologies || [];
    const severity = args?.severity || "medium";

    const advisories = await this.versionService.getSecurityAdvisories(
      technologies,
      severity
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(advisories, null, 2),
        },
      ],
    };
  }

  private async handleAnalyzeUpdates(args: any) {
    const currentVersions = args?.currentVersions || {};
    const updateStrategy = args?.updateStrategy || "moderate";

    const analysis = await this.versionService.analyzeUpdates(
      currentVersions,
      updateStrategy
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  private async handleGenerateReport(args: any) {
    const format = args?.format || "markdown";
    const includeRecommendations = args?.includeRecommendations !== false;

    const report = await this.versionService.generateReport(
      format,
      includeRecommendations
    );

    return {
      content: [
        {
          type: "text",
          text: report,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info("Version Scrubbing Plugin MCP server started");
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new VersionScrubbingServer();
  server.run().catch((error) => {
    logger.error("Failed to start server:", error);
    process.exit(1);
  });
}

export { VersionScrubbingServer };
