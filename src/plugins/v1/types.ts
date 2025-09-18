/**
 * Peezy Plugin API v1.0
 *
 * This API is stable and follows semantic versioning.
 * All v1.x.x plugins will work with all v1.x.x CLI versions.
 */

import type { TemplateKey, NewOptions } from "../../types.js";

/**
 * Plugin metadata and requirements
 */
export interface PluginManifest {
  /** Plugin name (must match package name) */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Plugin description */
  description: string;

  /** Plugin author */
  author: string;

  /** Minimum CLI version required (semver range) */
  minCliVersion: string;

  /** Maximum CLI version supported (optional, semver range) */
  maxCliVersion?: string;

  /** Plugin homepage/repository */
  homepage?: string;

  /** Plugin keywords for discovery */
  keywords?: string[];

  /** Plugin license */
  license?: string;
}

/**
 * File system representation
 */
export interface FileMap {
  [path: string]: {
    content: string;
    encoding?: "utf8" | "binary";
    permissions?: number;
  };
}

/**
 * Project configuration context
 */
export interface ProjectConfig {
  /** Template being used */
  template: TemplateKey;

  /** Project name */
  name: string;

  /** Project path */
  path: string;

  /** CLI options */
  options: NewOptions;

  /** Environment variables */
  env: Record<string, string>;

  /** Package manager being used */
  packageManager: "bun" | "npm" | "pnpm" | "yarn";
}

/**
 * Scaffolding context passed to hooks
 */
export interface ScaffoldContext {
  /** Project configuration */
  config: ProjectConfig;

  /** Template files before processing */
  templateFiles: FileMap;

  /** Generated files (mutable) */
  files: FileMap;

  /** Logger instance */
  logger: PluginLogger;

  /** Utilities for common operations */
  utils: PluginUtils;
}

/**
 * Installation context passed to hooks
 */
export interface InstallContext {
  /** Project configuration */
  config: ProjectConfig;

  /** Dependencies to install */
  dependencies: {
    production: string[];
    development: string[];
  };

  /** Logger instance */
  logger: PluginLogger;

  /** Utilities for common operations */
  utils: PluginUtils;
}

/**
 * Validation result for configuration
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Error messages if validation failed */
  errors: string[];

  /** Warning messages */
  warnings: string[];

  /** Suggested fixes */
  suggestions?: string[];
}

/**
 * Plugin logger interface
 */
export interface PluginLogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
}

/**
 * Plugin utilities for common operations
 */
export interface PluginUtils {
  /** File system operations */
  fs: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    mkdir(path: string): Promise<void>;
    copy(src: string, dest: string): Promise<void>;
  };

  /** Template operations */
  template: {
    render(template: string, data: Record<string, any>): string;
    replaceTokens(content: string, tokens: Record<string, string>): string;
  };

  /** Package management */
  package: {
    addDependency(name: string, version?: string, dev?: boolean): void;
    removeDependency(name: string): void;
    updatePackageJson(updates: Record<string, any>): void;
  };

  /** Git operations */
  git: {
    isRepo(): Promise<boolean>;
    init(): Promise<void>;
    add(files: string[]): Promise<void>;
    commit(message: string): Promise<void>;
  };
}

/**
 * Plugin hook definitions
 *
 * All hooks are optional and will be called if implemented
 */
export interface PluginHooks {
  /**
   * Called before scaffolding begins
   * Can modify configuration and validate inputs
   */
  beforeScaffold?(context: ScaffoldContext): Promise<void>;

  /**
   * Called after template files are loaded but before processing
   * Can transform template files
   */
  templateTransform?(context: ScaffoldContext): Promise<void>;

  /**
   * Called after scaffolding is complete
   * Can add additional files or modify generated content
   */
  afterScaffold?(context: ScaffoldContext): Promise<void>;

  /**
   * Called before dependency installation
   * Can modify dependency lists
   */
  beforeInstall?(context: InstallContext): Promise<void>;

  /**
   * Called after dependency installation
   * Can run additional setup commands
   */
  afterInstall?(context: InstallContext): Promise<void>;

  /**
   * Validate project configuration
   * Called during scaffolding to ensure valid setup
   */
  configValidation?(config: ProjectConfig): Promise<ValidationResult>;

  /**
   * Called when CLI shuts down
   * Cleanup operations
   */
  cleanup?(): Promise<void>;
}

/**
 * Main plugin interface
 *
 * Plugins must export a default class implementing this interface
 */
export interface Plugin {
  /** Plugin metadata */
  manifest: PluginManifest;

  /** Plugin hooks */
  hooks: PluginHooks;

  /**
   * Initialize the plugin
   * Called once when plugin is loaded
   */
  initialize?(): Promise<void>;

  /**
   * Dispose the plugin
   * Called when plugin is unloaded
   */
  dispose?(): Promise<void>;
}

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
  /** Plugin manifest */
  manifest: PluginManifest;

  /** Plugin instance */
  instance: Plugin;

  /** Whether plugin is enabled */
  enabled: boolean;

  /** Plugin load time */
  loadTime: number;

  /** Plugin configuration */
  config?: Record<string, any>;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  /** Enabled plugins */
  plugins: {
    [pluginName: string]: {
      enabled: boolean;
      config?: Record<string, any>;
    };
  };

  /** Plugin search paths */
  searchPaths?: string[];

  /** Auto-install missing plugins */
  autoInstall?: boolean;

  /** Plugin registry URLs */
  registries?: string[];
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public pluginName: string,
    public code?: string
  ) {
    super(message);
    this.name = "PluginError";
  }
}

export class PluginVersionError extends PluginError {
  constructor(
    pluginName: string,
    requiredVersion: string,
    actualVersion: string
  ) {
    super(
      `Plugin ${pluginName} requires CLI version ${requiredVersion}, but ${actualVersion} is installed`,
      pluginName,
      "VERSION_MISMATCH"
    );
    this.name = "PluginVersionError";
  }
}

export class PluginLoadError extends PluginError {
  constructor(pluginName: string, cause: Error) {
    super(
      `Failed to load plugin ${pluginName}: ${cause.message}`,
      pluginName,
      "LOAD_FAILED"
    );
    this.name = "PluginLoadError";
    this.cause = cause;
  }
}
