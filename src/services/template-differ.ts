import path from "node:path";
import fs from "node:fs/promises";
import { glob } from "glob";
import type { FileChange, FileConflict } from "./migration.js";

export interface DiffOptions {
  excludePatterns?: string[];
  includePatterns?: string[];
}

export interface DiffResult {
  changes: FileChange[];
  conflicts: FileConflict[];
}

export class TemplateDiffer {
  async generateDiff(
    projectPath: string,
    templatePath: string,
    options: DiffOptions = {}
  ): Promise<DiffResult> {
    const excludePatterns = options.excludePatterns || [];
    const includePatterns = options.includePatterns || ["**/*"];

    // Get all files from both directories
    const projectFiles = await this.getFiles(
      projectPath,
      includePatterns,
      excludePatterns
    );
    const templateFiles = await this.getFiles(
      templatePath,
      includePatterns,
      excludePatterns
    );

    const changes: FileChange[] = [];
    const conflicts: FileConflict[] = [];

    // Find files to add or modify
    for (const templateFile of templateFiles) {
      const projectFilePath = path.join(projectPath, templateFile);
      const templateFilePath = path.join(templatePath, templateFile);

      try {
        const projectExists = await this.fileExists(projectFilePath);

        if (!projectExists) {
          // File doesn't exist in project - add it
          const content = await fs.readFile(templateFilePath, "utf-8");
          changes.push({
            type: "add",
            path: templateFile,
            preview: content,
          });
        } else {
          // File exists - check if it needs modification
          const projectContent = await fs.readFile(projectFilePath, "utf-8");
          const templateContent = await fs.readFile(templateFilePath, "utf-8");

          if (projectContent !== templateContent) {
            // Check if this is a user-customizable file
            if (this.isUserCustomizableFile(templateFile)) {
              conflicts.push({
                path: templateFile,
                type: "content",
                description: "File has been modified and template has updates",
              });
            } else {
              changes.push({
                type: "modify",
                path: templateFile,
                preview: templateContent,
              });
            }
          }
        }
      } catch (error) {
        // Handle binary files or permission issues
        conflicts.push({
          path: templateFile,
          type: "structure",
          description: `Unable to process file: ${error}`,
        });
      }
    }

    // Find files to delete (exist in project but not in template)
    for (const projectFile of projectFiles) {
      if (!templateFiles.includes(projectFile)) {
        // Only suggest deletion for template-managed files
        if (this.isTemplateManagedFile(projectFile)) {
          changes.push({
            type: "delete",
            path: projectFile,
          });
        }
      }
    }

    return { changes, conflicts };
  }

  private async getFiles(
    dirPath: string,
    includePatterns: string[],
    excludePatterns: string[]
  ): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of includePatterns) {
      const matches = await glob(pattern, {
        cwd: dirPath,
        ignore: excludePatterns,
        nodir: true,
        dot: true,
      });
      files.push(...matches);
    }

    // Remove duplicates and sort
    return [...new Set(files)].sort();
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private isUserCustomizableFile(filePath: string): boolean {
    const userCustomizablePatterns = [
      "src/**/*",
      "pages/**/*",
      "components/**/*",
      "lib/**/*",
      "utils/**/*",
      "styles/**/*",
      "public/**/*",
      "README.md",
      ".env*",
      "package.json", // Partially customizable
    ];

    return userCustomizablePatterns.some((pattern) =>
      this.matchesPattern(filePath, pattern)
    );
  }

  private isTemplateManagedFile(filePath: string): boolean {
    const templateManagedPatterns = [
      "tsconfig.json",
      "tailwind.config.js",
      "next.config.js",
      "vite.config.ts",
      "jest.config.js",
      "eslint.config.js",
      ".gitignore",
      "postcss.config.js",
    ];

    return templateManagedPatterns.some((pattern) =>
      this.matchesPattern(filePath, pattern)
    );
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple pattern matching - could be enhanced with minimatch
    if (pattern.includes("**/*")) {
      const prefix = pattern.replace("**/*", "");
      return filePath.startsWith(prefix);
    }
    return filePath === pattern || filePath.endsWith(pattern);
  }
}
