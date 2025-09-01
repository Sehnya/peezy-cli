/**
 * Core types and interfaces for the Version Scrubbing Plugin
 */

export interface VersionInfo {
  name: string;
  current: string;
  latest: string;
  latestStable: string;
  eolDate?: Date;
  securityAdvisories: SecurityAdvisory[];
  breakingChanges: BreakingChange[];
  migrationGuide?: string;
  releaseNotes?: string;
  publishedAt?: Date;
}

export interface SecurityAdvisory {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedVersions: string[];
  fixedVersion?: string;
  description: string;
  cveId?: string;
  publishedAt: Date;
  references?: string[];
}

export interface BreakingChange {
  version: string;
  description: string;
  migrationGuide?: string;
  affectedFeatures: string[];
  workarounds?: string[];
}

export interface UpdateRecommendation {
  priority: "critical" | "high" | "medium" | "low";
  type: "security" | "eol" | "feature" | "bugfix" | "maintenance";
  impact: "breaking" | "compatible" | "unknown";
  recommendation: string;
  actions: UpdateAction[];
  timeline?: string;
  estimatedEffort?: string;
}

export interface UpdateAction {
  type: "upgrade" | "configure" | "test" | "migrate" | "review";
  description: string;
  command?: string;
  documentation?: string;
  automated?: boolean;
}

export interface UpdateAnalysis {
  technology: string;
  currentVersion: string;
  recommendedVersion: string;
  updatePath: VersionStep[];
  risks: Risk[];
  benefits: string[];
  recommendation: UpdateRecommendation;
}

export interface VersionStep {
  from: string;
  to: string;
  type: "patch" | "minor" | "major";
  breakingChanges: BreakingChange[];
  required: boolean;
}

export interface Risk {
  type: "breaking" | "security" | "compatibility" | "performance";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  mitigation?: string;
}

export interface RuntimeInfo {
  name: string;
  version: VersionInfo;
  ltsVersions: string[];
  eolSchedule: EOLInfo[];
  releaseSchedule?: ReleaseSchedule;
}

export interface PackageManagerInfo {
  name: string;
  version: VersionInfo;
  compatibleRuntimes: Record<string, string[]>;
}

export interface FrameworkInfo {
  name: string;
  version: VersionInfo;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  compatibilityMatrix: Record<string, string[]>;
}

export interface EOLInfo {
  version: string;
  eolDate: Date;
  supportType: "active" | "maintenance" | "eol";
  extendedSupport?: Date;
}

export interface ReleaseSchedule {
  cadence: "monthly" | "quarterly" | "biannual" | "annual" | "irregular";
  nextRelease?: Date;
  nextMajor?: Date;
}

export interface VersionRegistry {
  runtimes: {
    nodejs: RuntimeInfo;
    python: RuntimeInfo;
    bun: RuntimeInfo;
  };
  packageManagers: {
    npm: PackageManagerInfo;
    pnpm: PackageManagerInfo;
    yarn: PackageManagerInfo;
    pip: PackageManagerInfo;
  };
  frameworks: {
    react: FrameworkInfo;
    vue: FrameworkInfo;
    vite: FrameworkInfo;
    flask: FrameworkInfo;
    fastapi: FrameworkInfo;
    tailwindcss: FrameworkInfo;
  };
  lastUpdated: Date;
  cacheExpiry: Date;
}

export interface CheckResult {
  success: boolean;
  data?: VersionInfo;
  error?: string;
  cached?: boolean;
  rateLimited?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  rateLimit?: {
    remaining: number;
    reset: Date;
    limit: number;
  };
  cached: boolean;
}

export abstract class VersionChecker {
  abstract checkVersion(): Promise<CheckResult>;
  abstract getUpdateRecommendation(
    current: string,
    latest: string
  ): UpdateRecommendation;
  abstract parseVersion(versionString: string): string;
  abstract compareVersions(version1: string, version2: string): number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
  key: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: ("console" | "file" | "webhook")[];
  severity: "all" | "security" | "breaking" | "major";
  webhookUrl?: string;
  outputFile?: string;
}

export type UpdateStrategy = "conservative" | "moderate" | "aggressive";
export type TechnologyType = "runtime" | "framework" | "package" | "tool";
export type VersionType = "stable" | "prerelease" | "lts" | "latest";
