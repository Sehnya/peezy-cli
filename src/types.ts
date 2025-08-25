export type TemplateKey =
  | "bun-react-tailwind"
  | "vite-vue-tailwind"
  | "flask"
  | "fastapi"
  | "flask-bun-hybrid";

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
