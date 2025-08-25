import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TemplateKey, TemplateRegistry } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Helper function to resolve template paths
 */
const templatePath = (name: string): string =>
  path.resolve(__dirname, "../templates", name);

/**
 * Template registry with all available templates
 * Popular templates are marked for UI prioritization
 */
export const registry: TemplateRegistry = {
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

/**
 * Get all template keys as an array
 */
export const templateKeys = Object.keys(registry) as TemplateKey[];

/**
 * Get popular templates first, then others
 */
export const getOrderedTemplates = (): TemplateKey[] => {
  const popular = templateKeys.filter((key) => registry[key].popular);
  const others = templateKeys.filter((key) => !registry[key].popular);
  return [...popular, ...others];
};

/**
 * Validate if a template key exists
 */
export const isValidTemplate = (key: string): key is TemplateKey => {
  return key in registry;
};

/**
 * Get template definition by key
 */
export const getTemplate = (key: TemplateKey) => {
  return registry[key];
};
