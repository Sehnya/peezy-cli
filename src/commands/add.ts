import { parseTemplateName, getRemoteRegistry } from "../registry.js";
import { log } from "../utils/logger.js";

export interface AddOptions {
  force?: boolean;
  version?: string;
}

/**
 * Add a remote template to the cache
 */
export async function addTemplate(
  templateName: string,
  options: AddOptions = {}
): Promise<void> {
  try {
    const parsed = parseTemplateName(templateName);
    const targetVersion = options.version || parsed.version;

    if (!parsed.scope && !targetVersion) {
      throw new Error(
        "Template name must include scope (@org/template) or version (template@1.0.0) for remote templates"
      );
    }

    const registry = getRemoteRegistry();

    log.info(
      `Adding template ${parsed.fullName}${targetVersion ? `@${targetVersion}` : ""}...`
    );

    const templatePath = await registry.downloadTemplate(
      parsed.fullName,
      targetVersion
    );

    log.ok(
      `Template added successfully: ${parsed.fullName}${targetVersion ? `@${targetVersion}` : ""}`
    );
    log.info(`Cached at: ${templatePath}`);
  } catch (error) {
    throw new Error(
      `Failed to add template: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * List cached templates
 */
export async function listCachedTemplates(): Promise<void> {
  try {
    const registry = getRemoteRegistry();
    const cacheInfo = registry.getCacheInfo();

    console.log();
    log.info("Registry Cache Information:");
    console.log(`  Templates cached: ${cacheInfo.templates}`);
    console.log(
      `  Cache size: ${(cacheInfo.size / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
      `  Last updated: ${cacheInfo.lastFetch ? cacheInfo.lastFetch.toLocaleString() : "Never"}`
    );
    console.log();
  } catch (error) {
    throw new Error(
      `Failed to list cached templates: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Clear template cache
 */
export async function clearCache(): Promise<void> {
  try {
    const registry = getRemoteRegistry();
    await registry.clearCache();
  } catch (error) {
    throw new Error(
      `Failed to clear cache: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
