import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { execSync } from "node:child_process";
import { log } from "../utils/logger.js";
import type {
  RemoteRegistry,
  RegistryCache,
  RemoteTemplate,
} from "../types.js";

const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/Sehnya/peezy-registry/main/registry.json";

export class RemoteRegistryService {
  private readonly cacheDir: string;
  private readonly registryUrl: string;
  private readonly cacheTtl: number = 1000 * 60 * 60; // 1 hour

  constructor(registryUrl?: string) {
    this.cacheDir = path.join(os.homedir(), ".peezy", "registry");
    this.registryUrl = registryUrl || DEFAULT_REGISTRY_URL;
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
        return JSON.parse(fs.readFileSync(this.cacheFile, "utf-8"));
      }
    } catch {
      // Ignore cache errors
    }
    return { lastFetch: 0, templates: {} };
  }

  private saveCache(cache: RegistryCache): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch {
      // Ignore cache save errors
    }
  }

  private async fetchRegistry(): Promise<RemoteRegistry> {
    const response = await fetch(this.registryUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  async getRegistry(forceRefresh = false): Promise<RemoteRegistry> {
    const cache = this.loadCache();
    const now = Date.now();

    if (!forceRefresh && cache.registry && now - cache.lastFetch < this.cacheTtl) {
      return cache.registry;
    }

    try {
      log.info("Fetching remote registry...");
      const registry = await this.fetchRegistry();
      cache.registry = registry;
      cache.lastFetch = now;
      this.saveCache(cache);
      return registry;
    } catch (error) {
      if (cache.registry) {
        log.warn("Using cached registry (fetch failed)");
        return cache.registry;
      }
      // Return empty registry if no cache and fetch fails
      return { $schema: "", version: 1, templates: [], plugins: [] };
    }
  }


  /**
   * Download template from GitHub repo directly
   * Supports: github:owner/repo, github:owner/repo#branch, github:owner/repo/path
   */
  async downloadFromGitHub(spec: string): Promise<string> {
    const match = spec.match(/^github:([^/#]+)\/([^/#]+)(?:\/([^#]+))?(?:#(.+))?$/);
    if (!match) {
      throw new Error("Invalid GitHub spec. Use: github:owner/repo or github:owner/repo#branch");
    }

    const [, owner, repo, subpath, ref] = match;
    const branch = ref || "main";
    const cacheKey = `github-${owner}-${repo}-${branch}${subpath ? `-${subpath.replace(/\//g, "-")}` : ""}`;
    const templateDir = path.join(this.cacheDir, "templates", cacheKey);

    // Check cache
    const cache = this.loadCache();
    const cached = cache.templates[cacheKey];
    if (cached && fs.existsSync(cached.path)) {
      const cacheAge = Date.now() - cached.cachedAt;
      if (cacheAge < this.cacheTtl) {
        log.info(`Using cached: ${cacheKey}`);
        return cached.path;
      }
    }

    log.info(`Downloading from GitHub: ${owner}/${repo}${ref ? `#${ref}` : ""}...`);

    // Download as tarball
    const tarballUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.tar.gz`;
    const tarballPath = path.join(this.cacheDir, `${cacheKey}.tar.gz`);

    try {
      await this.downloadFile(tarballUrl, tarballPath);

      // Extract
      if (fs.existsSync(templateDir)) {
        fs.rmSync(templateDir, { recursive: true, force: true });
      }
      fs.mkdirSync(templateDir, { recursive: true });

      execSync(`tar -xzf "${tarballPath}" -C "${templateDir}" --strip-components=1`, { stdio: "pipe" });

      // If subpath specified, move that directory
      if (subpath) {
        const subDir = path.join(templateDir, subpath);
        if (!fs.existsSync(subDir)) {
          throw new Error(`Path "${subpath}" not found in repository`);
        }
        const tempDir = path.join(this.cacheDir, `temp-${Date.now()}`);
        fs.renameSync(subDir, tempDir);
        fs.rmSync(templateDir, { recursive: true, force: true });
        fs.renameSync(tempDir, templateDir);
      }

      // Clean up tarball
      fs.unlinkSync(tarballPath);

      // Update cache
      cache.templates[cacheKey] = {
        name: cacheKey,
        version: branch,
        path: templateDir,
        cachedAt: Date.now(),
        integrity: "",
      };
      this.saveCache(cache);

      log.ok(`Downloaded: ${cacheKey}`);
      return templateDir;
    } catch (error) {
      if (fs.existsSync(tarballPath)) fs.unlinkSync(tarballPath);
      if (fs.existsSync(templateDir)) fs.rmSync(templateDir, { recursive: true, force: true });
      throw new Error(`GitHub download failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Download template from npm package
   */
  async downloadFromNpm(packageName: string, version?: string): Promise<string> {
    const spec = version ? `${packageName}@${version}` : packageName;
    const cacheKey = spec.replace(/[@/]/g, "-");
    const templateDir = path.join(this.cacheDir, "templates", cacheKey);

    // Check cache
    const cache = this.loadCache();
    const cached = cache.templates[cacheKey];
    if (cached && fs.existsSync(cached.path)) {
      log.info(`Using cached: ${spec}`);
      return cached.path;
    }

    log.info(`Downloading from npm: ${spec}...`);

    try {
      // Get package info from npm
      const infoRes = await fetch(`https://registry.npmjs.org/${packageName}`);
      if (!infoRes.ok) throw new Error(`Package not found: ${packageName}`);
      const info = await infoRes.json();

      const targetVersion = version || info["dist-tags"]?.latest;
      if (!targetVersion || !info.versions?.[targetVersion]) {
        throw new Error(`Version not found: ${targetVersion}`);
      }

      const tarballUrl = info.versions[targetVersion].dist?.tarball;
      if (!tarballUrl) throw new Error("No tarball URL found");

      const tarballPath = path.join(this.cacheDir, `${cacheKey}.tgz`);
      await this.downloadFile(tarballUrl, tarballPath);

      // Extract (npm tarballs have a "package" directory)
      if (fs.existsSync(templateDir)) {
        fs.rmSync(templateDir, { recursive: true, force: true });
      }
      fs.mkdirSync(templateDir, { recursive: true });

      execSync(`tar -xzf "${tarballPath}" -C "${templateDir}" --strip-components=1`, { stdio: "pipe" });
      fs.unlinkSync(tarballPath);

      // Update cache
      cache.templates[cacheKey] = {
        name: packageName,
        version: targetVersion,
        path: templateDir,
        cachedAt: Date.now(),
        integrity: info.versions[targetVersion].dist?.integrity || "",
      };
      this.saveCache(cache);

      log.ok(`Downloaded: ${spec}`);
      return templateDir;
    } catch (error) {
      throw new Error(`npm download failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async downloadFile(url: string, destPath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    if (!response.body) throw new Error("No response body");
    const fileStream = createWriteStream(destPath);
    await pipeline(response.body as any, fileStream);
  }

  private verifyIntegrity(filePath: string, expectedIntegrity: string): boolean {
    if (!expectedIntegrity) return true;
    try {
      const [algorithm, expectedHash] = expectedIntegrity.split("-");
      const fileContent = fs.readFileSync(filePath);
      const actualHash = createHash(algorithm).update(fileContent).digest("base64");
      return actualHash === expectedHash;
    } catch {
      return false;
    }
  }


  /**
   * Download template from registry
   */
  async downloadTemplate(templateName: string, version?: string): Promise<string> {
    const registry = await this.getRegistry();
    const template = registry.templates.find((t) => t.name === templateName);

    if (!template) {
      throw new Error(`Template "${templateName}" not found in registry`);
    }

    const targetVersion = version || template.latest;
    const versionInfo = template.versions[targetVersion];

    if (!versionInfo) {
      throw new Error(`Version "${targetVersion}" not found for "${templateName}"`);
    }

    const cacheKey = `${templateName}@${targetVersion}`;
    const cache = this.loadCache();
    const cached = cache.templates[cacheKey];

    if (cached && fs.existsSync(cached.path)) {
      log.info(`Using cached: ${cacheKey}`);
      return cached.path;
    }

    const templateDir = path.join(this.cacheDir, "templates", templateName.replace(/[@/]/g, "-"), targetVersion);

    if (versionInfo.tarball) {
      log.info(`Downloading: ${cacheKey}...`);
      const tarballPath = path.join(this.cacheDir, `${cacheKey.replace(/[@/]/g, "-")}.tgz`);

      try {
        await this.downloadFile(versionInfo.tarball, tarballPath);

        if (versionInfo.integrity && !this.verifyIntegrity(tarballPath, versionInfo.integrity)) {
          throw new Error("Integrity check failed");
        }

        if (fs.existsSync(templateDir)) {
          fs.rmSync(templateDir, { recursive: true, force: true });
        }
        fs.mkdirSync(templateDir, { recursive: true });

        execSync(`tar -xzf "${tarballPath}" -C "${templateDir}" --strip-components=1`, { stdio: "pipe" });
        fs.unlinkSync(tarballPath);

        cache.templates[cacheKey] = {
          name: templateName,
          version: targetVersion,
          path: templateDir,
          cachedAt: Date.now(),
          integrity: versionInfo.integrity,
        };
        this.saveCache(cache);

        log.ok(`Downloaded: ${cacheKey}`);
        return templateDir;
      } catch (error) {
        if (fs.existsSync(tarballPath)) fs.unlinkSync(tarballPath);
        if (fs.existsSync(templateDir)) fs.rmSync(templateDir, { recursive: true, force: true });
        throw error;
      }
    } else if (versionInfo.npm) {
      return this.downloadFromNpm(versionInfo.npm, targetVersion);
    }

    throw new Error("No download source available");
  }

  async listTemplates(): Promise<RemoteTemplate[]> {
    const registry = await this.getRegistry();
    return registry.templates;
  }

  async searchTemplates(query: string): Promise<RemoteTemplate[]> {
    const registry = await this.getRegistry();
    const q = query.toLowerCase();
    return registry.templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.versions[t.latest]?.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  async clearCache(): Promise<void> {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true, force: true });
    }
    this.ensureCacheDir();
    log.ok("Cache cleared");
  }

  getCacheInfo(): { size: number; templates: number; lastFetch: Date | null } {
    const cache = this.loadCache();
    let size = 0;

    try {
      if (fs.existsSync(this.cacheDir)) {
        const calculateSize = (dir: string): number => {
          let total = 0;
          for (const item of fs.readdirSync(dir)) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            total += stat.isDirectory() ? calculateSize(itemPath) : stat.size;
          }
          return total;
        };
        size = calculateSize(this.cacheDir);
      }
    } catch {
      // Ignore size calculation errors
    }

    return {
      size,
      templates: Object.keys(cache.templates).length,
      lastFetch: cache.lastFetch > 0 ? new Date(cache.lastFetch) : null,
    };
  }

  listCachedTemplates(): Array<{ name: string; version: string; path: string; cachedAt: Date }> {
    const cache = this.loadCache();
    return Object.values(cache.templates)
      .filter((t) => fs.existsSync(t.path))
      .map((t) => ({
        name: t.name,
        version: t.version,
        path: t.path,
        cachedAt: new Date(t.cachedAt),
      }));
  }
}
