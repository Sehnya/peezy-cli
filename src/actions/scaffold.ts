import path from "node:path";
import fs from "node:fs";
import {
  copyDir,
  replaceTokens,
  sanitizePackageName,
  isDirectoryEmpty,
} from "../utils/fsx.js";
import { registry } from "../registry.js";
import type { TemplateKey } from "../types.js";

/**
 * Scaffold a new project from a template
 * @param templateKey - The template to use
 * @param destName - The destination directory name
 * @returns The absolute path to the created project
 */
export function scaffold(templateKey: TemplateKey, destName: string): string {
  const template = registry[templateKey];

  if (!template) {
    throw new Error(`Unknown template: ${templateKey}`);
  }

  // Resolve destination path
  const destPath = path.resolve(process.cwd(), destName);

  // Check if destination exists and is not empty
  if (fs.existsSync(destPath)) {
    const stat = fs.statSync(destPath);
    if (stat.isFile()) {
      throw new Error(
        `Cannot create directory "${destName}": a file with that name already exists`
      );
    }
    if (stat.isDirectory() && !isDirectoryEmpty(destPath)) {
      throw new Error(
        `Directory "${destName}" already exists and is not empty. Please choose a different name or remove the existing directory.`
      );
    }
  }

  // Validate template exists
  if (!fs.existsSync(template.path)) {
    throw new Error(`Template directory not found: ${template.path}`);
  }

  try {
    // Copy template files
    copyDir(template.path, destPath);

    // Replace tokens
    const tokens = {
      APP_NAME: destName,
      PKG_NAME: sanitizePackageName(destName),
    };

    replaceTokens(destPath, tokens);

    return destPath;
  } catch (error) {
    // Clean up on failure
    if (fs.existsSync(destPath)) {
      try {
        fs.rmSync(destPath, { recursive: true, force: true });
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    // Provide more specific error messages
    if (error instanceof Error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === "EACCES") {
        throw new Error(
          `Permission denied: Cannot create project in "${destName}". Check your permissions.`
        );
      }
      if (nodeError.code === "ENOSPC") {
        throw new Error(
          `Not enough disk space to create project "${destName}".`
        );
      }
      if (nodeError.code === "EMFILE" || nodeError.code === "ENFILE") {
        throw new Error(
          `Too many open files. Try closing other applications and try again.`
        );
      }
    }

    throw error;
  }
}
