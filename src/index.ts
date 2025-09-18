import { Command } from "commander";
import prompts from "prompts";
import { registry, getOrderedTemplates, isValidTemplate } from "./registry.js";
import { scaffold } from "./actions/scaffold.js";
import {
  installDeps,
  getRecommendedPackageManager,
} from "./actions/install.js";
import { initGit } from "./actions/git.js";
import { log } from "./utils/logger.js";
import { validateVersions } from "./utils/version-check.js";
import { VersionMonitoringService } from "./plugins/version-scrubbing/services/version-monitoring.js";
import { loadConfig } from "./plugins/version-scrubbing/config/plugin-config.js";
import {
  createSuccessOutput,
  createErrorOutput,
  outputJson,
  OutputCapture,
} from "./utils/json-output.js";
import {
  createVerifyCommand,
  createTrustCommand,
  createAuditCommand,
} from "./commands/security.js";
import { migrateCommand } from "./commands/migrate.js";
import { addFiles } from "./commands/addfile.js";
import type { NewOptions, TemplateKey, PackageManager } from "./types.js";

const program = new Command();

program
  .name("peezy")
  .description("Initialize projects across runtimes — instantly")
  .version("1.0.2");

/**
 * List command - show all available templates
 */
program
  .command("list")
  .description("List available templates")
  .option("--remote", "Include remote templates", false)
  .option("--json", "Output in JSON format")
  .action(async (options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      if (options.remote) {
        const { getAllTemplates } = await import("./registry.js");
        const { local, remote } = await getAllTemplates();

        if (options.json) {
          const { warnings, errors } = outputCapture.stop();
          const localTemplates = local.map((key) => ({
            name: key,
            title: registry[key].title,
            popular: registry[key].popular || false,
            type: "local" as const,
          }));

          const remoteTemplates = remote.map((template) => ({
            name: template.name,
            latest: template.latest,
            versions: Object.keys(template.versions),
            tags: template.versions[template.latest]?.tags || [],
            type: "remote" as const,
          }));

          const output = createSuccessOutput(
            {
              local: localTemplates,
              remote: remoteTemplates,
            },
            warnings
          );
          outputJson(output);
        } else {
          log.info("Local templates:");
          console.log();

          local.forEach((key) => {
            const template = registry[key];
            const indicator = template.popular ? log.popular("") : "  ";
            const title = template.popular
              ? log.highlight(template.title)
              : template.title;
            console.log(`${indicator}${key.padEnd(20)} ${title}`);
          });

          if (remote.length > 0) {
            console.log();
            log.info("Remote templates:");
            console.log();

            remote.forEach((template) => {
              const tags =
                template.versions[template.latest]?.tags?.join(", ") || "";
              console.log(
                `  ${template.name.padEnd(30)} ${template.latest.padEnd(10)} ${tags}`
              );
            });
          }

          console.log();
          log.info("Popular templates are marked with ⭐");
          log.info(
            "Use 'peezy add @org/template@version' to cache remote templates"
          );
        }
      } else {
        const orderedTemplates = getOrderedTemplates();

        if (options.json) {
          const { warnings, errors } = outputCapture.stop();
          const templates = orderedTemplates.map((key) => ({
            name: key,
            title: registry[key].title,
            popular: registry[key].popular || false,
            type: "local" as const,
          }));

          const output = createSuccessOutput({ templates }, warnings);
          outputJson(output);
        } else {
          log.info("Available templates:");
          console.log();

          orderedTemplates.forEach((key) => {
            const template = registry[key];
            const indicator = template.popular ? log.popular("") : "  ";
            const title = template.popular
              ? log.highlight(template.title)
              : template.title;
            console.log(`${indicator}${key.padEnd(20)} ${title}`);
          });

          console.log();
          log.info("Popular templates are marked with ⭐");
          log.info("Use --remote to see remote templates");
        }
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Failed to list templates: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

/**
 * New command - create a new project
 */
program
  .command("new")
  .argument("[template]", "Template to use")
  .argument("[name]", "Project name")
  .option("-p, --pm <pm>", "Package manager (bun|npm|pnpm|yarn)")
  .option("--no-install", "Skip dependency installation")
  .option("--no-git", "Skip git initialization")
  .option(
    "--databases <databases>",
    "Comma-separated list of databases (postgresql,mysql,sqlite,mongodb)"
  )
  .option("--redis", "Include Redis for caching/sessions")
  .option("--search", "Include Elasticsearch for search functionality")
  .option("--orm <orm>", "ORM to configure (prisma|drizzle|both)")
  .option(
    "--volumes <type>",
    "Volume configuration (preconfigured|custom)",
    "preconfigured"
  )
  .option("--json", "Output in JSON format")
  .description("Create a new project from a template")
  .action(async (templateArg?: string, nameArg?: string, opts?: any) => {
    const outputCapture = new OutputCapture();

    if (opts?.json) {
      outputCapture.start();
    }

    try {
      // Validate version requirements
      const versionCheck = validateVersions(templateArg);

      // Show errors and exit if critical issues
      if (!versionCheck.valid) {
        versionCheck.errors.forEach((error) => log.err(error));
        process.exit(1);
      }

      // Show warnings but continue
      if (versionCheck.warnings.length > 0) {
        versionCheck.warnings.forEach((warning) => log.warn(warning));
        console.log(); // Add spacing
      }

      // Get ordered templates for prompts
      const orderedTemplates = getOrderedTemplates();

      // Interactive prompts for missing arguments (skip in JSON mode)
      let answers: any = {};

      if (!opts?.json) {
        const { getEnhancedProjectConfig, showConfigSummary } = await import(
          "./utils/enhanced-prompts.js"
        );
        answers = await getEnhancedProjectConfig(templateArg, nameArg, opts);
      }

      // Parse database options
      const databases = opts?.databases
        ? opts.databases.split(",").map((db: string) => db.trim())
        : answers.databases
          ? typeof answers.databases === "string"
            ? answers.databases.split(",").map((db: string) => db.trim())
            : answers.databases
          : undefined;

      // Merge arguments and prompt answers
      const config: NewOptions = {
        template: (templateArg as TemplateKey) ?? answers.template,
        name: nameArg ?? answers.name,
        pm: opts?.pm ?? answers.pm ?? "bun", // Default to bun in JSON mode
        install: opts?.install ?? answers.install ?? true, // Default to true in JSON mode
        git: opts?.git ?? answers.git ?? true, // Default to true in JSON mode
        databases,
        includeRedis: opts?.redis ?? answers.includeRedis,
        includeSearch: opts?.search,
        orm: opts?.orm ?? (answers.orm as "prisma" | "drizzle" | "both"),
        volumes:
          opts?.volumes ?? (answers.volumes as "preconfigured" | "custom"),
        json: opts?.json,
      };

      // Show configuration summary for interactive mode
      if (!opts?.json && Object.keys(answers).length > 0) {
        const { showConfigSummary } = await import(
          "./utils/enhanced-prompts.js"
        );
        showConfigSummary(config);
      }

      // Validate required fields
      if (!config.template || !config.name) {
        log.err(
          "Template and name are required. Try `peezy new` and follow the prompts."
        );
        process.exit(1);
      }

      // Re-validate versions now that we know the template
      if (!templateArg) {
        const templateVersionCheck = validateVersions(config.template);
        if (templateVersionCheck.warnings.length > 0) {
          templateVersionCheck.warnings.forEach((warning) => log.warn(warning));
          console.log(); // Add spacing
        }
      }

      // Validate project name (same validation as in prompts)
      if (config.name) {
        const reserved = [
          "node_modules",
          "package.json",
          "package-lock.json",
          ".git",
          ".env",
        ];
        if (reserved.includes(config.name.toLowerCase())) {
          log.err(`"${config.name}" is a reserved name and cannot be used`);
          process.exit(1);
        }
        if (config.name.startsWith(".")) {
          log.err("Project name cannot start with a dot");
          process.exit(1);
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(config.name)) {
          log.err(
            "Project name can only contain letters, numbers, hyphens, and underscores"
          );
          process.exit(1);
        }
        if (config.name.startsWith("-") || config.name.endsWith("-")) {
          log.err("Project name cannot start or end with hyphens");
          process.exit(1);
        }
        if (config.name.length > 214) {
          log.err("Project name must be less than 214 characters");
          process.exit(1);
        }
      }

      // Validate template (allow remote templates to pass through)
      const { isRemoteTemplate } = await import("./registry.js");
      if (
        !isValidTemplate(config.template) &&
        !isRemoteTemplate(config.template)
      ) {
        log.err(`Unknown template: "${config.template}"`);
        console.log();
        log.info("Available templates:");
        getOrderedTemplates().forEach((key) => {
          const template = registry[key];
          const indicator = template.popular ? "⭐ " : "  ";
          console.log(`${indicator}${key} — ${template.title}`);
        });
        console.log();
        log.info("Use `peezy list --remote` to see remote templates");
        log.info(
          "Use `peezy add @org/template@version` to add remote templates"
        );
        process.exit(1);
      }

      // Validate package manager if provided
      if (config.pm && !["bun", "npm", "pnpm", "yarn"].includes(config.pm)) {
        log.err(`Unknown package manager: "${config.pm}"`);
        log.info("Supported package managers: bun, npm, pnpm, yarn");
        process.exit(1);
      }

      // Start scaffolding
      log.info(
        `Scaffolding ${log.highlight(config.template)} → ${log.highlight(config.name)}`
      );

      const scaffoldResult = await scaffold(
        config.template,
        config.name,
        config
      );
      log.ok(`Files created in ./${config.name}`);

      // Install dependencies
      if (config.install !== false) {
        try {
          const pm = config.pm ?? (await getRecommendedPackageManager());
          log.info(`Installing dependencies with ${pm}...`);
          await installDeps(pm, scaffoldResult.projectPath);
          log.ok("Dependencies installed");
        } catch (error) {
          log.warn(
            `Dependency installation failed: ${error instanceof Error ? error.message : String(error)}`
          );
          log.info("You can install dependencies manually later");
        }
      }

      // Initialize git
      if (config.git !== false) {
        try {
          log.info("Initializing git repository...");
          await initGit(scaffoldResult.projectPath);
          log.ok("Git repository initialized");
        } catch (error) {
          log.warn(
            `Git initialization failed: ${error instanceof Error ? error.message : String(error)}`
          );
          log.info("You can initialize git manually later");
        }
      }

      // Show educational next steps
      if (!opts?.json) {
        const { showEducationalNextSteps } = await import(
          "./utils/enhanced-prompts.js"
        );
        showEducationalNextSteps(config);
      } else {
        // Show basic next steps for JSON mode
        console.log();
        log.info("Next steps:");
        console.log(`  cd ${config.name}`);

        const devCommand =
          config.pm === "bun"
            ? "bun run dev"
            : config.pm === "yarn"
              ? "yarn dev"
              : config.pm === "pnpm"
                ? "pnpm dev"
                : "npm run dev";
        console.log(`  ${devCommand}`);
        console.log();
      }

      // Handle JSON output
      if (opts?.json) {
        const { warnings, errors } = outputCapture.stop();
        const devCommand =
          config.pm === "bun"
            ? "bun run dev"
            : config.pm === "yarn"
              ? "yarn dev"
              : config.pm === "pnpm"
                ? "pnpm dev"
                : "npm run dev";

        const output = createSuccessOutput(
          {
            project: {
              name: config.name,
              path: scaffoldResult.projectPath,
              template: scaffoldResult.templateInfo,
            },
            options: config,
            nextSteps: [`cd ${config.name}`, devCommand],
          },
          warnings
        );
        outputJson(output);
      }
    } catch (error) {
      if (opts?.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Failed to create project: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

/**
 * Version checking command
 */
program
  .command("doctor")
  .description("Environment & project health checks")
  .option("--fix-lint", "Attempt to autofix lint issues", false)
  .option("--fix-env-examples", "Autofix .env.example issues", false)
  .option(
    "--ports <ports>",
    "Comma-separated list of ports to check",
    "3000,5173,8000"
  )
  .option("--json", "Output in JSON format")
  .action(async (options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { doctor } = await import("./commands/doctor.js");
      const ports = String(options.ports)
        .split(",")
        .map((s: string) => parseInt(s.trim(), 10))
        .filter((n: number) => !Number.isNaN(n));

      const result = await doctor({
        fixLint: !!options.fixLint,
        fixEnvExamples: !!options.fixEnvExamples,
        ports,
        json: !!options.json,
      });

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        if (typeof result === "number") {
          // Legacy return format
          const output =
            result === 0
              ? createSuccessOutput({ healthy: true }, warnings)
              : createErrorOutput(["Health checks failed"], warnings);
          outputJson(output);
        } else {
          // New structured format
          const output = result.ok
            ? createSuccessOutput(result, warnings)
            : createErrorOutput(
                result.errors,
                warnings.concat(result.warnings)
              );
          outputJson(output);
        }
      } else {
        const code = typeof result === "number" ? result : result.ok ? 0 : 1;
        process.exit(code);
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Doctor failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

program
  .command("env")
  .description(
    "Typed env management: check, diff, generate, pull:railway, push:railway"
  )
  .argument("<subcommand>")
  .option("--schema <path>", "Path to env schema JSON (required/optional keys)")
  .option("--json", "Output in JSON format")
  .action(async (subcommand: string, options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { runEnv } = await import("./commands/env.js");
      const result = await runEnv(subcommand as any, {
        schema: options.schema,
        json: options.json,
      });

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        const output = createSuccessOutput(result, warnings);
        outputJson(output);
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Env command failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

program
  .command("readme")
  .description("Generate README and/or CHANGELOG with badges")
  .option("--name <name>")
  .option("--no-badges")
  .option("--changelog", "Also generate CHANGELOG.md", false)
  .option("--json", "Output in JSON format")
  .action(async (options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { generateReadme, generateChangelog } = await import(
        "./commands/readme-changelog.js"
      );

      const readmeResult = await generateReadme({
        name: options.name,
        badges: options.badges,
        json: options.json,
      });

      let changelogResult;
      if (options.changelog) {
        changelogResult = await generateChangelog({ json: options.json });
      }

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        const output = createSuccessOutput(
          {
            readme: readmeResult,
            changelog: changelogResult,
          },
          warnings
        );
        outputJson(output);
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `README generation failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

program
  .command("upgrade")
  .description("Check for updates to templates/plugins and preview diffs")
  .option("--dry-run", "Preview changes only", false)
  .option("--json", "Output in JSON format")
  .action(async (options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { upgrade } = await import("./commands/upgrade.js");
      const result = await upgrade({
        dryRun: !!options.dryRun,
        json: options.json,
      });

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        const output = createSuccessOutput(result, warnings);
        outputJson(output);
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Upgrade failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

/**
 * Add command - add remote templates to cache
 */
program
  .command("add")
  .argument("<template>", "Template to add (@org/template@version)")
  .option("--force", "Force re-download if already cached", false)
  .option("--version <version>", "Specific version to download")
  .option("--json", "Output in JSON format")
  .description("Add a remote template to the local cache")
  .action(async (templateName: string, options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { addTemplate } = await import("./commands/add.js");
      await addTemplate(templateName, {
        force: options.force,
        version: options.version,
      });

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        const output = createSuccessOutput(
          {
            template: templateName,
            cached: true,
          },
          warnings
        );
        outputJson(output);
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Failed to add template: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

/**
 * Cache command - manage template cache
 */
program
  .command("cache")
  .description("Manage template cache")
  .argument("[action]", "Action to perform (list, clear)", "list")
  .option("--json", "Output in JSON format")
  .action(async (action: string, options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { listCachedTemplates, clearCache, getCacheInfo } = await import(
        "./commands/add.js"
      );

      switch (action) {
        case "list":
          if (options.json) {
            const cacheInfo = await getCacheInfo();
            const { warnings, errors } = outputCapture.stop();
            const output = createSuccessOutput(cacheInfo, warnings);
            outputJson(output);
          } else {
            await listCachedTemplates();
          }
          break;
        case "clear":
          await clearCache();
          if (options.json) {
            const { warnings, errors } = outputCapture.stop();
            const output = createSuccessOutput({ cleared: true }, warnings);
            outputJson(output);
          }
          break;
        default:
          if (options.json) {
            const { warnings } = outputCapture.stop();
            const output = createErrorOutput(
              [`Unknown cache action: ${action}`],
              warnings
            );
            outputJson(output);
          } else {
            log.err(`Unknown cache action: ${action}`);
            log.info("Available actions: list, clear");
            process.exit(1);
          }
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Cache operation failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

/**
 * Reproduce command - recreate project from lock file
 */
program
  .command("reproduce")
  .argument("<name>", "Name for the reproduced project")
  .option("--lock-file <path>", "Path to peezy.lock.json file")
  .option("--verify", "Verify checksums after reproduction", false)
  .option("--json", "Output in JSON format")
  .description("Reproduce a project from peezy.lock.json")
  .action(async (projectName: string, options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { reproduceProject } = await import("./commands/reproduce.js");
      const result = await reproduceProject(projectName, {
        lockFile: options.lockFile,
        verify: options.verify,
        json: options.json,
      });

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        const output = createSuccessOutput(
          {
            project: projectName,
            reproduced: result.success,
            lockFile: result.lockFile,
            verification: result.verification,
          },
          warnings
        );
        outputJson(output);
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Failed to reproduce project: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

/**
 * Verify command - check project against lock file
 */
program
  .command("verify")
  .option("--project-path <path>", "Path to project directory", process.cwd())
  .option("--json", "Output in JSON format")
  .description("Verify project matches its peezy.lock.json")
  .action(async (options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const { verifyProject } = await import("./commands/reproduce.js");
      const result = await verifyProject(options.projectPath);

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        const output = createSuccessOutput(result, warnings);
        outputJson(output);
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Failed to verify project: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

program
  .command("check-versions")
  .description(
    "Check for latest versions of runtimes, frameworks, and dependencies"
  )
  .option(
    "-f, --format <format>",
    "Output format (json, markdown, console)",
    "console"
  )
  .option(
    "-t, --technologies <technologies>",
    "Comma-separated list of technologies to check"
  )
  .option("--include-prerelease", "Include prerelease versions", false)
  .option("--security-only", "Only show security-related updates", false)
  .option("--json", "Output in standardized JSON format (overrides --format)")
  .action(async (options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      const config = loadConfig();
      const versionService = new VersionMonitoringService(config);

      const technologies = options.technologies
        ? options.technologies.split(",").map((t: string) => t.trim())
        : undefined;

      if (options.securityOnly) {
        const advisories = await versionService.getSecurityAdvisories(
          technologies || config.monitoring.runtimes,
          "medium"
        );

        if (options.json) {
          const { warnings, errors } = outputCapture.stop();
          const output = createSuccessOutput(
            {
              type: "security-advisories",
              advisories,
            },
            warnings
          );
          outputJson(output);
        } else if (options.format === "json") {
          console.log(JSON.stringify(advisories, null, 2));
        } else {
          console.log("🔒 Security Advisories");
          console.log("=".repeat(30));

          for (const [tech, techAdvisories] of Object.entries(advisories)) {
            if (techAdvisories.length > 0) {
              console.log(`\n${tech}:`);
              techAdvisories.forEach((advisory) => {
                console.log(
                  `  ⚠️  ${advisory.severity.toUpperCase()}: ${advisory.description}`
                );
              });
            }
          }
        }
      } else {
        const report = await versionService.generateReport(
          options.json
            ? "json"
            : (options.format as "json" | "markdown" | "console"),
          true
        );

        if (options.json) {
          const { warnings, errors } = outputCapture.stop();
          const output = createSuccessOutput(
            {
              type: "version-report",
              report: options.format === "json" ? JSON.parse(report) : report,
            },
            warnings
          );
          outputJson(output);
        } else {
          console.log(report);
        }
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Failed to check versions: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

// Add security commands
program.addCommand(createVerifyCommand().name("verify-template"));
program.addCommand(createTrustCommand());
program.addCommand(createAuditCommand());

// Add migration command
program.addCommand(migrateCommand);

/**
 * Add File command - intelligently add configuration files to existing projects
 */
program
  .command("addfile")
  .alias("add-file")
  .description("Add configuration files to your existing project")
  .option("--json", "Output in JSON format")
  .option("--force", "Overwrite existing files")
  .option("--category <category>", "Filter by file category")
  .action(async (options) => {
    const outputCapture = new OutputCapture();

    if (options.json) {
      outputCapture.start();
    }

    try {
      await addFiles(process.cwd(), {
        json: options.json,
        force: options.force,
        category: options.category,
      });

      if (options.json) {
        const { warnings, errors } = outputCapture.stop();
        // Success output is handled within addFiles function
      }
    } catch (error) {
      if (options.json) {
        const { warnings } = outputCapture.stop();
        const output = createErrorOutput(
          [error instanceof Error ? error.message : String(error)],
          warnings
        );
        outputJson(output);
      } else {
        log.err(
          `Failed to add files: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });

// Parse command line arguments
await program.parseAsync(process.argv).catch((error) => {
  log.err(`CLI error: ${error.message}`);
  process.exit(1);
});
