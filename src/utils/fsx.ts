import fs from "node:fs";
import path from "node:path";
import type { TokenReplacements } from "../types.js";

/**
 * Recursively copy a directory from source to destination
 */
export function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(src)) {
    throw new Error(`Template directory not found: ${src}`);
  }

  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === "EACCES") {
        throw new Error(
          `Permission denied while copying files. Check your permissions for: ${dest}`
        );
      }
      if (nodeError.code === "ENOSPC") {
        throw new Error(`Not enough disk space to copy template files.`);
      }
    }
    throw error;
  }
}

/**
 * Replace tokens in all text files within a directory recursively
 */
export function replaceTokens(dir: string, tokens: TokenReplacements): void {
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`);
  }

  const walk = (currentPath: string): void => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        try {
          // Try to read as text file
          const content = fs.readFileSync(fullPath, "utf8");

          // Replace tokens
          const updatedContent = content
            .replace(/__APP_NAME__/g, tokens.APP_NAME)
            .replace(/__PKG_NAME__/g, tokens.PKG_NAME);

          // Only write if content changed
          if (updatedContent !== content) {
            fs.writeFileSync(fullPath, updatedContent, "utf8");
          }
        } catch (error) {
          // Skip binary files or files that can't be read as text
          // This is expected behavior for images, executables, etc.
        }
      }
    }
  };

  walk(dir);
}

/**
 * Sanitize a project name to create a valid package name
 */
export function sanitizePackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/**
 * Check if a directory exists and is not empty
 */
export function isDirectoryEmpty(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) {
    return true;
  }

  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    return false;
  }

  const files = fs.readdirSync(dirPath);
  return files.length === 0;
}
