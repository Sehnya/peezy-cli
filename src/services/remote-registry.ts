import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { log } from "../utils/logger.js";
import type {
  RemoteRegistry,
  RegistryCache,
  CachedTemplate,
  RemoteTemplate,
} from "../types.js";

export class RemoteRegistryService {
  private readonly cacheDir: string;
  private readonly registryUrl: string;
  private readonly cacheTtl: number = 1000 * 60 * 60; // 1 hour

  constructor(registryUrl?: string) {
    this.cacheDir = path.join(os.homedir(), ".peezy", "registry");
    this.registryUrl =
      registryUrl ||
      "https://raw.githubusercontent.com/Sehnya/peezy-registry/main/registry.json";
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private get cacheFile(): string {
    return path.join(this.cacheDir, "cache.json");
  }

  private loadCache(): RegistryCache {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const content = fs.readFileSync(this.cacheFile, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      log.warn(
        `Failed to load registry cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      lastFetch: 0,
      templates: {},
    };
  }

  private saveCache(cache: RegistryCache): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
      log.warn(
        `Failed to save registry cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async fetchRegistry(): Promise<RemoteRegistry> {
    try {
      const response = await fetch(this.registryUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to fetch registry: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getRegistry(forceRefresh = false): Promise<RemoteRegistry> {
    const cache = this.loadCache();
    const now = Date.now();

    // Return cached registry if valid and not forcing refresh
    if (
      !forceRefresh &&
      cache.registry &&
      now - cache.lastFetch < this.cacheTtl
    ) {
      return cache.registry;
    }

    try {
      log.info("Fetching remote registry...");
      const registry = await this.fetchRegistry();

      // Update cache
      cache.registry = registry;
      cache.lastFetch = now;
      this.saveCache(cache);

      return registry;
    } catch (error) {
      // Fall back to cached registry if available
      if (cache.registry) {
        log.warn(
          `Failed to fetch registry, using cached version: ${error instanceof Error ? error.message : String(error)}`
        );
        return cache.registry;
      }
      throw error;
    }
  }

  private async downloadFile(url: string, destPath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const fileStream = createWriteStream(destPath);
    await pipeline(response.body as any, fileStream);
  }

  private async extractTarball(
    tarballPath: string,
    destDir: string
  ): Promise<void> {
    const { execSync } = await import("node:child_process");

    try {
      // Ensure destination directory exists
      fs.mkdirSync(destDir, { recursive: true });

      // Check if tar command is available
      try {
        execSync("which tar", { stdio: "pipe" });
      } catch {
        throw new Error(
          "tar command not found. Please install tar or use a different extraction method."
        );
      }

      // Extract tarball with error handling
      execSync(
        `tar -xzf "${tarballPath}" -C "${destDir}" --strip-components=1`,
        {
          stdio: "pipe",
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to extract tarball: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private verifyIntegrity(
    filePath: string,
    expectedIntegrity: string
  ): boolean {
    try {
      const [algorithm, expectedHash] = expectedIntegrity.split("-");
      const fileContent = fs.readFileSync(filePath);
      const actualHash = createHash(algorithm)
        .update(fileContent)
        .digest("base64");
      return actualHash === expectedHash;
    } catch (error) {
      log.warn(
        `Failed to verify integrity: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  async downloadTemplate(
    templateName: string,
    version?: string
  ): Promise<string> {
    const registry = await this.getRegistry();
    const template = registry.templates.find((t) => t.name === templateName);

    if (!template) {
      throw new Error(`Template "${templateName}" not found in registry`);
    }

    const targetVersion = version || template.latest;
    const versionInfo = template.versions[targetVersion];

    if (!versionInfo) {
      throw new Error(
        `Version "${targetVersion}" not found for template "${templateName}"`
      );
    }

    const cache = this.loadCache();
    const cacheKey = `${templateName}@${targetVersion}`;
    const cachedTemplate = cache.templates[cacheKey];

    // Check if already cached and valid
    if (cachedTemplate && fs.existsSync(cachedTemplate.path)) {
      log.info(`Using cached template: ${cacheKey}`);
      return cachedTemplate.path;
    }

    // Download and cache template
    const templateDir = path.join(
      this.cacheDir,
      "templates",
      templateName,
      targetVersion
    );

    if (versionInfo.tarball) {
      log.info(`Downloading template ${cacheKey}...`);

      const tarballPath = path.join(
        this.cacheDir,
        `${templateName}-${targetVersion}.tgz`
      );

      try {
        await this.downloadFile(versionInfo.tarball, tarballPath);

        // Verify integrity
        if (!this.verifyIntegrity(tarballPath, versionInfo.integrity)) {
          throw new Error("Integrity check failed");
        }

        // Extract tarball
        await this.extractTarball(tarballPath, templateDir);

        // Clean up tarball
        fs.unlinkSync(tarballPath);

        // Update cache
        cache.templates[cacheKey] = {
          name: templateName,
          version: targetVersion,
          path: templateDir,
          cachedAt: Date.now(),
          integrity: versionInfo.integrity,
        };
        this.saveCache(cache);

        log.ok(`Template ${cacheKey} cached successfully`);
        return templateDir;
      } catch (error) {
        // Clean up on failure
        if (fs.existsSync(tarballPath)) {
          fs.unlinkSync(tarballPath);
        }
        if (fs.existsSync(templateDir)) {
          fs.rmSync(templateDir, { recursive: true, force: true });
        }
        throw error;
      }
    } else if (versionInfo.npm) {
      // Handle npm packages (future enhancement)
      throw new Error("NPM package templates not yet supported");
    } else {
      throw new Error("No download source available for template");
    }
  }

  async listTemplates(): Promise<RemoteTemplate[]> {
    const registry = await this.getRegistry();
    return registry.templates;
  }

  async clearCache(): Promise<void> {
    try {
      if (fs.existsSync(this.cacheDir)) {
        fs.rmSync(this.cacheDir, { recursive: true, force: true });
      }
      this.ensureCacheDir();
      log.ok("Registry cache cleared");
    } catch (error) {
      throw new Error(
        `Failed to clear cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  getCacheInfo(): { size: number; templates: number; lastFetch: Date | null } {
    const cache = this.loadCache();
    let size = 0;

    try {
      if (fs.existsSync(this.cacheDir)) {
        const calculateSize = (dir: string): number => {
          let totalSize = 0;
          const items = fs.readdirSync(dir);

          for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
              totalSize += calculateSize(itemPath);
            } else {
              totalSize += stat.size;
            }
          }

          return totalSize;
        };

        size = calculateSize(this.cacheDir);
      }
    } catch (error) {
      // Ignore errors when calculating size
    }

    return {
      size,
      templates: Object.keys(cache.templates).length,
      lastFetch: cache.lastFetch > 0 ? new Date(cache.lastFetch) : null,
    };
  }
}
