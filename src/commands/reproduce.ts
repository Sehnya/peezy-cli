import { promises as fs } from "fs";
import { join, resolve } from "path";
import { readLockFile, verifyProjectIntegrity } from "../utils/lock-file.js";
import { scaffold } from "../actions/scaffold.js";
import { installDeps } from "../actions/install.js";
import { initGit } from "../actions/git.js";
import { log } from "../utils/logger.js";
import type { PeezyLockFile } from "../types.js";

export interface ReproduceOptions {
  lockFile?: string;
  verify?: boolean;
  json?: boolean;
}

export interface ReproduceResult {
  success: boolean;
  lockFile: PeezyLockFile;
  verification?: {
    valid: boolean;
    missingFiles: string[];
    modifiedFiles: string[];
    extraFiles: string[];
  };
}

/**
 * Reproduce a project from a peezy.lock.json file
 */
export async function reproduceProject(
  projectName: string,
  options: ReproduceOptions = {}
): Promise<ReproduceResult> {
  const lockFilePath =
    options.lockFile || join(process.cwd(), "peezy.lock.json");

  // Read the lock file
  let lockFile: PeezyLockFile;
  try {
    const content = await fs.readFile(lockFilePath, "utf-8");
    lockFile = JSON.parse(content) as PeezyLockFile;
  } catch (error) {
    throw new Error(
      `Failed to read lock file: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!options.json) {
    log.info(`Reproducing project from ${lockFilePath}`);
    log.info(
      `Template: ${lockFile.template.name}@${lockFile.template.version}`
    );
  }

  try {
    // Scaffold the project using the exact template from lock file
    // For local templates, use just the name without version
    const templateName =
      lockFile.template.source.type === "local"
        ? lockFile.template.name
        : `${lockFile.template.name}@${lockFile.template.version}`;

    const scaffoldResult = await scaffold(templateName, projectName, {
      name: projectName,
      install: lockFile.options.flags.installDeps,
      git: lockFile.options.flags.initGit,
      json: options.json,
    });

    if (!options.json) {
      log.ok(`Project scaffolded to ./${projectName}`);
    }

    // Install dependencies if specified in lock file
    if (lockFile.options.flags.installDeps) {
      try {
        // Try to determine package manager from lock file or use default
        const pm = "bun"; // TODO: Store package manager in lock file
        if (!options.json) {
          log.info(`Installing dependencies with ${pm}...`);
        }
        await installDeps(pm, scaffoldResult.projectPath);
        if (!options.json) {
          log.ok("Dependencies installed");
        }
      } catch (error) {
        if (!options.json) {
          log.warn(
            `Dependency installation failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    // Initialize git if specified in lock file
    if (lockFile.options.flags.initGit) {
      try {
        if (!options.json) {
          log.info("Initializing git repository...");
        }
        await initGit(scaffoldResult.projectPath);
        if (!options.json) {
          log.ok("Git repository initialized");
        }
      } catch (error) {
        if (!options.json) {
          log.warn(
            `Git initialization failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    let verification;
    if (options.verify) {
      if (!options.json) {
        log.info("Verifying project integrity...");
      }
      verification = await verifyProjectIntegrity(scaffoldResult.projectPath);

      if (!options.json) {
        if (verification.valid) {
          log.ok("Project verification passed");
        } else {
          log.warn("Project verification failed:");
          if (verification.missingFiles.length > 0) {
            log.warn(`Missing files: ${verification.missingFiles.join(", ")}`);
          }
          if (verification.modifiedFiles.length > 0) {
            log.warn(
              `Modified files: ${verification.modifiedFiles.join(", ")}`
            );
          }
        }
      }
    }

    return {
      success: true,
      lockFile,
      verification,
    };
  } catch (error) {
    throw new Error(
      `Failed to reproduce project: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Verify a project against its lock file
 */
export async function verifyProject(projectPath: string = process.cwd()) {
  const lockFile = await readLockFile(projectPath);

  if (!lockFile) {
    throw new Error("No peezy.lock.json found in project directory");
  }

  const verification = await verifyProjectIntegrity(projectPath);

  return {
    valid: verification.valid,
    lockFile,
    verification,
    project: {
      name: lockFile.project.name,
      path: resolve(projectPath),
    },
  };
}
