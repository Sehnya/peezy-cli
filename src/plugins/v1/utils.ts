/**
 * Plugin Utilities v1.0
 *
 * Utility functions and helpers for plugin development
 */

import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { dirname } from "node:path";
import type { PluginUtils, PluginLogger } from "./types.js";
import { log } from "../../utils/logger.js";

/**
 * Create plugin utilities instance
 */
export function createPluginUtils(
  projectPath: string,
  dependencies: { production: string[]; development: string[] },
  packageJsonUpdates: Record<string, any>
): PluginUtils {
  return {
    fs: {
      async readFile(path: string): Promise<string> {
        return readFile(path, "utf8");
      },

      async writeFile(path: string, content: string): Promise<void> {
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, content, "utf8");
      },

      async exists(path: string): Promise<boolean> {
        try {
          await access(path);
          return true;
        } catch {
          return false;
        }
      },

      async mkdir(path: string): Promise<void> {
        await mkdir(path, { recursive: true });
      },

      async copy(src: string, dest: string): Promise<void> {
        await mkdir(dirname(dest), { recursive: true });
        await copyFile(src, dest);
      },
    },

    template: {
      render(template: string, data: Record<string, any>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return data[key] ?? match;
        });
      },

      replaceTokens(content: string, tokens: Record<string, string>): string {
        let result = content;
        for (const [token, value] of Object.entries(tokens)) {
          const regex = new RegExp(`\\$\\{${token}\\}`, "g");
          result = result.replace(regex, value);
        }
        return result;
      },
    },

    package: {
      addDependency(name: string, version?: string, dev = false): void {
        const depString = version ? `${name}@${version}` : name;
        if (dev) {
          dependencies.development.push(depString);
        } else {
          dependencies.production.push(depString);
        }
      },

      removeDependency(name: string): void {
        dependencies.production = dependencies.production.filter(
          (dep) => !dep.startsWith(name)
        );
        dependencies.development = dependencies.development.filter(
          (dep) => !dep.startsWith(name)
        );
      },

      updatePackageJson(updates: Record<string, any>): void {
        Object.assign(packageJsonUpdates, updates);
      },
    },

    git: {
      async isRepo(): Promise<boolean> {
        try {
          const { execSync } = await import("node:child_process");
          execSync("git rev-parse --git-dir", {
            cwd: projectPath,
            stdio: "ignore",
          });
          return true;
        } catch {
          return false;
        }
      },

      async init(): Promise<void> {
        const { execSync } = await import("node:child_process");
        execSync("git init", { cwd: projectPath });
      },

      async add(files: string[]): Promise<void> {
        const { execSync } = await import("node:child_process");
        execSync(`git add ${files.join(" ")}`, { cwd: projectPath });
      },

      async commit(message: string): Promise<void> {
        const { execSync } = await import("node:child_process");
        execSync(`git commit -m "${message}"`, { cwd: projectPath });
      },
    },
  };
}

/**
 * Create plugin logger instance
 */
export function createPluginLogger(pluginName: string): PluginLogger {
  const prefix = `[${pluginName}]`;

  return {
    info(message: string, ...args: any[]): void {
      log.info(`${prefix} ${message}`, ...args);
    },

    warn(message: string, ...args: any[]): void {
      log.warn(`${prefix} ${message}`, ...args);
    },

    error(message: string, ...args: any[]): void {
      log.err(`${prefix} ${message}`, ...args);
    },

    debug(message: string, ...args: any[]): void {
      log.debug(`${prefix} ${message}`, ...args);
    },

    success(message: string, ...args: any[]): void {
      log.ok(`${prefix} ${message}`, ...args);
    },
  };
}

/**
 * Validate plugin configuration
 */
export function validatePluginConfig(config: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config || typeof config !== "object") {
    errors.push("Plugin config must be an object");
    return { valid: false, errors };
  }

  if (!config.plugins || typeof config.plugins !== "object") {
    errors.push("Plugin config must have a plugins object");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create a basic plugin template
 */
export function createPluginTemplate(
  name: string,
  description: string
): string {
  return `/**
 * ${name} Plugin
 * ${description}
 */

import type { Plugin, PluginManifest, PluginHooks } from '@peezy/plugin-api';

export default class ${name.replace(/[^a-zA-Z0-9]/g, "")}Plugin implements Plugin {
  manifest: PluginManifest = {
    name: '${name}',
    version: '1.0.0',
    description: '${description}',
    author: 'Your Name',
    minCliVersion: '^1.0.0',
    homepage: 'https://github.com/your-username/${name}',
    keywords: ['peezy', 'plugin'],
    license: 'MIT'
  };

  hooks: PluginHooks = {
    async beforeScaffold(context) {
      context.logger.info('Running before scaffold hook');
    },

    async afterScaffold(context) {
      context.logger.info('Running after scaffold hook');
    },

    async configValidation(config) {
      return {
        valid: true,
        errors: [],
        warnings: []
      };
    }
  };

  async initialize(): Promise<void> {
    // Plugin initialization logic
  }

  async dispose(): Promise<void> {
    // Plugin cleanup logic
  }
}
`;
}

/**
 * Plugin development helpers
 */
export const PluginDev = {
  /**
   * Create a new plugin project structure
   */
  async createPluginProject(
    name: string,
    description: string,
    targetDir: string
  ): Promise<void> {
    const utils = createPluginUtils(
      targetDir,
      { production: [], development: [] },
      {}
    );

    // Create package.json
    const packageJson = {
      name,
      version: "1.0.0",
      description,
      main: "dist/index.js",
      types: "dist/index.d.ts",
      scripts: {
        build: "tsc",
        dev: "tsc --watch",
        test: "jest",
        prepublishOnly: "npm run build",
      },
      peerDependencies: {
        "@peezy/plugin-api": "^1.0.0",
      },
      devDependencies: {
        "@peezy/plugin-api": "^1.0.0",
        "@types/node": "^20.0.0",
        typescript: "^5.0.0",
        jest: "^29.0.0",
        "@types/jest": "^29.0.0",
      },
      keywords: ["peezy", "plugin"],
      license: "MIT",
    };

    await utils.fs.writeFile(
      `${targetDir}/package.json`,
      JSON.stringify(packageJson, null, 2)
    );

    // Create TypeScript config
    const tsConfig = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        declaration: true,
        outDir: "dist",
        rootDir: "src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist", "**/*.test.ts"],
    };

    await utils.fs.writeFile(
      `${targetDir}/tsconfig.json`,
      JSON.stringify(tsConfig, null, 2)
    );

    // Create plugin source
    await utils.fs.mkdir(`${targetDir}/src`);
    await utils.fs.writeFile(
      `${targetDir}/src/index.ts`,
      createPluginTemplate(name, description)
    );

    // Create README
    const readme = `# ${name}

${description}

## Installation

\`\`\`bash
npm install ${name}
\`\`\`

## Usage

Add to your \`.peezy/plugins.json\`:

\`\`\`json
{
  "plugins": {
    "${name}": {
      "enabled": true
    }
  }
}
\`\`\`

## Configuration

This plugin supports the following configuration options:

\`\`\`json
{
  "plugins": {
    "${name}": {
      "enabled": true,
      "config": {
        // Plugin-specific configuration
      }
    }
  }
}
\`\`\`

## Development

\`\`\`bash
npm run dev    # Watch mode
npm run build  # Build for production
npm test       # Run tests
\`\`\`

## License

MIT
`;

    await utils.fs.writeFile(`${targetDir}/README.md`, readme);

    // Create .gitignore
    const gitignore = `node_modules/
dist/
*.log
.DS_Store
`;

    await utils.fs.writeFile(`${targetDir}/.gitignore`, gitignore);
  },
};
