import fs from "node:fs/promises";
import path from "node:path";
import prompts from "prompts";
import { log } from "../utils/logger.js";
import { replaceTokens, sanitizePackageName } from "../utils/fsx.js";
import {
  createSuccessOutput,
  createErrorOutput,
  outputJson,
} from "../utils/json-output.js";

export interface AddFileOptions {
  json?: boolean;
  force?: boolean;
  category?: string;
}

export interface FileTemplate {
  name: string;
  description: string;
  category: string;
  path: string;
  dependencies?: string[];
  scripts?: Record<string, string>;
  devDependencies?: string[];
  requiredFiles?: string[];
  conflictsWith?: string[];
  framework?: string[];
  language?: string[];
}

export interface ProjectContext {
  hasPackageJson: boolean;
  hasTypeScript: boolean;
  hasReact: boolean;
  hasVue: boolean;
  hasNextJs: boolean;
  hasExpress: boolean;
  hasVite: boolean;
  hasTailwind: boolean;
  hasESLint: boolean;
  hasPrettier: boolean;
  hasJest: boolean;
  hasVitest: boolean;
  hasDocker: boolean;
  hasPython: boolean;
  framework: string;
  language: string;
  packageManager: string;
}

/**
 * Analyze the current project to understand its context
 */
async function analyzeProject(projectPath: string): Promise<ProjectContext> {
  const context: ProjectContext = {
    hasPackageJson: false,
    hasTypeScript: false,
    hasReact: false,
    hasVue: false,
    hasNextJs: false,
    hasExpress: false,
    hasVite: false,
    hasTailwind: false,
    hasESLint: false,
    hasPrettier: false,
    hasJest: false,
    hasVitest: false,
    hasDocker: false,
    hasPython: false,
    framework: "unknown",
    language: "javascript",
    packageManager: "npm",
  };

  try {
    // Check for package.json
    const packageJsonPath = path.join(projectPath, "package.json");
    if (await fileExists(packageJsonPath)) {
      context.hasPackageJson = true;
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf-8")
      );

      // Analyze dependencies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      context.hasReact = "react" in allDeps;
      context.hasVue = "vue" in allDeps;
      context.hasNextJs = "next" in allDeps;
      context.hasExpress = "express" in allDeps;
      context.hasVite =
        "@vitejs/plugin-react" in allDeps || "@vitejs/plugin-vue" in allDeps;
      context.hasTailwind = "tailwindcss" in allDeps;
      context.hasESLint = "eslint" in allDeps;
      context.hasPrettier = "prettier" in allDeps;
      context.hasJest = "jest" in allDeps;
      context.hasVitest = "vitest" in allDeps;

      // Determine framework
      if (context.hasNextJs) context.framework = "nextjs";
      else if (context.hasReact && context.hasVite)
        context.framework = "react-vite";
      else if (context.hasReact) context.framework = "react";
      else if (context.hasVue) context.framework = "vue";
      else if (context.hasExpress) context.framework = "express";

      // Determine package manager
      if (await fileExists(path.join(projectPath, "bun.lockb")))
        context.packageManager = "bun";
      else if (await fileExists(path.join(projectPath, "pnpm-lock.yaml")))
        context.packageManager = "pnpm";
      else if (await fileExists(path.join(projectPath, "yarn.lock")))
        context.packageManager = "yarn";
    }

    // Check for TypeScript
    context.hasTypeScript =
      (await fileExists(path.join(projectPath, "tsconfig.json"))) ||
      (await fileExists(path.join(projectPath, "tsconfig.ts")));

    if (context.hasTypeScript) context.language = "typescript";

    // Check for Docker
    context.hasDocker = await fileExists(path.join(projectPath, "Dockerfile"));

    // Check for Python
    context.hasPython =
      (await fileExists(path.join(projectPath, "requirements.txt"))) ||
      (await fileExists(path.join(projectPath, "pyproject.toml"))) ||
      (await fileExists(path.join(projectPath, "main.py"))) ||
      (await fileExists(path.join(projectPath, "app.py")));

    if (context.hasPython) context.language = "python";
  } catch (error) {
    log.debug(`Error analyzing project: ${error}`);
  }

  return context;
}

/**
 * Get available file templates based on project context
 */
function getAvailableFiles(context: ProjectContext): FileTemplate[] {
  const files: FileTemplate[] = [];

  // TypeScript Configuration Files
  if (context.hasTypeScript && context.hasPackageJson) {
    if (context.hasNextJs) {
      files.push({
        name: "tsconfig.json",
        description: "Next.js TypeScript configuration",
        category: "TypeScript",
        path: "configs/nextjs-tsconfig.json",
        framework: ["nextjs"],
        language: ["typescript"],
      });
      files.push({
        name: "next-env.d.ts",
        description: "Next.js environment type declarations",
        category: "TypeScript",
        path: "configs/next-env.d.ts",
        framework: ["nextjs"],
        language: ["typescript"],
      });
    } else if (context.hasReact && context.hasVite) {
      files.push({
        name: "tsconfig.json",
        description: "React + Vite TypeScript configuration",
        category: "TypeScript",
        path: "configs/react-vite-tsconfig.json",
        framework: ["react-vite"],
        language: ["typescript"],
      });
      files.push({
        name: "tsconfig.node.json",
        description: "Node.js TypeScript configuration for Vite",
        category: "TypeScript",
        path: "configs/tsconfig.node.json",
        framework: ["react-vite", "vue"],
        language: ["typescript"],
      });
    } else if (context.hasVue) {
      files.push({
        name: "tsconfig.json",
        description: "Vue TypeScript configuration",
        category: "TypeScript",
        path: "configs/vue-tsconfig.json",
        framework: ["vue"],
        language: ["typescript"],
      });
    } else if (context.hasExpress) {
      files.push({
        name: "tsconfig.json",
        description: "Express TypeScript configuration",
        category: "TypeScript",
        path: "configs/express-tsconfig.json",
        framework: ["express"],
        language: ["typescript"],
      });
    }
  }

  // ESLint Configuration Files
  if (context.hasPackageJson) {
    if (context.hasNextJs) {
      files.push({
        name: ".eslintrc.json",
        description: "Next.js ESLint configuration",
        category: "Code Quality",
        path: "configs/nextjs-eslintrc.json",
        dependencies: ["eslint", "eslint-config-next"],
        devDependencies: [
          "eslint",
          "eslint-config-next",
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/parser",
        ],
        scripts: { lint: "next lint" },
        framework: ["nextjs"],
      });
    } else if (context.hasReact) {
      files.push({
        name: ".eslintrc.json",
        description: "React ESLint configuration",
        category: "Code Quality",
        path: "configs/react-eslintrc.json",
        devDependencies: [
          "eslint",
          "eslint-plugin-react",
          "eslint-plugin-react-hooks",
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/parser",
        ],
        scripts: {
          lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        },
        framework: ["react", "react-vite"],
      });
    } else if (context.hasVue) {
      files.push({
        name: ".eslintrc.json",
        description: "Vue ESLint configuration",
        category: "Code Quality",
        path: "configs/vue-eslintrc.json",
        devDependencies: [
          "eslint",
          "eslint-plugin-vue",
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/parser",
        ],
        scripts: {
          lint: "eslint . --ext ts,vue --report-unused-disable-directives --max-warnings 0",
        },
        framework: ["vue"],
      });
    } else if (context.hasExpress) {
      files.push({
        name: ".eslintrc.json",
        description: "Express ESLint configuration",
        category: "Code Quality",
        path: "configs/express-eslintrc.json",
        devDependencies: [
          "eslint",
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/parser",
        ],
        scripts: { lint: "eslint src --ext .ts" },
        framework: ["express"],
      });
    }
  }

  // Prettier Configuration
  if (context.hasPackageJson) {
    files.push({
      name: ".prettierrc",
      description: "Prettier code formatting configuration",
      category: "Code Quality",
      path: "configs/prettierrc.json",
      devDependencies: ["prettier"],
      scripts: { format: "prettier --write ." },
    });
  }

  // PostCSS Configuration
  if (context.hasTailwind) {
    files.push({
      name: "postcss.config.js",
      description: "PostCSS configuration for Tailwind CSS",
      category: "Styling",
      path: "configs/postcss.config.js",
      requiredFiles: ["tailwind.config.js"],
    });
  }

  // Testing Configuration
  if (context.hasPackageJson) {
    if (context.hasReact || context.hasVue) {
      files.push({
        name: "vitest.config.ts",
        description: "Vitest testing configuration",
        category: "Testing",
        path: "configs/vitest.config.ts",
        devDependencies: [
          "vitest",
          "@testing-library/react",
          "@testing-library/jest-dom",
          "jsdom",
        ],
        scripts: { test: "vitest", "test:ui": "vitest --ui" },
        framework: ["react", "react-vite", "vue"],
      });
      files.push({
        name: "src/test/setup.ts",
        description: "Test environment setup file",
        category: "Testing",
        path: "configs/test-setup.ts",
        requiredFiles: ["vitest.config.ts"],
        framework: ["react", "react-vite", "vue"],
      });
    }

    if (context.hasExpress || (!context.hasReact && !context.hasVue)) {
      files.push({
        name: "jest.config.js",
        description: "Jest testing configuration",
        category: "Testing",
        path: "configs/jest.config.js",
        devDependencies: ["jest", "@types/jest", "ts-jest"],
        scripts: { test: "jest", "test:watch": "jest --watch" },
        framework: ["express"],
      });
    }
  }

  // Docker Configuration
  if (context.hasPackageJson) {
    if (context.hasNextJs) {
      files.push({
        name: "Dockerfile",
        description: "Next.js optimized Docker configuration",
        category: "Docker",
        path: "configs/nextjs-Dockerfile",
        framework: ["nextjs"],
      });
      files.push({
        name: ".dockerignore",
        description: "Docker ignore patterns for Next.js",
        category: "Docker",
        path: "configs/nextjs-dockerignore",
        framework: ["nextjs"],
      });
    } else if (context.hasReact && context.hasVite) {
      files.push({
        name: "Dockerfile",
        description: "React SPA with Nginx Docker configuration",
        category: "Docker",
        path: "configs/react-spa-Dockerfile",
        framework: ["react-vite"],
      });
      files.push({
        name: "nginx.conf",
        description: "Nginx configuration for React SPA",
        category: "Docker",
        path: "configs/nginx.conf",
        requiredFiles: ["Dockerfile"],
        framework: ["react-vite"],
      });
      files.push({
        name: ".dockerignore",
        description: "Docker ignore patterns for React SPA",
        category: "Docker",
        path: "configs/react-dockerignore",
        framework: ["react-vite"],
      });
    } else if (context.hasExpress) {
      files.push({
        name: "Dockerfile",
        description: "Express.js Docker configuration",
        category: "Docker",
        path: "configs/express-Dockerfile",
        framework: ["express"],
      });
      files.push({
        name: ".dockerignore",
        description: "Docker ignore patterns for Express",
        category: "Docker",
        path: "configs/express-dockerignore",
        framework: ["express"],
      });
    }

    // Docker Compose
    files.push({
      name: "docker-compose.yml",
      description: "Docker Compose for production",
      category: "Docker",
      path: "configs/docker-compose.yml",
      requiredFiles: ["Dockerfile"],
    });
    files.push({
      name: "docker-compose.dev.yml",
      description: "Docker Compose for development",
      category: "Docker",
      path: "configs/docker-compose.dev.yml",
    });
  }

  // Environment Files
  files.push({
    name: ".env.example",
    description: "Environment variables template",
    category: "Configuration",
    path: "configs/env.example",
  });

  // Git Configuration
  if (context.hasPackageJson) {
    files.push({
      name: ".gitignore",
      description: "Git ignore patterns for Node.js projects",
      category: "Git",
      path: "configs/nodejs-gitignore",
      language: ["javascript", "typescript"],
    });
  } else if (context.hasPython) {
    files.push({
      name: ".gitignore",
      description: "Git ignore patterns for Python projects",
      category: "Git",
      path: "configs/python-gitignore",
      language: ["python"],
    });
  }

  // GitHub Actions
  if (context.hasPackageJson) {
    files.push({
      name: ".github/workflows/ci.yml",
      description: "GitHub Actions CI/CD workflow",
      category: "CI/CD",
      path: "configs/github-ci.yml",
    });
  }

  return files;
}

/**
 * Filter files based on project context and existing files
 */
async function filterAvailableFiles(
  files: FileTemplate[],
  context: ProjectContext,
  projectPath: string
): Promise<FileTemplate[]> {
  const filtered: FileTemplate[] = [];

  for (const file of files) {
    // Skip if file already exists
    const filePath = path.join(projectPath, file.name);
    if (await fileExists(filePath)) {
      continue;
    }

    // Skip if framework doesn't match
    if (file.framework && !file.framework.includes(context.framework)) {
      continue;
    }

    // Skip if language doesn't match
    if (file.language && !file.language.includes(context.language)) {
      continue;
    }

    // Skip if required files are missing
    if (file.requiredFiles) {
      const hasAllRequired = await Promise.all(
        file.requiredFiles.map((reqFile) =>
          fileExists(path.join(projectPath, reqFile))
        )
      );
      if (!hasAllRequired.every(Boolean)) {
        continue;
      }
    }

    // Skip if conflicts with existing files
    if (file.conflictsWith) {
      const hasConflicts = await Promise.all(
        file.conflictsWith.map((conflictFile) =>
          fileExists(path.join(projectPath, conflictFile))
        )
      );
      if (hasConflicts.some(Boolean)) {
        continue;
      }
    }

    filtered.push(file);
  }

  return filtered;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Add selected files to the project
 */
export async function addFiles(
  projectPath: string = process.cwd(),
  options: AddFileOptions = {}
): Promise<void> {
  try {
    // Analyze the current project
    log.info("Analyzing project structure...");
    const context = await analyzeProject(projectPath);

    if (options.json) {
      log.debug(`Project context: ${JSON.stringify(context, null, 2)}`);
    } else {
      log.info(
        `Detected: ${context.framework} project with ${context.language}`
      );
    }

    // Get available files
    const allFiles = getAvailableFiles(context);
    const availableFiles = await filterAvailableFiles(
      allFiles,
      context,
      projectPath
    );

    if (availableFiles.length === 0) {
      if (options.json) {
        const output = createSuccessOutput({
          message: "No additional files available for this project",
          context,
        });
        outputJson(output);
      } else {
        log.info("🎉 Your project already has all recommended files!");
        log.info("No additional configuration files are needed.");
      }
      return;
    }

    // Group files by category
    const filesByCategory = availableFiles.reduce(
      (acc, file) => {
        if (!acc[file.category]) acc[file.category] = [];
        acc[file.category].push(file);
        return acc;
      },
      {} as Record<string, FileTemplate[]>
    );

    if (!options.json) {
      log.info(
        `Found ${availableFiles.length} files that can be added to your project:`
      );
      console.log();
    }

    // Interactive file selection
    const choices = availableFiles.map((file) => ({
      title: `${file.name}`,
      description: file.description,
      value: file,
      selected: false,
    }));

    if (options.json) {
      const output = createSuccessOutput({
        availableFiles: availableFiles.map((f) => ({
          name: f.name,
          description: f.description,
          category: f.category,
        })),
        context,
      });
      outputJson(output);
      return;
    }

    const response = await prompts({
      type: "multiselect",
      name: "selectedFiles",
      message:
        "Select files to add (use spacebar to select, enter to confirm):",
      choices,
      hint: "- Space to select. Return to submit",
      instructions: false,
    });

    if (!response.selectedFiles || response.selectedFiles.length === 0) {
      log.info("No files selected. Exiting.");
      return;
    }

    const selectedFiles = response.selectedFiles as FileTemplate[];

    log.info(`Adding ${selectedFiles.length} file(s) to your project...`);
    console.log();

    // Add selected files
    const results = [];
    for (const file of selectedFiles) {
      try {
        await addSingleFile(file, projectPath, context, options);
        results.push({ file: file.name, success: true });
        log.ok(`Added ${file.name}`);
      } catch (error) {
        results.push({
          file: file.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        log.err(
          `Failed to add ${file.name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Update package.json if needed
    const needsPackageUpdate = selectedFiles.some(
      (f) => f.devDependencies || f.scripts
    );
    if (needsPackageUpdate && context.hasPackageJson) {
      await updatePackageJson(selectedFiles, projectPath, context);
    }

    console.log();
    log.ok(
      `Successfully added ${results.filter((r) => r.success).length} file(s)`
    );

    if (results.some((r) => !r.success)) {
      log.warn(
        `Failed to add ${results.filter((r) => !r.success).length} file(s)`
      );
    }

    // Show next steps
    showNextSteps(selectedFiles, context);
  } catch (error) {
    if (options.json) {
      const output = createErrorOutput([
        error instanceof Error ? error.message : String(error),
      ]);
      outputJson(output);
    } else {
      log.err(
        `Failed to add files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    process.exit(1);
  }
}

/**
 * Add a single file to the project
 */
async function addSingleFile(
  file: FileTemplate,
  projectPath: string,
  context: ProjectContext,
  options: AddFileOptions
): Promise<void> {
  const targetPath = path.join(projectPath, file.name);
  const targetDir = path.dirname(targetPath);

  // Create directory if it doesn't exist
  await fs.mkdir(targetDir, { recursive: true });

  // Get the template file content
  const templateContent = await getTemplateContent(file, context);

  // Write the file
  await fs.writeFile(targetPath, templateContent, "utf-8");
}

/**
 * Get template content for a file
 */
async function getTemplateContent(
  file: FileTemplate,
  context: ProjectContext
): Promise<string> {
  // This would normally read from template files, but for now we'll generate content
  // In a full implementation, you'd have actual template files

  switch (file.name) {
    case "tsconfig.json":
      return generateTsConfig(context);
    case ".eslintrc.json":
      return generateEslintConfig(context);
    case ".prettierrc":
      return generatePrettierConfig();
    case "postcss.config.js":
      return generatePostCssConfig();
    case ".env.example":
      return generateEnvExample(context);
    case ".gitignore":
      return generateGitignore(context);
    case "vitest.config.ts":
      return generateVitestConfig(context);
    case "src/test/setup.ts":
      return generateTestSetup();
    case "jest.config.js":
      return generateJestConfig();
    case "Dockerfile":
      return generateDockerfile(context);
    case ".dockerignore":
      return generateDockerignore(context);
    case "nginx.conf":
      return generateNginxConfig();
    case "docker-compose.yml":
      return generateDockerCompose(context);
    case "docker-compose.dev.yml":
      return generateDockerComposeDev(context);
    case ".github/workflows/ci.yml":
      return generateGithubCI(context);
    case "next-env.d.ts":
      return generateNextEnv();
    default:
      return `# ${file.description}\n# Generated by Peezy CLI\n`;
  }
}

/**
 * Update package.json with new dependencies and scripts
 */
async function updatePackageJson(
  files: FileTemplate[],
  projectPath: string,
  context: ProjectContext
): Promise<void> {
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

  let updated = false;

  // Add dev dependencies
  const newDevDeps = files.flatMap((f) => f.devDependencies || []);
  if (newDevDeps.length > 0) {
    if (!packageJson.devDependencies) packageJson.devDependencies = {};

    for (const dep of newDevDeps) {
      if (!packageJson.devDependencies[dep]) {
        packageJson.devDependencies[dep] = getLatestVersion(dep);
        updated = true;
      }
    }
  }

  // Add scripts
  const newScripts = files.reduce((acc, f) => ({ ...acc, ...f.scripts }), {});
  if (Object.keys(newScripts).length > 0) {
    if (!packageJson.scripts) packageJson.scripts = {};

    for (const [script, command] of Object.entries(newScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        updated = true;
      }
    }
  }

  if (updated) {
    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n"
    );
    log.ok("Updated package.json with new dependencies and scripts");
  }
}

/**
 * Get latest version for a package (simplified)
 */
function getLatestVersion(packageName: string): string {
  // In a real implementation, you'd fetch from npm registry
  // For now, return common versions
  const versions: Record<string, string> = {
    eslint: "^8.57.0",
    prettier: "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "eslint-plugin-react": "^7.35.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-vue": "^9.27.0",
    vitest: "^1.6.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    jsdom: "^24.1.0",
    jest: "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.2",
  };

  return versions[packageName] || "^1.0.0";
}

/**
 * Show next steps after adding files
 */
function showNextSteps(files: FileTemplate[], context: ProjectContext): void {
  console.log();
  log.info("🎯 Next Steps:");

  const hasNewDeps = files.some((f) => f.devDependencies?.length);
  if (hasNewDeps) {
    console.log(
      `  1. Install new dependencies: ${context.packageManager} install`
    );
  }

  const hasLinting = files.some((f) => f.name === ".eslintrc.json");
  if (hasLinting) {
    console.log(`  2. Run linting: ${context.packageManager} run lint`);
  }

  const hasTesting = files.some(
    (f) =>
      f.name.includes("test") ||
      f.name.includes("jest") ||
      f.name.includes("vitest")
  );
  if (hasTesting) {
    console.log(`  3. Run tests: ${context.packageManager} run test`);
  }

  const hasDocker = files.some((f) => f.name === "Dockerfile");
  if (hasDocker) {
    console.log("  4. Build Docker image: docker build -t my-app .");
  }

  console.log();
  log.info("💡 Tip: Run 'peezy doctor' to check your project health");
}

// Template generators (simplified versions)
function generateTsConfig(context: ProjectContext): string {
  if (context.hasNextJs) {
    return JSON.stringify(
      {
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "es6"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          baseUrl: ".",
          paths: { "@/*": ["./src/*"] },
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      },
      null,
      2
    );
  }

  // Default React/Vite config
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ["src"],
      references: [{ path: "./tsconfig.node.json" }],
    },
    null,
    2
  );
}

function generateEslintConfig(context: ProjectContext): string {
  if (context.hasNextJs) {
    return JSON.stringify(
      {
        extends: ["next/core-web-vitals", "@typescript-eslint/recommended"],
        parser: "@typescript-eslint/parser",
        plugins: ["@typescript-eslint"],
        rules: {
          "@typescript-eslint/no-unused-vars": "error",
          "@typescript-eslint/no-explicit-any": "warn",
          "prefer-const": "error",
          "no-var": "error",
        },
        ignorePatterns: ["node_modules/", ".next/", "out/", "build/", "dist/"],
      },
      null,
      2
    );
  }

  if (context.hasReact) {
    return JSON.stringify(
      {
        parser: "@typescript-eslint/parser",
        extends: [
          "@typescript-eslint/recommended",
          "plugin:react/recommended",
          "plugin:react-hooks/recommended",
          "plugin:react/jsx-runtime",
        ],
        plugins: ["@typescript-eslint", "react", "react-hooks"],
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "module",
          ecmaFeatures: { jsx: true },
        },
        settings: { react: { version: "detect" } },
        rules: {
          "@typescript-eslint/no-unused-vars": "error",
          "@typescript-eslint/no-explicit-any": "warn",
          "react/react-in-jsx-scope": "off",
          "react/prop-types": "off",
          "prefer-const": "error",
          "no-var": "error",
        },
        ignorePatterns: ["node_modules/", "dist/", "build/", "*.js"],
      },
      null,
      2
    );
  }

  // Default config
  return JSON.stringify(
    {
      parser: "@typescript-eslint/parser",
      extends: ["@typescript-eslint/recommended"],
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "prefer-const": "error",
        "no-var": "error",
      },
      ignorePatterns: ["node_modules/", "dist/", "*.js"],
    },
    null,
    2
  );
}

function generatePrettierConfig(): string {
  return JSON.stringify(
    {
      semi: true,
      trailingComma: "es5",
      singleQuote: false,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
    },
    null,
    2
  );
}

function generatePostCssConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;
}

function generateEnvExample(context: ProjectContext): string {
  let content = "# Environment Variables\n\n";

  if (context.hasNextJs) {
    content += "# Next.js\nNEXT_PUBLIC_APP_URL=http://localhost:3000\n\n";
  }

  if (context.hasReact && context.hasVite) {
    content +=
      "# Vite\nVITE_API_URL=http://localhost:3001/api\nVITE_APP_NAME=My App\n\n";
  }

  content +=
    "# Database\n# DATABASE_URL=postgresql://user:password@localhost:5432/mydb\n\n";
  content += "# API Keys\n# API_KEY=your-api-key-here\n";

  return content;
}

function generateGitignore(context: ProjectContext): string {
  if (context.language === "python") {
    return `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`;
  }

  return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build outputs
dist/
build/
.vite/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log`;
}

function generateVitestConfig(context: ProjectContext): string {
  return `/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})`;
}

function generateTestSetup(): string {
  return `import '@testing-library/jest-dom'`;
}

function generateJestConfig(): string {
  return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};`;
}

function generateDockerfile(context: ProjectContext): string {
  if (context.hasNextJs) {
    return `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]`;
  }

  return `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/package*.json ./
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

USER appuser
EXPOSE 3000

CMD ["node", "dist/index.js"]`;
}

function generateDockerignore(context: ProjectContext): string {
  return `node_modules
npm-debug.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.git
.gitignore
README.md
Dockerfile*
docker-compose*.yml
.dockerignore
coverage
.nyc_output
.vscode
.idea
*.log
${context.hasNextJs ? ".next\nout" : "dist\nbuild"}
*.md
.eslintrc*
.prettierrc*
tsconfig*.json`;
}

function generateNginxConfig(): string {
  return `events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    server {
        listen 8080;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}`;
}

function generateDockerCompose(context: ProjectContext): string {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`;
}

function generateDockerComposeDev(context: ProjectContext): string {
  return `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:`;
}

function generateGithubCI(context: ProjectContext): string {
  return `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build --if-present
    - run: npm run lint --if-present
    - run: npm test --if-present`;
}

function generateNextEnv(): string {
  return `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.`;
}
