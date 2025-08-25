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

// Parse command line arguments
program.parseAsync(process.argv).catch((error) => {
  log.err(`CLI error: ${error.message}`);
  process.exit(1);
});
