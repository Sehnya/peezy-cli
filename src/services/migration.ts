import path from "node:path";
import fs from "node:fs/promises";
import { execSync } from "node:child_process";
import prompts from "prompts";
import { log } from "../utils/logger.js";
import { PeezyLockService } from "./peezy-lock.js";
import { resolveTemplate } from "../registry.js";
import { TemplateDiffer } from "./template-differ.js";
import type { PeezyLockFile } from "../types.js";

export interface MigrationOptions {
  targetTemplate?: string;
  targetVersion?: string;
  interactive?: boolean;
  createBackup?: boolean;
  force?: boolean;
}

export interface MigrationPreview {
  changes: FileChange[];
  conflicts: FileConflict[];
  summary: MigrationSummary;
}

export interface FileChange {
  type: "add" | "modify" | "delete" | "rename";
  path: string;
  newPath?: string;
  preview?: string;
}

export interface FileConflict {
  path: string;
  type: "content" | "structure";
  description: string;
  resolution?: "keep" | "replace" | "merge";
}

export interface MigrationSummary {
  filesAdded: number;
  filesModified: number;
  filesDeleted: number;
  conflicts: number;
  templateChange: {
    from: string;
    to: string;
    versionFrom?: string;
    versionTo?: string;
  };
}

export class MigrationService {
  private lockService = new PeezyLockService();
  private differ = new TemplateDiffer();

  async previewMigration(options: MigrationOptions): Promise<MigrationPreview> {
    const lockFile = await this.lockService.readLockFile();
    if (!lockFile) {
      throw new Error(
        "No peezy.lock.json found. This doesn't appear to be a Peezy project."
      );
    }

    const targetTemplate = options.targetTemplate || lockFile.template.name;
    const targetVersion = options.targetVersion || "latest";

    log.info(
      `🔍 Analyzing migration from ${lockFile.template.name} to ${targetTemplate}@${targetVersion}`
    );

    // Resolve target template
    const { path: templatePath } = await resolveTemplate(
      targetVersion === "latest"
        ? targetTemplate
        : `${targetTemplate}@${targetVersion}`
    );

    // Generate diff
    const diff = await this.differ.generateDiff(process.cwd(), templatePath, {
      excludePatterns: [
        "node_modules/**",
        ".git/**",
        "dist/**",
        "build/**",
        "peezy.lock.json",
        ".env*",
      ],
    });

    const preview: MigrationPreview = {
      changes: diff.changes,
      conflicts: diff.conflicts,
      summary: {
        filesAdded: diff.changes.filter((c) => c.type === "add").length,
        filesModified: diff.changes.filter((c) => c.type === "modify").length,
        filesDeleted: diff.changes.filter((c) => c.type === "delete").length,
        conflicts: diff.conflicts.length,
        templateChange: {
          from: lockFile.template.name,
          to: targetTemplate,
          versionFrom: lockFile.template.version,
          versionTo: targetVersion,
        },
      },
    };

    this.displayPreview(preview);
    return preview;
  }

  async migrate(options: MigrationOptions): Promise<void> {
    const preview = await this.previewMigration(options);

    if (
      preview.conflicts.length > 0 &&
      !options.force &&
      !options.interactive
    ) {
      throw new Error(
        `Migration has ${preview.conflicts.length} conflicts. Use --interactive to resolve them or --force to override.`
      );
    }

    // Create backup if requested
    if (options.createBackup) {
      await this.createBackup();
    }

    // Handle conflicts interactively
    if (options.interactive && preview.conflicts.length > 0) {
      await this.resolveConflictsInteractively(preview.conflicts);
    }

    // Apply changes
    await this.applyChanges(preview.changes, options.force);

    // Update lock file
    await this.updateLockFile(preview.summary.templateChange);

    log.success(`✅ Migration completed successfully!`);
    log.info(
      `📊 Summary: ${preview.summary.filesAdded} added, ${preview.summary.filesModified} modified, ${preview.summary.filesDeleted} deleted`
    );
  }

  private displayPreview(preview: MigrationPreview): void {
    const { summary } = preview;

    log.info(`\n📋 Migration Preview:`);
    log.info(
      `   Template: ${summary.templateChange.from} → ${summary.templateChange.to}`
    );
    if (
      summary.templateChange.versionFrom &&
      summary.templateChange.versionTo
    ) {
      log.info(
        `   Version: ${summary.templateChange.versionFrom} → ${summary.templateChange.versionTo}`
      );
    }
    log.info(
      `   Files: +${summary.filesAdded} ~${summary.filesModified} -${summary.filesDeleted}`
    );

    if (summary.conflicts > 0) {
      log.warn(`   ⚠️  ${summary.conflicts} conflicts detected`);
    }

    if (preview.changes.length > 0) {
      log.info(`\n📝 Changes:`);
      preview.changes.slice(0, 10).forEach((change) => {
        const icon =
          change.type === "add" ? "+" : change.type === "delete" ? "-" : "~";
        log.info(`   ${icon} ${change.path}`);
      });

      if (preview.changes.length > 10) {
        log.info(`   ... and ${preview.changes.length - 10} more changes`);
      }
    }

    if (preview.conflicts.length > 0) {
      log.info(`\n⚠️  Conflicts:`);
      preview.conflicts.forEach((conflict) => {
        log.warn(`   ${conflict.path}: ${conflict.description}`);
      });
    }
  }

  private async createBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `backup-${timestamp}`;

    log.info(`📦 Creating backup in ${backupDir}/`);

    // Create backup using git if available, otherwise copy files
    try {
      execSync("git --version", { stdio: "ignore" });
      execSync(`git archive --format=tar HEAD | tar -x -C ../${backupDir}`, {
        stdio: "ignore",
      });
      log.info(`✅ Backup created using git archive`);
    } catch {
      // Fallback to file copy
      await fs.cp(process.cwd(), `../${backupDir}`, {
        recursive: true,
        filter: (src) => !src.includes("node_modules") && !src.includes(".git"),
      });
      log.info(`✅ Backup created by copying files`);
    }
  }

  private async resolveConflictsInteractively(
    conflicts: FileConflict[]
  ): Promise<void> {
    log.info(`\n🔧 Resolving ${conflicts.length} conflicts interactively...`);

    for (const conflict of conflicts) {
      const response = await prompts({
        type: "select",
        name: "resolution",
        message: `Conflict in ${conflict.path}: ${conflict.description}`,
        choices: [
          { title: "Keep current version", value: "keep" },
          { title: "Replace with template version", value: "replace" },
          { title: "Attempt to merge", value: "merge" },
          { title: "Skip this file", value: "skip" },
        ],
      });

      conflict.resolution = response.resolution;
    }
  }

  private async applyChanges(
    changes: FileChange[],
    force: boolean
  ): Promise<void> {
    log.info(`\n🔄 Applying ${changes.length} changes...`);

    for (const change of changes) {
      try {
        switch (change.type) {
          case "add":
            await this.addFile(change.path, change.preview || "");
            break;
          case "modify":
            await this.modifyFile(change.path, change.preview || "");
            break;
          case "delete":
            if (force) {
              await this.deleteFile(change.path);
            }
            break;
          case "rename":
            if (change.newPath) {
              await this.renameFile(change.path, change.newPath);
            }
            break;
        }
      } catch (error) {
        log.warn(`Failed to apply change to ${change.path}: ${error}`);
      }
    }
  }

  private async addFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }

  private async modifyFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    await fs.writeFile(fullPath, content);
  }

  private async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    await fs.unlink(fullPath);
  }

  private async renameFile(oldPath: string, newPath: string): Promise<void> {
    const fullOldPath = path.join(process.cwd(), oldPath);
    const fullNewPath = path.join(process.cwd(), newPath);
    await fs.mkdir(path.dirname(fullNewPath), { recursive: true });
    await fs.rename(fullOldPath, fullNewPath);
  }

  private async updateLockFile(
    templateChange: MigrationSummary["templateChange"]
  ): Promise<void> {
    const lockFile = await this.lockService.readLockFile();
    if (!lockFile) return;

    lockFile.template.name = templateChange.to;
    if (templateChange.versionTo) {
      lockFile.template.version = templateChange.versionTo;
    }

    await this.lockService.writeLockFile(lockFile);
  }
}
