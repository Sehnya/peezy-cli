import prompts from "prompts";
import { registry, getOrderedTemplates } from "../registry.js";
import type { TemplateKey, PackageManager } from "../types.js";

/**
 * Enhanced prompt configurations with educational content
 */

export interface DatabaseChoice {
  title: string;
  value: string;
  description: string;
  hint?: string;
}

export interface ORMChoice {
  title: string;
  value: string;
  description: string;
  hint?: string;
  learnMore?: string;
}

export interface PackageManagerChoice {
  title: string;
  value: PackageManager;
  description: string;
  hint?: string;
}

/**
 * Database options with educational descriptions
 */
export const DATABASE_CHOICES: DatabaseChoice[] = [
  {
    title: "PostgreSQL",
    value: "postgresql",
    description: "Most popular open-source relational database",
    hint: "Great for complex queries, ACID compliance, and scalability",
  },
  {
    title: "MySQL",
    value: "mysql",
    description: "Fast, reliable relational database",
    hint: "Excellent for web applications and read-heavy workloads",
  },
  {
    title: "SQLite",
    value: "sqlite",
    description: "Lightweight, file-based database",
    hint: "Perfect for development, testing, and small applications",
  },
  {
    title: "MongoDB",
    value: "mongodb",
    description: "Flexible NoSQL document database",
    hint: "Ideal for rapid development and unstructured data",
  },
];

/**
 * ORM options with educational descriptions
 */
export const ORM_CHOICES: ORMChoice[] = [
  {
    title: "Prisma",
    value: "prisma",
    description: "Type-safe database toolkit with visual studio",
    hint: "Auto-generates TypeScript types, includes migration system",
    learnMore: "Great for beginners - visual database browser included!",
  },
  {
    title: "Drizzle",
    value: "drizzle",
    description: "Lightweight, SQL-like TypeScript ORM",
    hint: "Minimal overhead, feels like writing SQL with type safety",
    learnMore: "Preferred by performance-focused developers",
  },
  {
    title: "Both (Compare)",
    value: "both",
    description: "Install both ORMs to compare and learn",
    hint: "Perfect for learning - see different approaches side-by-side",
    learnMore: "Educational setup - try both and pick your favorite!",
  },
];

/**
 * Package manager options with educational descriptions
 */
export const PACKAGE_MANAGER_CHOICES: PackageManagerChoice[] = [
  {
    title: "⚡ Bun (Recommended)",
    value: "bun",
    description: "Ultra-fast JavaScript runtime and package manager",
    hint: "3x faster installs, built-in bundler and test runner",
  },
  {
    title: "📦 npm",
    value: "npm",
    description: "Default Node.js package manager",
    hint: "Most widely used, comes with Node.js installation",
  },
  {
    title: "🚀 pnpm",
    value: "pnpm",
    description: "Fast, disk space efficient package manager",
    hint: "Uses hard links to save disk space, faster than npm",
  },
  {
    title: "🧶 Yarn",
    value: "yarn",
    description: "Fast, reliable package manager by Facebook",
    hint: "Good caching, workspaces support for monorepos",
  },
];

/**
 * Enhanced template selection with better descriptions
 */
export function getTemplateChoices() {
  const orderedTemplates = getOrderedTemplates();

  return orderedTemplates.map((key) => {
    const template = registry[key];
    const isPopular = template.popular;

    // Enhanced descriptions with learning context
    const enhancedDescriptions: Record<string, string> = {
      "bun-react-tailwind": "React + Vite + Tailwind CSS with Bun runtime",
      "vite-vue-tailwind": "Vue 3 + Vite + Tailwind CSS for modern SPAs",
      "nextjs-app-router": "Full-stack React framework with App Router",
      "express-typescript": "Node.js API server with TypeScript",
      flask: "Python web framework - simple and flexible",
      fastapi: "Modern Python API framework with auto docs",
      "flask-bun-hybrid": "Full-stack: Python backend + React frontend",
    };

    const hints: Record<string, string> = {
      "bun-react-tailwind": "Perfect for learning React with modern tooling",
      "vite-vue-tailwind": "Great for developers coming from Vue 2",
      "nextjs-app-router": "Best for full-stack React apps with SSR",
      "express-typescript": "Ideal for REST APIs and microservices",
      flask: "Python beginners start here - minimal and clear",
      fastapi: "Modern Python with automatic API documentation",
      "flask-bun-hybrid":
        "Learn full-stack development with different languages",
    };

    const title = isPopular
      ? `⭐ ${key} — ${enhancedDescriptions[key] || template.title}`
      : `   ${key} — ${enhancedDescriptions[key] || template.title}`;

    return {
      title,
      value: key,
      description: hints[key] || "",
    };
  });
}

/**
 * Enhanced prompts with educational content
 */
export async function getEnhancedProjectConfig(
  templateArg?: string,
  nameArg?: string,
  opts?: any
) {
  console.log(
    "🚀 Let's create your project! Each choice includes helpful info for learning.\n"
  );

  const answers = await prompts(
    [
      // Template selection
      {
        type: templateArg ? null : "select",
        name: "template",
        message: "Choose your project template:",
        hint: "Use ↑↓ arrows to browse, ENTER to select",
        choices: getTemplateChoices(),
        initial: 0,
      },

      // Project name
      {
        type: nameArg ? null : "text",
        name: "name",
        message: "What's your project name?",
        initial: "my-app",
        hint: "This will be your folder name and package name",
        validate: (value: string) => {
          if (!value || value.trim().length === 0) {
            return "Project name is required";
          }
          if (value.length > 214) {
            return "Project name must be less than 214 characters";
          }
          const reserved = [
            "node_modules",
            "package.json",
            "package-lock.json",
            ".git",
            ".env",
          ];
          if (reserved.includes(value.toLowerCase())) {
            return `"${value}" is a reserved name and cannot be used`;
          }
          if (value.startsWith(".")) {
            return "Project name cannot start with a dot";
          }
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            return "Project name can only contain letters, numbers, hyphens, and underscores";
          }
          if (value.startsWith("-") || value.endsWith("-")) {
            return "Project name cannot start or end with hyphens";
          }
          return true;
        },
      },

      // Package manager selection
      {
        type: opts?.pm ? null : "select",
        name: "pm",
        message: "Choose your package manager:",
        hint: "This will install your dependencies and run scripts",
        choices: PACKAGE_MANAGER_CHOICES.map((choice) => ({
          title: choice.title,
          value: choice.value,
          description: choice.hint,
        })),
        initial: 0,
      },

      // Database selection (conditional)
      {
        type: (prev, values) => {
          const template = templateArg || values.template;
          const needsDatabase = [
            "nextjs-app-router",
            "express-typescript",
            "flask",
            "fastapi",
            "flask-bun-hybrid",
          ].includes(template);
          return needsDatabase && !opts?.databases ? "multiselect" : null;
        },
        name: "databases",
        message: "Select databases for your project:",
        hint: "Use SPACEBAR to select/deselect, ENTER when done",
        choices: DATABASE_CHOICES.map((choice) => ({
          title: `${choice.title} — ${choice.description}`,
          value: choice.value,
          description: choice.hint,
          selected: choice.value === "postgresql", // Default selection
        })),
        min: 0,
        instructions: false,
        format: (values: string[]) => values.join(","),
      },

      // ORM selection (conditional on database selection)
      {
        type: (prev, values) => {
          const hasDatabases =
            opts?.databases ||
            (values.databases && values.databases.length > 0);
          return hasDatabases && !opts?.orm ? "select" : null;
        },
        name: "orm",
        message: "Choose your ORM (Object-Relational Mapping):",
        hint: "ORMs help you work with databases using TypeScript/JavaScript",
        choices: ORM_CHOICES.map((choice) => ({
          title: `${choice.title} — ${choice.description}`,
          value: choice.value,
          description: choice.learnMore || choice.hint,
        })),
        initial: 0,
      },

      // Redis option (conditional)
      {
        type: (prev, values) => {
          const hasDatabases =
            opts?.databases ||
            (values.databases && values.databases.length > 0);
          return hasDatabases && opts?.redis === undefined ? "toggle" : null;
        },
        name: "includeRedis",
        message: "Add Redis for caching and sessions?",
        hint: "Redis speeds up your app by storing frequently used data in memory",
        initial: false,
        active: "Yes — faster app performance",
        inactive: "No — keep it simple for now",
      },

      // Volume configuration (conditional)
      {
        type: (prev, values) => {
          const hasDatabases =
            opts?.databases ||
            (values.databases && values.databases.length > 0);
          return hasDatabases && !opts?.volumes ? "select" : null;
        },
        name: "volumes",
        message: "How should we handle database storage?",
        hint: "This determines where your database files are stored",
        choices: [
          {
            title: "📁 Preconfigured (Recommended for learning)",
            value: "preconfigured",
            description:
              "Creates ./volumes folder - easy to backup and understand",
          },
          {
            title: "🐳 Docker Managed (Production-like)",
            value: "custom",
            description:
              "Let Docker handle storage - more like production setups",
          },
        ],
        initial: 0,
      },

      // Installation confirmation
      {
        type: typeof opts?.install === "boolean" ? null : "toggle",
        name: "install",
        message: "Install dependencies automatically?",
        hint: "We'll run the package manager to download all required packages",
        initial: true,
        active: "Yes — set everything up",
        inactive: "No — I'll install manually",
      },

      // Git initialization
      {
        type: typeof opts?.git === "boolean" ? null : "toggle",
        name: "git",
        message: "Initialize Git repository?",
        hint: "Git tracks your code changes - essential for any project",
        initial: true,
        active: "Yes — track my changes",
        inactive: "No — skip version control",
      },
    ],
    {
      onCancel: () => {
        console.log(
          "\n👋 No worries! Run 'peezy new' again when you're ready."
        );
        process.exit(0);
      },
    }
  );

  return answers;
}

/**
 * Show helpful information about selected options
 */
export function showConfigSummary(config: any) {
  console.log("\n📋 Project Configuration Summary:");
  console.log(`   Template: ${config.template}`);
  console.log(`   Name: ${config.name}`);
  console.log(`   Package Manager: ${config.pm}`);

  if (config.databases && config.databases.length > 0) {
    console.log(
      `   Databases: ${Array.isArray(config.databases) ? config.databases.join(", ") : config.databases}`
    );

    if (config.orm) {
      const ormInfo = ORM_CHOICES.find((choice) => choice.value === config.orm);
      console.log(`   ORM: ${config.orm} — ${ormInfo?.description || ""}`);
    }

    if (config.includeRedis) {
      console.log(`   Redis: Included for caching and sessions`);
    }

    if (config.volumes) {
      console.log(
        `   Storage: ${config.volumes === "preconfigured" ? "Local ./volumes folder" : "Docker managed"}`
      );
    }
  }

  console.log(`   Install deps: ${config.install ? "Yes" : "No"}`);
  console.log(`   Git repo: ${config.git ? "Yes" : "No"}`);
  console.log();
}
/**
 * Show educational next steps based on configuration
 */
export function showEducationalNextSteps(config: any) {
  console.log("🎓 Learning Resources & Next Steps:");
  console.log();

  // Template-specific guidance
  const templateGuidance: Record<string, string[]> = {
    "express-typescript": [
      "📚 Learn Express.js: https://expressjs.com/en/starter/hello-world.html",
      "🔧 TypeScript Handbook: https://www.typescriptlang.org/docs/",
      "🧪 Testing with Jest: Check out src/__tests__/ for examples",
    ],
    "nextjs-app-router": [
      "📚 Next.js App Router: https://nextjs.org/docs/app",
      "⚛️ React Docs: https://react.dev/learn",
      "🎨 Tailwind CSS: https://tailwindcss.com/docs",
    ],
    "bun-react-tailwind": [
      "⚡ Bun Runtime: https://bun.sh/docs",
      "⚛️ React with Vite: https://vitejs.dev/guide/",
      "🎨 Tailwind CSS: https://tailwindcss.com/docs",
    ],
    "vite-vue-tailwind": [
      "💚 Vue 3 Guide: https://vuejs.org/guide/",
      "⚡ Vite Features: https://vitejs.dev/guide/features.html",
      "🎨 Tailwind CSS: https://tailwindcss.com/docs",
    ],
  };

  if (templateGuidance[config.template]) {
    templateGuidance[config.template].forEach((tip) =>
      console.log(`   ${tip}`)
    );
    console.log();
  }

  // Database-specific guidance
  if (config.databases && config.databases.length > 0) {
    console.log("🗄️ Database Resources:");

    const dbResources: Record<string, string> = {
      postgresql:
        "PostgreSQL Tutorial: https://www.postgresql.org/docs/current/tutorial.html",
      mysql:
        "MySQL Getting Started: https://dev.mysql.com/doc/mysql-getting-started/en/",
      sqlite: "SQLite Tutorial: https://www.sqlite.org/quickstart.html",
      mongodb: "MongoDB University: https://university.mongodb.com/",
    };

    const databases = Array.isArray(config.databases)
      ? config.databases
      : [config.databases];
    databases.forEach((db: string) => {
      if (dbResources[db]) {
        console.log(`   📖 ${dbResources[db]}`);
      }
    });
    console.log();
  }

  // ORM-specific guidance
  if (config.orm) {
    console.log("🔗 ORM Learning Resources:");

    if (config.orm === "prisma" || config.orm === "both") {
      console.log(
        "   🔷 Prisma Docs: https://www.prisma.io/docs/getting-started"
      );
      console.log("   🎯 Try: npm run db:studio (visual database browser)");
    }

    if (config.orm === "drizzle" || config.orm === "both") {
      console.log("   🟡 Drizzle Docs: https://orm.drizzle.team/docs/overview");
      console.log(
        "   🎯 Try: npm run drizzle:studio (query builder interface)"
      );
    }

    if (config.orm === "both") {
      console.log(
        "   🤔 Compare both ORMs in your project to see which you prefer!"
      );
    }
    console.log();
  }

  // Development workflow tips
  console.log("🚀 Development Workflow:");
  console.log(`   1. cd ${config.name}`);

  if (config.databases && config.databases.length > 0) {
    console.log("   2. docker-compose up -d  # Start databases");

    if (config.orm === "prisma" || config.orm === "both") {
      console.log("   3. npm run db:generate   # Generate Prisma client");
      console.log("   4. npm run db:push       # Create database schema");
      console.log("   5. npm run db:seed       # Add sample data");
    }

    if (config.orm === "drizzle" || config.orm === "both") {
      console.log("   3. npm run drizzle:push  # Create database schema");
      console.log("   4. npm run drizzle:seed  # Add sample data");
    }
  }

  const devCommand =
    config.pm === "bun"
      ? "bun run dev"
      : config.pm === "yarn"
        ? "yarn dev"
        : config.pm === "pnpm"
          ? "pnpm dev"
          : "npm run dev";

  console.log(
    `   ${config.databases && config.databases.length > 0 ? "6" : "2"}. ${devCommand}           # Start development server`
  );
  console.log();

  // Package manager specific tips
  const pmTips: Record<string, string> = {
    bun: "💡 Bun Tip: Use 'bun --watch' for auto-restart during development",
    npm: "💡 npm Tip: Use 'npm run' to see all available scripts",
    pnpm: "💡 pnpm Tip: Use 'pnpm dlx' to run packages without installing",
    yarn: "💡 Yarn Tip: Use 'yarn why <package>' to understand dependencies",
  };

  if (pmTips[config.pm]) {
    console.log(pmTips[config.pm]);
    console.log();
  }
}
