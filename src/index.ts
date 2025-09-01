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
import type { NewOptions, TemplateKey, PackageManager } from "./types.js";

const program = new Command();

program
  .name("peezy")
  .description("Initialize projects across runtimes — instantly")
  .version("0.1.0");

/**
 * List command - show all available templates
 */
program
  .command("list")
  .description("List available templates")
  .action(() => {
    log.info("Available templates:");
    console.log();

    const orderedTemplates = getOrderedTemplates();

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
  .description("Create a new project from a template")
  .action(async (templateArg?: string, nameArg?: string, opts?: any) => {
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

      // Interactive prompts for missing arguments
      const answers = await prompts(
        [
          {
            type: templateArg ? null : "select",
            name: "template",
            message: "Choose a template:",
            choices: orderedTemplates.map((key) => {
              const template = registry[key];
              const title = template.popular
                ? `⭐ ${key} — ${template.title}`
                : `  ${key} — ${template.title}`;
              return { title, value: key };
            }),
            initial: 0,
          },
          {
            type: nameArg ? null : "text",
            name: "name",
            message: "Project name:",
            initial: "my-app",
            validate: (value: string) => {
              if (!value || value.trim().length === 0) {
                return "Project name is required";
              }
              if (value.length > 214) {
                return "Project name must be less than 214 characters";
              }
              // Check for reserved names first
              const reserved = [
                "node_modules",
                "package.json",
                "package-lock.json",
                ".git",
                ".env",
              ];
              if (reserved.includes(value.toLowerCase())) {
                return `"${value}" is a reserved name and cannot be used`;
              }
              if (value.startsWith(".")) {
                return "Project name cannot start with a dot";
              }
              if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                return "Project name can only contain letters, numbers, hyphens, and underscores";
              }
              if (value.startsWith("-") || value.endsWith("-")) {
                return "Project name cannot start or end with hyphens";
              }
              return true;
            },
          },
          {
            type: opts?.pm ? null : "select",
            name: "pm",
            message: "Package manager:",
            choices: [
              { title: "⭐ bun", value: "bun" },
              { title: "  npm", value: "npm" },
              { title: "  pnpm", value: "pnpm" },
              { title: "  yarn", value: "yarn" },
            ],
            initial: 0,
          },
          {
            type: typeof opts?.install === "boolean" ? null : "toggle",
            name: "install",
            message: "Install dependencies?",
            initial: true,
            active: "yes",
            inactive: "no",
          },
          {
            type: typeof opts?.git === "boolean" ? null : "toggle",
            name: "git",
            message: "Initialize git repository?",
            initial: true,
            active: "yes",
            inactive: "no",
          },
        ],
        {
          onCancel: () => {
            log.warn("Operation cancelled");
            process.exit(0);
          },
        }
      );

      // Merge arguments and prompt answers
      const config: NewOptions = {
        template: (templateArg as TemplateKey) ?? answers.template,
        name: nameArg ?? answers.name,
        pm: opts?.pm ?? answers.pm,
        install: opts?.install ?? answers.install,
        git: opts?.git ?? answers.git,
      };

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

      // Validate template
      if (!isValidTemplate(config.template)) {
        log.err(`Unknown template: "${config.template}"`);
        console.log();
        log.info("Available templates:");
        getOrderedTemplates().forEach((key) => {
          const template = registry[key];
          const indicator = template.popular ? "⭐ " : "  ";
          console.log(`${indicator}${key} — ${template.title}`);
        });
        console.log();
        log.info("Use `peezy list` to see all available templates");
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

      const projectPath = scaffold(config.template, config.name);
      log.ok(`Files created in ./${config.name}`);

      // Install dependencies
      if (config.install !== false) {
        try {
          const pm = config.pm ?? (await getRecommendedPackageManager());
          log.info(`Installing dependencies with ${pm}...`);
          await installDeps(pm, projectPath);
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
          await initGit(projectPath);
          log.ok("Git repository initialized");
        } catch (error) {
          log.warn(
            `Git initialization failed: ${error instanceof Error ? error.message : String(error)}`
          );
          log.info("You can initialize git manually later");
        }
      }

      // Show next steps
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
    } catch (error) {
      log.err(
        `Failed to create project: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
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
  .option("--ports <ports>", "Comma-separated list of ports to check", "3000,5173,8000")
  .action(async (options) => {
    const { doctor } = await import("./commands/doctor.js");
    const ports = String(options.ports)
      .split(",")
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !Number.isNaN(n));
    const code = await doctor({
      fixLint: !!options.fixLint,
      fixEnvExamples: !!options.fixEnvExamples,
      ports,
    });
    process.exit(code);
  });

program
  .command("env")
  .description("Typed env management: check, diff, generate, pull:railway, push:railway")
  .argument("<subcommand>")
  .option("--schema <path>", "Path to env schema JSON (required/optional keys)")
  .action(async (subcommand: string, options) => {
    const { runEnv } = await import("./commands/env.js");
    await runEnv(subcommand as any, { schema: options.schema });
  });

program
  .command("readme")
  .description("Generate README and/or CHANGELOG with badges")
  .option("--name <name>")
  .option("--no-badges")
  .option("--changelog", "Also generate CHANGELOG.md", false)
  .action(async (options) => {
    const { generateReadme, generateChangelog } = await import("./commands/readme-changelog.js");
    await generateReadme({ name: options.name, badges: options.badges });
    if (options.changelog) await generateChangelog();
  });

program
  .command("upgrade")
  .description("Check for updates to templates/plugins and preview diffs")
  .option("--dry-run", "Preview changes only", false)
  .action(async (options) => {
    const { upgrade } = await import("./commands/upgrade.js");
    await upgrade({ dryRun: !!options.dryRun });
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
  .action(async (options) => {
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

        if (options.format === "json") {
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
          options.format as "json" | "markdown" | "console",
          true
        );
        console.log(report);
      }
    } catch (error) {
      log.err(
        `Failed to check versions: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

// Parse command line arguments
program.parseAsync(process.argv).catch((error) => {
  log.err(`CLI error: ${error.message}`);
  process.exit(1);
});
