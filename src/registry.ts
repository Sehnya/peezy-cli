import path from "node:path";
import { fileURLToPath } from "node:url";
import { RemoteRegistryService } from "./services/remote-registry.js";
import { log } from "./utils/logger.js";
import type { TemplateKey, TemplateRegistry, RemoteTemplate } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Helper function to resolve template paths
 */
const templatePath = (name: string): string =>
  path.resolve(__dirname, "../templates", name);

/**
 * Local template registry with embedded templates
 * Hero templates are marked as popular for UI prioritization
 */
export const localRegistry: TemplateRegistry = {
  // Hero Experiences - Curated Full-Stack Templates
  "nextjs-fullstack": {
    title: "🚀 Next.js Full-Stack + Auth + Database",
    path: templatePath("nextjs-fullstack"),
    popular: true,
    hero: true,
    description:
      "Complete Next.js 14 app with authentication, database, and modern UI",
    tags: [
      "nextjs",
      "react",
      "typescript",
      "tailwind",
      "auth",
      "database",
      "drizzle",
    ],
  },
  "express-fullstack": {
    title: "🚀 Express + React Full-Stack",
    path: templatePath("express-fullstack"),
    popular: true,
    hero: true,
    description:
      "Express.js backend with React frontend, authentication, and database",
    tags: ["express", "react", "typescript", "api", "auth", "database"],
  },
  "react-spa-advanced": {
    title: "🚀 React SPA + Advanced Features",
    path: templatePath("react-spa-advanced"),
    popular: true,
    hero: true,
    description: "Modern React SPA with routing, state management, and testing",
    tags: ["react", "spa", "typescript", "tailwind", "testing", "routing"],
  },

  // Existing Templates
  "nextjs-app-router": {
    title: "Next.js 14 + App Router + TypeScript + Tailwind",
    path: templatePath("nextjs-app-router"),
    popular: true,
  },
  "express-typescript": {
    title: "Express.js + TypeScript + REST API",
    path: templatePath("express-typescript"),
    popular: true,
  },
  "bun-react-tailwind": {
    title: "Bun + React + Vite + Tailwind",
    path: templatePath("bun-react-tailwind"),
    popular: true,
  },
  "vite-vue-tailwind": {
    title: "Vite + Vue + Tailwind",
    path: templatePath("vite-vue-tailwind"),
    popular: true,
  },
  flask: {
    title: "Python Flask API/App",
    path: templatePath("flask"),
    popular: true,
  },
  fastapi: {
    title: "Python FastAPI",
    path: templatePath("fastapi"),
  },
  "flask-bun-hybrid": {
    title: "Flask backend + Bun frontend",
    path: templatePath("flask-bun-hybrid"),
  },
};

// Backward compatibility
export const registry = localRegistry;

/**
 * Remote registry service instance
 */
const remoteRegistry = new RemoteRegistryService();

/**
 * Parse template name with optional version and scope
 * Examples: "template", "@org/template", "template@1.0.0", "@org/template@1.0.0"
 */
export function parseTemplateName(input: string): {
  scope?: string;
  name: string;
  version?: string;
  fullName: string;
} {
  // Handle scoped packages
  const scopeMatch = input.match(/^(@[^/]+\/)/);
  const scope = scopeMatch?.[1];
  const withoutScope = scope ? input.slice(scope.length) : input;

  // Handle version
  const versionMatch = withoutScope.match(/^([^@]+)@(.+)$/);
  const name = versionMatch ? versionMatch[1] : withoutScope;
  const version = versionMatch ? versionMatch[2] : undefined;

  const fullName = scope ? `${scope}${name}` : name;

  return { scope, name, version, fullName };
}

/**
 * Get all available templates (local + remote)
 */
export async function getAllTemplates(): Promise<{
  local: TemplateKey[];
  remote: RemoteTemplate[];
}> {
  try {
    const remoteTemplates = await remoteRegistry.listTemplates();
    return {
      local: Object.keys(localRegistry),
      remote: remoteTemplates,
    };
  } catch (error) {
    log.warn(
      `Failed to fetch remote templates: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      local: Object.keys(localRegistry),
      remote: [],
    };
  }
}

/**
 * Get all template keys as an array (local only for backward compatibility)
 */
export const templateKeys = Object.keys(localRegistry) as TemplateKey[];

/**
 * Get popular templates first, then others (local only for backward compatibility)
 */
export const getOrderedTemplates = (): TemplateKey[] => {
  const popular = templateKeys.filter((key) => localRegistry[key].popular);
  const others = templateKeys.filter((key) => !localRegistry[key].popular);
  return [...popular, ...others];
};

/**
 * Validate if a template key exists (local only)
 */
export const isValidTemplate = (key: string): key is TemplateKey => {
  return key in localRegistry;
};

/**
 * Check if a template name is a remote template
 */
export function isRemoteTemplate(templateName: string): boolean {
  const parsed = parseTemplateName(templateName);
  return (
    parsed.scope !== undefined ||
    parsed.version !== undefined ||
    !isValidTemplate(parsed.fullName)
  );
}

/**
 * Get template definition by key (local only)
 */
export const getTemplate = (key: TemplateKey) => {
  return localRegistry[key];
};

/**
 * Resolve template path (local, remote, GitHub, or npm)
 */
export async function resolveTemplate(templateName: string): Promise<{
  path: string;
  isRemote: boolean;
  version?: string;
  source: "local" | "registry" | "github" | "npm";
}> {
  // GitHub source
  if (templateName.startsWith("github:")) {
    const templatePath = await remoteRegistry.downloadFromGitHub(templateName);
    return { path: templatePath, isRemote: true, source: "github" };
  }

  // npm source
  if (templateName.startsWith("npm:")) {
    const spec = templateName.slice(4);
    const atIndex = spec.lastIndexOf("@");
    let packageName = spec;
    let version: string | undefined;
    if (atIndex > 0) {
      packageName = spec.slice(0, atIndex);
      version = spec.slice(atIndex + 1);
    }
    const templatePath = await remoteRegistry.downloadFromNpm(packageName, version);
    return { path: templatePath, isRemote: true, version, source: "npm" };
  }

  const parsed = parseTemplateName(templateName);

  // Check if it's a local template first
  if (!parsed.scope && !parsed.version && isValidTemplate(parsed.name)) {
    return {
      path: localRegistry[parsed.name].path,
      isRemote: false,
      source: "local",
    };
  }

  // Try to resolve as remote registry template
  try {
    const templatePath = await remoteRegistry.downloadTemplate(
      parsed.fullName,
      parsed.version
    );
    return {
      path: templatePath,
      isRemote: true,
      version: parsed.version,
      source: "registry",
    };
  } catch (error) {
    throw new Error(
      `Template "${templateName}" not found. Try:\n` +
        `  - Local: peezy list\n` +
        `  - GitHub: peezy add github:owner/repo\n` +
        `  - npm: peezy add npm:package-name\n` +
        `  - Registry: peezy add @scope/template`
    );
  }
}

/**
 * Get remote registry service instance
 */
export function getRemoteRegistry(): RemoteRegistryService {
  return remoteRegistry;
}
