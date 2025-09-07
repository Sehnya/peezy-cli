import path from "node:path";
import fs from "node:fs";
import {
  copyDir,
  replaceTokens,
  sanitizePackageName,
  isDirectoryEmpty,
} from "../utils/fsx.js";
import { resolveTemplate } from "../registry.js";
import { createLockFile } from "../utils/lock-file.js";
import type { TemplateKey, NewOptions } from "../types.js";

/**
 * Scaffold a new project from a template (local or remote)
 * @param templateName - The template to use (supports @org/template@version format)
 * @param destName - The destination directory name
 * @param options - Scaffolding options
 * @returns The absolute path to the created project and template info
 */
export async function scaffold(
  templateName: string,
  destName: string,
  options: NewOptions = {}
): Promise<{
  projectPath: string;
  templateInfo: {
    name: string;
    version?: string;
    isRemote: boolean;
    resolvedUrl?: string;
    integrity?: string;
    path?: string;
  };
}> {
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

  let templatePath: string;
  let templateInfo: {
    name: string;
    version?: string;
    isRemote: boolean;
    resolvedUrl?: string;
    integrity?: string;
    path?: string;
  };

  try {
    // Resolve template (local or remote)
    const resolved = await resolveTemplate(templateName);
    templatePath = resolved.path;

    templateInfo = {
      name: templateName,
      version: resolved.version,
      isRemote: resolved.isRemote,
      path: resolved.isRemote ? undefined : templatePath,
    };

    // For remote templates, we need to get additional info
    if (resolved.isRemote && resolved.templateInfo) {
      templateInfo.resolvedUrl = resolved.templateInfo.resolvedUrl;
      templateInfo.integrity = resolved.templateInfo.integrity;
    }
  } catch (error) {
    throw new Error(
      `Failed to resolve template "${templateName}": ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Validate template exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template directory not found: ${templatePath}`);
  }

  try {
    // Copy template files
    copyDir(templatePath, destPath);

    // Replace tokens
    const tokens = {
      APP_NAME: destName,
      PKG_NAME: sanitizePackageName(destName),
    };

    replaceTokens(destPath, tokens);

    // Create peezy.lock.json for deterministic builds
    await createLockFile(
      destPath,
      templateInfo.name,
      templateInfo.version || "latest",
      options,
      templateInfo.isRemote
        ? {
            type: "registry",
            resolvedUrl: templateInfo.resolvedUrl,
            integrity: templateInfo.integrity,
          }
        : {
            type: "local",
            path: templateInfo.path,
          }
    );

    return { projectPath: destPath, templateInfo };
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
