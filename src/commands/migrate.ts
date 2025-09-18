import { Command } from "commander";
import { MigrationService } from "../services/migration.js";
import { log } from "../utils/logger.js";

export const migrateCommand = new Command("migrate")
  .description(
    "Migrate project to newer template version or different template"
  )
  .option("-t, --template <template>", "Target template to migrate to")
  .option("-v, --version <version>", "Target template version")
  .option("--dry-run", "Show what would be changed without applying")
  .option("--interactive", "Interactive migration with conflict resolution")
  .option("--backup", "Create backup before migration", true)
  .option("--force", "Force migration even with conflicts")
  .action(async (options) => {
    try {
      const migrationService = new MigrationService();

      if (options.dryRun) {
        await migrationService.previewMigration({
          targetTemplate: options.template,
          targetVersion: options.version,
        });
      } else {
        await migrationService.migrate({
          targetTemplate: options.template,
          targetVersion: options.version,
          interactive: options.interactive,
          createBackup: options.backup,
          force: options.force,
        });
      }
    } catch (error) {
      log.error(
        `Migration failed: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });
