export type TemplateKey = string;

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

export interface NewOptions {
  template?: TemplateKey;
  name?: string;
  install?: boolean;
  git?: boolean;
  pm?: PackageManager;
  json?: boolean;
  databases?: string[];
  includeRedis?: boolean;
  includeSearch?: boolean;
  orm?: "prisma" | "drizzle" | "both";
  volumes?: "preconfigured" | "custom";
  auth?: {
    provider: "nextauth" | "supabase" | "auth0" | "jwt";
    features?: {
      oauth?: boolean;
      emailPassword?: boolean;
      magicLink?: boolean;
      phoneAuth?: boolean;
    };
    providers?: string[];
  };
}

export interface TemplateDefinition {
  title: string;
  path: string;
  popular?: boolean;
  hero?: boolean;
  description?: string;
  tags?: string[];
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

// Peezy Lock File Types
export interface PeezyLockFile {
  $schema: string;
  peezyVersion: string;
  formatVersion: number;
  project: {
    name: string;
    createdAt: string;
  };
  template: {
    name: string;
    version: string;
    source: TemplateSource;
    commit?: string;
    engine: "tar" | "git" | "dir";
    signature?: TemplateSignatureInfo;
  };
  plugins?: PluginLock[];
  options: {
    flags: Record<string, boolean>;
    answers?: Record<string, any>;
  };
  envProviders?: EnvProviderLock[];
  checksums: {
    files: Record<string, string>;
  };
  security?: {
    trustPolicy?: TrustPolicyInfo;
    verifiedAt?: string;
  };
}

export interface TemplateSignatureInfo {
  signer: string;
  digest: string;
  timestamp: string;
  verified: boolean;
  verifiedAt?: string;
  certificate?: {
    subject: string;
    issuer: string;
    notBefore: string;
    notAfter: string;
  };
}

export interface TrustPolicyInfo {
  requireSignatures: boolean;
  allowUnsigned: boolean;
  trustedSigners: string[];
}

export interface TemplateSource {
  type: "registry" | "npm" | "git" | "local";
  registry?: string;
  resolvedUrl?: string;
  integrity?: string;
  spec?: string;
  path?: string;
}

export interface PluginLock {
  name: string;
  version: string;
  source: TemplateSource;
  integrity?: string;
}

export interface EnvProviderLock {
  name: string;
  projectId?: string;
  mappings: Record<string, string>;
}
