import { spawn } from "node:child_process";
import type { PackageManager } from "../types.js";

/**
 * Install dependencies using the specified package manager
 * @param pm - Package manager to use
 * @param cwd - Working directory for the installation
 */
export function installDeps(pm: PackageManager, cwd: string): Promise<void> {
  const commands: Record<PackageManager, [string, string[]]> = {
    bun: ["bun", ["install"]],
    npm: ["npm", ["install"]],
    pnpm: ["pnpm", ["install"]],
    yarn: ["yarn", []],
  };

  const [command, args] = commands[pm] ?? commands.npm;

  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: "inherit",
      cwd,
      shell: true, // Enable shell for better cross-platform compatibility
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });

    process.on("error", (error) => {
      reject(new Error(`Failed to start ${command}: ${error.message}`));
    });
  });
}

/**
 * Check if a package manager is available on the system
 * @param pm - Package manager to check
 */
export function isPackageManagerAvailable(
  pm: PackageManager
): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn(pm, ["--version"], {
      stdio: "ignore",
      shell: true,
    });

    process.on("close", (code) => {
      resolve(code === 0);
    });

    process.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Get the recommended package manager based on availability
 * Prioritizes: bun > pnpm > yarn > npm
 */
export async function getRecommendedPackageManager(): Promise<PackageManager> {
  const preferences: PackageManager[] = ["bun", "pnpm", "yarn", "npm"];

  for (const pm of preferences) {
    if (await isPackageManagerAvailable(pm)) {
      return pm;
    }
  }

  // Fallback to npm (should always be available with Node.js)
  return "npm";
}
