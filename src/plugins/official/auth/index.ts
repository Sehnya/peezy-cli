/**
 * @peezy/plugin-auth
 *
 * Official authentication plugin for Peezy CLI
 * Supports NextAuth.js, Supabase Auth, Auth0, and custom JWT
 */

import type {
  Plugin,
  PluginManifest,
  PluginHooks,
  ScaffoldContext,
  ValidationResult,
  ProjectConfig,
} from "../../v1/types.js";

interface AuthConfig {
  provider: "nextauth" | "supabase" | "auth0" | "jwt";
  features?: {
    oauth?: boolean;
    emailPassword?: boolean;
    magicLink?: boolean;
    phoneAuth?: boolean;
  };
  providers?: string[]; // OAuth providers like 'google', 'github', 'discord'
}

export default class AuthPlugin implements Plugin {
  manifest: PluginManifest = {
    name: "@peezy/plugin-auth",
    version: "1.0.0",
    description: "Authentication setup for modern web applications",
    author: "Peezy Team",
    minCliVersion: "^1.0.0",
    homepage: "https://github.com/Sehnya/peezy-cli/tree/main/plugins/auth",
    keywords: [
      "peezy",
      "plugin",
      "auth",
      "authentication",
      "nextauth",
      "supabase",
    ],
    license: "MIT",
  };

  hooks: PluginHooks = {
    async beforeScaffold(context: ScaffoldContext): Promise<void> {
      const authConfig = context.config.options.auth as AuthConfig;
      if (!authConfig) return;

      context.logger.info(`Setting up ${authConfig.provider} authentication`);
    },

    async afterScaffold(context: ScaffoldContext): Promise<void> {
      const authConfig = context.config.options.auth as AuthConfig;
      if (!authConfig) return;

      // Add basic auth dependencies based on provider
      switch (authConfig.provider) {
        case "nextauth":
          context.utils.package.addDependency("next-auth", "^4.24.0");
          break;
        case "supabase":
          context.utils.package.addDependency(
            "@supabase/supabase-js",
            "^2.38.0"
          );
          break;
        case "auth0":
          context.utils.package.addDependency("@auth0/auth0-react", "^2.2.4");
          break;
        case "jwt":
          context.utils.package.addDependency("jsonwebtoken", "^9.0.2");
          context.utils.package.addDependency("bcryptjs", "^2.4.3");
          break;
      }

      context.logger.success(
        `${authConfig.provider} authentication configured successfully`
      );
    },

    async configValidation(config: ProjectConfig): Promise<ValidationResult> {
      const authConfig = config.options.auth as AuthConfig;
      if (!authConfig) {
        return { valid: true, errors: [], warnings: [] };
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate auth provider compatibility with template
      if (
        authConfig.provider === "nextauth" &&
        !config.template.includes("nextjs")
      ) {
        errors.push("NextAuth.js requires a Next.js template");
      }

      if (
        authConfig.provider === "supabase" &&
        !config.options.databases?.includes("postgresql")
      ) {
        warnings.push("Supabase Auth works best with PostgreSQL database");
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    },
  };
}
