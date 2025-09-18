/**
 * Plugin Manager v1.0
 *
 * Manages plugin lifecycle, loading, and execution
 */

import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import semver from "semver";
import type {
  Plugin,
  PluginConfig,
  PluginRegistryEntry,
  PluginManifest,
  ScaffoldContext,
  InstallContext,
  ProjectConfig,
  ValidationResult,
} from "./types.js";
import { PluginError, PluginVersionError, PluginLoadError } from "./types.js";
import { log } from "../../utils/logger.js";

/**
 * Plugin Manager - handles plugin discovery, loading, and execution
 */
export class PluginManager {
  private plugins = new Map<string, PluginRegistryEntry>();
  private config: PluginConfig;
  private cliVersion: string;

  constructor(config: PluginConfig, cliVersion: string) {
    this.config = config;
    this.cliVersion = cliVersion;
  }

  /**
   * Load all configured plugins
   */
  async loadPlugins(): Promise<void> {
    const startTime = Date.now();
    let loadedCount = 0;
    let errorCount = 0;

    for (const [pluginName, pluginConfig] of Object.entries(
      this.config.plugins
    )) {
      if (!pluginConfig.enabled) {
        continue;
      }

      try {
        await this.loadPlugin(pluginName, pluginConfig.config);
        loadedCount++;
      } catch (error) {
        errorCount++;
        log.warn(
          `Failed to load plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    const loadTime = Date.now() - startTime;
    log.debug(
      `Loaded ${loadedCount} plugins in ${loadTime}ms (${errorCount} errors)`
    );
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(
    pluginName: string,
    config?: Record<string, any>
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Find plugin module
      const pluginPath = await this.findPlugin(pluginName);
      if (!pluginPath) {
        throw new PluginLoadError(
          pluginName,
          new Error(`Plugin not found: ${pluginName}`)
        );
      }

      // Load plugin module
      const pluginModule = await import(pathToFileURL(pluginPath).href);
      const PluginClass = pluginModule.default;

      if (!PluginClass) {
        throw new PluginLoadError(
          pluginName,
          new Error("Plugin must export a default class")
        );
      }

      // Create plugin instance
      const plugin: Plugin = new PluginClass();

      // Validate plugin manifest
      this.validatePlugin(plugin);

      // Check version compatibility
      this.checkVersionCompatibility(plugin.manifest);

      // Initialize plugin
      if (plugin.initialize) {
        await plugin.initialize();
      }

      // Register plugin
      const entry: PluginRegistryEntry = {
        manifest: plugin.manifest,
        instance: plugin,
        enabled: true,
        loadTime: Date.now() - startTime,
        config,
      };

      this.plugins.set(pluginName, entry);
      log.debug(
        `Loaded plugin ${pluginName} v${plugin.manifest.version} in ${entry.loadTime}ms`
      );
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginLoadError(pluginName, error as Error);
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    const entry = this.plugins.get(pluginName);
    if (!entry) {
      return;
    }

    try {
      // Dispose plugin
      if (entry.instance.dispose) {
        await entry.instance.dispose();
      }

      // Remove from registry
      this.plugins.delete(pluginName);
      log.debug(`Unloaded plugin ${pluginName}`);
    } catch (error) {
      log.warn(
        `Error unloading plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Unload all plugins
   */
  async unloadAllPlugins(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys());
    await Promise.all(pluginNames.map((name) => this.unloadPlugin(name)));
  }

  /**
   * Execute beforeScaffold hooks
   */
  async executeBeforeScaffold(context: ScaffoldContext): Promise<void> {
    await this.executeHooks("beforeScaffold", context);
  }

  /**
   * Execute templateTransform hooks
   */
  async executeTemplateTransform(context: ScaffoldContext): Promise<void> {
    await this.executeHooks("templateTransform", context);
  }

  /**
   * Execute afterScaffold hooks
   */
  async executeAfterScaffold(context: ScaffoldContext): Promise<void> {
    await this.executeHooks("afterScaffold", context);
  }

  /**
   * Execute beforeInstall hooks
   */
  async executeBeforeInstall(context: InstallContext): Promise<void> {
    await this.executeHooks("beforeInstall", context);
  }

  /**
   * Execute afterInstall hooks
   */
  async executeAfterInstall(context: InstallContext): Promise<void> {
    await this.executeHooks("afterInstall", context);
  }

  /**
   * Execute configValidation hooks
   */
  async executeConfigValidation(
    config: ProjectConfig
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const [pluginName, entry] of this.plugins) {
      if (!entry.enabled || !entry.instance.hooks.configValidation) {
        continue;
      }

      try {
        const result = await entry.instance.hooks.configValidation(config);
        results.push(result);
      } catch (error) {
        log.warn(
          `Plugin ${pluginName} config validation failed: ${error instanceof Error ? error.message : String(error)}`
        );
        results.push({
          valid: false,
          errors: [
            `Plugin ${pluginName} validation error: ${error instanceof Error ? error.message : String(error)}`,
          ],
          warnings: [],
        });
      }
    }

    return results;
  }

  /**
   * Get loaded plugins
   */
  getLoadedPlugins(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values()).filter((entry) => entry.enabled);
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): PluginRegistryEntry | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(name: string): boolean {
    const entry = this.plugins.get(name);
    return entry?.enabled ?? false;
  }

  /**
   * Execute hooks of a specific type
   */
  private async executeHooks(
    hookName: keyof Plugin["hooks"],
    ...args: any[]
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [pluginName, entry] of this.plugins) {
      if (!entry.enabled) {
        continue;
      }

      const hook = entry.instance.hooks[hookName] as Function | undefined;
      if (!hook) {
        continue;
      }

      promises.push(
        (async () => {
          try {
            await hook.apply(entry.instance.hooks, args);
          } catch (error) {
            log.warn(
              `Plugin ${pluginName} hook ${hookName} failed: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        })()
      );
    }

    await Promise.all(promises);
  }

  /**
   * Find plugin module path
   */
  private async findPlugin(pluginName: string): Promise<string | null> {
    const searchPaths = this.config.searchPaths || [
      "node_modules",
      join(process.cwd(), "node_modules"),
      join(process.env.HOME || "~", ".peezy", "plugins"),
    ];

    for (const searchPath of searchPaths) {
      try {
        const pluginPath = resolve(searchPath, pluginName);
        const packageJsonPath = join(pluginPath, "package.json");

        // Check if package.json exists
        await readFile(packageJsonPath, "utf8");

        // Return main entry point
        return join(pluginPath, "index.js");
      } catch {
        // Continue searching
      }
    }

    return null;
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.manifest) {
      throw new Error("Plugin must have a manifest");
    }

    if (!plugin.manifest.name) {
      throw new Error("Plugin manifest must have a name");
    }

    if (!plugin.manifest.version) {
      throw new Error("Plugin manifest must have a version");
    }

    if (!semver.valid(plugin.manifest.version)) {
      throw new Error(
        `Plugin version must be valid semver: ${plugin.manifest.version}`
      );
    }

    if (!plugin.hooks) {
      throw new Error("Plugin must have hooks object");
    }
  }

  /**
   * Check version compatibility
   */
  private checkVersionCompatibility(manifest: PluginManifest): void {
    if (!semver.satisfies(this.cliVersion, manifest.minCliVersion)) {
      throw new PluginVersionError(
        manifest.name,
        manifest.minCliVersion,
        this.cliVersion
      );
    }

    if (
      manifest.maxCliVersion &&
      !semver.satisfies(this.cliVersion, manifest.maxCliVersion)
    ) {
      throw new PluginVersionError(
        manifest.name,
        `<=${manifest.maxCliVersion}`,
        this.cliVersion
      );
    }
  }
}

/**
 * Default plugin configuration
 */
export const defaultPluginConfig: PluginConfig = {
  plugins: {},
  searchPaths: [
    "node_modules",
    join(process.cwd(), "node_modules"),
    join(process.env.HOME || "~", ".peezy", "plugins"),
  ],
  autoInstall: false,
  registries: ["https://registry.npmjs.org"],
};

/**
 * Load plugin configuration from file
 */
export async function loadPluginConfig(
  configPath?: string
): Promise<PluginConfig> {
  if (!configPath) {
    return defaultPluginConfig;
  }

  try {
    const configContent = await readFile(configPath, "utf8");
    const config = JSON.parse(configContent) as Partial<PluginConfig>;

    return {
      ...defaultPluginConfig,
      ...config,
      plugins: {
        ...defaultPluginConfig.plugins,
        ...config.plugins,
      },
    };
  } catch (error) {
    log.warn(
      `Failed to load plugin config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`
    );
    return defaultPluginConfig;
  }
}
