export type TemplateKey = string;

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

export interface NewOptions {
  template?: TemplateKey;
  name?: string;
  install?: boolean;
  git?: boolean;
  pm?: PackageManager;
}

export interface TemplateDefinition {
  title: string;
  path: string;
  popular?: boolean;
}

export interface TemplateRegistry {
  [key: string]: TemplateDefinition;
}

export interface TokenReplacements {
  APP_NAME: string;
  PKG_NAME: string;
}

// Remote registry types
export interface RemoteTemplateVersion {
  tarball?: string;
  npm?: string;
  integrity: string;
  minNode?: string;
  tags?: string[];
}

export interface RemoteTemplate {
  name: string;
  latest: string;
  versions: Record<string, RemoteTemplateVersion>;
}

export interface RemotePlugin {
  name: string;
  latest: string;
  versions: Record<string, RemoteTemplateVersion>;
}

export interface RemoteRegistry {
  $schema: string;
  version: number;
  templates: RemoteTemplate[];
  plugins: RemotePlugin[];
}

export interface CachedTemplate {
  name: string;
  version: string;
  path: string;
  cachedAt: number;
  integrity: string;
}

export interface RegistryCache {
  registry?: RemoteRegistry;
  lastFetch: number;
  templates: Record<string, CachedTemplate>;
}
