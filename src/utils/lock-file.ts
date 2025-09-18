import { promises as fs } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import type { PeezyLockFile, TemplateSource, NewOptions } from "../types.js";
import { log } from "./logger.js";

const LOCK_FILE_NAME = "peezy.lock.json";
const SCHEMA_URL = "https://peezy.dev/schemas/peezy.lock.schema.json";

/**
 * Generate checksums for files in a directory
 */
export async function generateFileChecksums(
  projectPath: string,
  excludePatterns: string[] = [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**",
    "*.log",
    "peezy.lock.json",
  ]
): Promise<Record<string, string>> {
  const checksums: Record<string, string> = {};

  try {
    const files = await getProjectFiles(projectPath, excludePatterns);

    for (const file of files) {
      const filePath = join(projectPath, file);
      const content = await fs.readFile(filePath);
      const hash = createHash("sha256").update(content).digest("hex");
      checksums[file] = `sha256-${hash}`;
    }
  } catch (error) {
    log.warn(
      `Failed to generate checksums: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return checksums;
}

/**
 * Get all files in a project directory, excluding patterns
 */
async function getProjectFiles(
  projectPath: string,
  excludePatterns: string[]
): Promise<string[]> {
  const files: string[] = [];

  async function walkDir(dir: string, relativePath = ""): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativeFilePath = relativePath
        ? join(relativePath, entry.name)
        : entry.name;

      // Check if this path should be excluded
      const shouldExclude = excludePatterns.some((pattern) => {
        if (pattern.endsWith("/**")) {
          const dirPattern = pattern.slice(0, -3);
          return relativeFilePath.startsWith(dirPattern);
        }
        if (pattern.startsWith("*.")) {
          const ext = pattern.slice(1);
          return relativeFilePath.endsWith(ext);
        }
        return relativeFilePath === pattern;
      });

      if (shouldExclude) continue;

      if (entry.isDirectory()) {
        await walkDir(fullPath, relativeFilePath);
      } else {
        files.push(relativeFilePath);
      }
    }
  }

  await walkDir(projectPath);
  return files.sort();
}

/**
 * Create a lock file for a newly scaffolded project
 */
export async function createLockFile(
  projectPath: string,
  templateName: string,
  templateVersion: string,
  options: NewOptions,
  templateSource?: TemplateSource
): Promise<PeezyLockFile> {
  const lockFile: PeezyLockFile = {
    $schema: SCHEMA_URL,
    peezyVersion: process.env.npm_package_version || "0.1.4",
    formatVersion: 1,
    project: {
      name: options.name || "unknown",
      createdAt: new Date().toISOString(),
    },
    template: {
      name: templateName,
      version: templateVersion,
      source: templateSource || {
        type: "local",
        path: templateName,
      },
      engine: "dir",
    },
    options: {
      flags: {
        installDeps: options.install !== false,
        initGit: options.git !== false,
      },
      answers: {}, // TODO: Capture interactive prompt answers
    },
    checksums: {
      files: await generateFileChecksums(projectPath),
    },
  };

  const lockFilePath = join(projectPath, LOCK_FILE_NAME);
  await fs.writeFile(lockFilePath, JSON.stringify(lockFile, null, 2));

  return lockFile;
}

/**
 * Read an existing lock file
 */
export async function readLockFile(
  projectPath: string
): Promise<PeezyLockFile | null> {
  const lockFilePath = join(projectPath, LOCK_FILE_NAME);

  try {
    const content = await fs.readFile(lockFilePath, "utf-8");
    return JSON.parse(content) as PeezyLockFile;
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * Verify a project against its lock file
 */
export async function verifyProjectIntegrity(projectPath: string): Promise<{
  valid: boolean;
  missingFiles: string[];
  modifiedFiles: string[];
  extraFiles: string[];
}> {
  const lockFile = await readLockFile(projectPath);

  if (!lockFile) {
    throw new Error("No peezy.lock.json found in project");
  }

  const currentChecksums = await generateFileChecksums(projectPath);
  const expectedChecksums = lockFile.checksums.files;

  const missingFiles: string[] = [];
  const modifiedFiles: string[] = [];
  const extraFiles: string[] = [];

  // Check for missing or modified files
  for (const [file, expectedChecksum] of Object.entries(expectedChecksums)) {
    if (!(file in currentChecksums)) {
      missingFiles.push(file);
    } else if (currentChecksums[file] !== expectedChecksum) {
      modifiedFiles.push(file);
    }
  }

  // Check for extra files
  for (const file of Object.keys(currentChecksums)) {
    if (!(file in expectedChecksums)) {
      extraFiles.push(file);
    }
  }

  return {
    valid: missingFiles.length === 0 && modifiedFiles.length === 0,
    missingFiles,
    modifiedFiles,
    extraFiles,
  };
}

/**
 * Update lock file checksums after project modifications
 */
export async function updateLockFileChecksums(
  projectPath: string
): Promise<void> {
  const lockFile = await readLockFile(projectPath);

  if (!lockFile) {
    throw new Error("No peezy.lock.json found in project");
  }

  lockFile.checksums.files = await generateFileChecksums(projectPath);

  const lockFilePath = join(projectPath, LOCK_FILE_NAME);
  await fs.writeFile(lockFilePath, JSON.stringify(lockFile, null, 2));
}
