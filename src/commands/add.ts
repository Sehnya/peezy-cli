import { parseTemplateName, getRemoteRegistry } from "../registry.js";
import { log } from "../utils/logger.js";

export interface AddOptions {
  force?: boolean;
  version?: string;
}

/**
 * Parse template source
 * Supports:
 * - github:owner/repo
 * - github:owner/repo#branch
 * - github:owner/repo/path
 * - npm:package-name
 * - npm:package-name@version
 * - @scope/template (registry)
 * - @scope/template@version (registry)
 */
function parseSource(input: string): {
  type: "github" | "npm" | "registry";
  spec: string;
  version?: string;
} {
  if (input.startsWith("github:")) {
    return { type: "github", spec: input };
  }

  if (input.startsWith("npm:")) {
    const npmSpec = input.slice(4);
    const atIndex = npmSpec.lastIndexOf("@");
    if (atIndex > 0) {
      return {
        type: "npm",
        spec: npmSpec.slice(0, atIndex),
        version: npmSpec.slice(atIndex + 1),
      };
    }
    return { type: "npm", spec: npmSpec };
  }

  // Registry template (@scope/name or @scope/name@version)
  const parsed = parseTemplateName(input);
  return {
    type: "registry",
    spec: parsed.fullName,
    version: parsed.version,
  };
}

/**
 * Add a remote template to the cache
 */
export async function addTemplate(
  templateName: string,
  options: AddOptions = {}
): Promise<string> {
  const source = parseSource(templateName);
  const registry = getRemoteRegistry();

  try {
    let templatePath: string;

    switch (source.type) {
      case "github":
        templatePath = await registry.downloadFromGitHub(source.spec);
        break;

      case "npm":
        templatePath = await registry.downloadFromNpm(
          source.spec,
          options.version || source.version
        );
        break;

      case "registry":
        if (!source.spec.startsWith("@")) {
          throw new Error(
            "Registry templates must be scoped (@scope/name). " +
              "Use github:owner/repo or npm:package for other sources."
          );
        }
        templatePath = await registry.downloadTemplate(
          source.spec,
          options.version || source.version
        );
        break;
    }

    return templatePath;
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
  const registry = getRemoteRegistry();
  const cached = registry.listCachedTemplates();
  const cacheInfo = registry.getCacheInfo();

  console.log();
  log.info("Cached Templates:");

  if (cached.length === 0) {
    console.log("  No templates cached");
  } else {
    for (const t of cached) {
      console.log(`  ${t.name}@${t.version}`);
      console.log(`    Path: ${t.path}`);
      console.log(`    Cached: ${t.cachedAt.toLocaleString()}`);
    }
  }

  console.log();
  console.log(`Total: ${cacheInfo.templates} templates, ${(cacheInfo.size / 1024 / 1024).toFixed(2)} MB`);
}

/**
 * Clear template cache
 */
export async function clearCache(): Promise<void> {
  const registry = getRemoteRegistry();
  await registry.clearCache();
}

/**
 * Get cache information for JSON output
 */
export function getCacheInfo(): {
  size: number;
  templates: number;
  lastFetch: Date | null;
  cached: Array<{ name: string; version: string; path: string; cachedAt: Date }>;
} {
  const registry = getRemoteRegistry();
  const info = registry.getCacheInfo();
  const cached = registry.listCachedTemplates();
  return { ...info, cached };
}

/**
 * Search remote templates
 */
export async function searchTemplates(query: string): Promise<void> {
  const registry = getRemoteRegistry();
  const results = await registry.searchTemplates(query);

  console.log();
  if (results.length === 0) {
    log.warn(`No templates found matching "${query}"`);
  } else {
    log.info(`Found ${results.length} template(s):`);
    for (const t of results) {
      const tags = t.versions[t.latest]?.tags?.join(", ") || "";
      console.log(`  ${t.name}@${t.latest}`);
      if (tags) console.log(`    Tags: ${tags}`);
    }
  }
}
