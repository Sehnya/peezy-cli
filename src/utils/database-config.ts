import { promises as fs } from "fs";
import { join } from "path";
import { log } from "./logger.js";

export interface DatabaseConfig {
  type:
    | "postgresql"
    | "mysql"
    | "sqlite"
    | "mongodb"
    | "redis"
    | "elasticsearch";
  name: string;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  url?: string;
}

export interface DatabaseSetup {
  databases: DatabaseConfig[];
  envVariables: Record<string, string>;
  dockerServices: Record<string, any>;
  initScripts?: string[];
  ormConfig?: {
    type: "prisma" | "drizzle" | "both";
    schemas: Record<string, string>;
    migrations: Record<string, string>;
    seeders: Record<string, string>;
  };
  volumes: Record<string, VolumeConfig>;
}

export interface VolumeConfig {
  type: "named" | "bind" | "tmpfs";
  source?: string;
  target: string;
  options?: Record<string, any>;
}

/**
 * Generate database configuration based on project type and requirements
 */
export function generateDatabaseSetup(
  projectName: string,
  templateName: string,
  options: {
    databases?: string[];
    includeRedis?: boolean;
    includeSearch?: boolean;
    orm?: "prisma" | "drizzle" | "both";
    volumes?: "preconfigured" | "custom";
  } = {}
): DatabaseSetup {
  const setup: DatabaseSetup = {
    databases: [],
    envVariables: {},
    dockerServices: {},
    initScripts: [],
    volumes: {},
  };

  const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9]/g, "_");

  // Default database based on template
  const defaultDatabases = getDefaultDatabases(templateName);
  const requestedDatabases = options.databases || defaultDatabases;

  // Generate database configurations
  for (const dbType of requestedDatabases) {
    const config = generateDatabaseConfig(sanitizedName, dbType as any);
    if (config) {
      setup.databases.push(config);

      // Add environment variables
      Object.assign(setup.envVariables, generateEnvVariables(config));

      // Add Docker service
      setup.dockerServices[dbType] = generateDockerService(config);

      // Add init scripts if needed
      const initScript = generateInitScript(config);
      if (initScript) {
        setup.initScripts?.push(initScript);
      }
    }
  }

  // Add Redis if requested or if it's a web application
  if (options.includeRedis || isWebApplication(templateName)) {
    const redisConfig = generateRedisConfig();
    setup.databases.push(redisConfig);
    Object.assign(setup.envVariables, generateEnvVariables(redisConfig));
    setup.dockerServices.redis = generateDockerService(redisConfig);
  }

  // Add search engine if requested
  if (options.includeSearch) {
    const searchConfig = generateSearchConfig();
    setup.dockerServices.elasticsearch = generateSearchDockerService();
    setup.envVariables.ELASTICSEARCH_URL = "http://localhost:9200";
  }

  // Generate ORM configuration
  if (options.orm && setup.databases.length > 0) {
    setup.ormConfig = generateORMConfig(
      options.orm,
      setup.databases,
      sanitizedName
    );
  }

  // Generate volume configurations
  setup.volumes = generateVolumeConfigs(
    setup.databases,
    options.volumes || "preconfigured"
  );

  return setup;
}

/**
 * Get default databases for a template
 */
function getDefaultDatabases(templateName: string): string[] {
  const databaseMap: Record<string, string[]> = {
    "nextjs-app-router": ["postgresql"],
    "express-typescript": ["postgresql"],
    flask: ["postgresql"],
    fastapi: ["postgresql"],
    "flask-bun-hybrid": ["postgresql"],
    "bun-react-tailwind": [], // Frontend only
    "vite-vue-tailwind": [], // Frontend only
  };

  return databaseMap[templateName] || [];
}

/**
 * Check if template is a web application that might benefit from Redis
 */
function isWebApplication(templateName: string): boolean {
  const webTemplates = [
    "nextjs-app-router",
    "express-typescript",
    "flask",
    "fastapi",
    "flask-bun-hybrid",
  ];
  return webTemplates.includes(templateName);
}

/**
 * Generate database configuration
 */
function generateDatabaseConfig(
  projectName: string,
  dbType: "postgresql" | "mysql" | "sqlite" | "mongodb" | "elasticsearch"
): DatabaseConfig | null {
  switch (dbType) {
    case "postgresql":
      return {
        type: "postgresql",
        name: `${projectName}_db`,
        user: "postgres",
        password: "postgres",
        host: "localhost",
        port: 5432,
        url: `postgresql://postgres:postgres@localhost:5432/${projectName}_db`,
      };

    case "mysql":
      return {
        type: "mysql",
        name: `${projectName}_db`,
        user: "root",
        password: "mysql",
        host: "localhost",
        port: 3306,
        url: `mysql://root:mysql@localhost:3306/${projectName}_db`,
      };

    case "sqlite":
      return {
        type: "sqlite",
        name: `${projectName}.db`,
        url: `sqlite:./${projectName}.db`,
      };

    case "mongodb":
      return {
        type: "mongodb",
        name: `${projectName}_db`,
        host: "localhost",
        port: 27017,
        url: `mongodb://localhost:27017/${projectName}_db`,
      };

    case "elasticsearch":
      return {
        type: "elasticsearch",
        name: "search",
        host: "localhost",
        port: 9200,
        url: "http://localhost:9200",
      };

    default:
      return null;
  }
}

/**
 * Generate Redis configuration
 */
function generateRedisConfig(): DatabaseConfig {
  return {
    type: "redis",
    name: "redis",
    host: "localhost",
    port: 6379,
    url: "redis://localhost:6379",
  };
}

/**
 * Generate search configuration
 */
function generateSearchConfig(): any {
  return {
    type: "elasticsearch",
    name: "search",
    host: "localhost",
    port: 9200,
    url: "http://localhost:9200",
  };
}

/**
 * Generate environment variables for database
 */
function generateEnvVariables(config: DatabaseConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  switch (config.type) {
    case "postgresql":
      vars.DATABASE_URL = config.url!;
      vars.POSTGRES_DB = config.name;
      vars.POSTGRES_USER = config.user!;
      vars.POSTGRES_PASSWORD = config.password!;
      vars.POSTGRES_HOST = config.host!;
      vars.POSTGRES_PORT = config.port!.toString();
      break;

    case "mysql":
      vars.DATABASE_URL = config.url!;
      vars.MYSQL_DATABASE = config.name;
      vars.MYSQL_USER = config.user!;
      vars.MYSQL_PASSWORD = config.password!;
      vars.MYSQL_HOST = config.host!;
      vars.MYSQL_PORT = config.port!.toString();
      break;

    case "sqlite":
      vars.DATABASE_URL = config.url!;
      vars.SQLITE_DATABASE = config.name;
      break;

    case "mongodb":
      vars.DATABASE_URL = config.url!;
      vars.MONGODB_DATABASE = config.name;
      vars.MONGODB_HOST = config.host!;
      vars.MONGODB_PORT = config.port!.toString();
      break;

    case "redis":
      vars.REDIS_URL = config.url!;
      vars.REDIS_HOST = config.host!;
      vars.REDIS_PORT = config.port!.toString();
      break;
  }

  return vars;
}

/**
 * Generate Docker service configuration
 */
function generateDockerService(config: DatabaseConfig): any {
  switch (config.type) {
    case "postgresql":
      return {
        image: "postgres:15-alpine",
        environment: {
          POSTGRES_DB: config.name,
          POSTGRES_USER: config.user,
          POSTGRES_PASSWORD: config.password,
        },
        ports: [`${config.port}:${config.port}`],
        volumes: ["postgres_data:/var/lib/postgresql/data"],
        networks: ["app-network"],
        healthcheck: {
          test: ["CMD-SHELL", `pg_isready -U ${config.user} -d ${config.name}`],
          interval: "10s",
          timeout: "5s",
          retries: 5,
        },
      };

    case "mysql":
      return {
        image: "mysql:8.0",
        environment: {
          MYSQL_DATABASE: config.name,
          MYSQL_USER: config.user,
          MYSQL_PASSWORD: config.password,
          MYSQL_ROOT_PASSWORD: config.password,
        },
        ports: [`${config.port}:${config.port}`],
        volumes: ["mysql_data:/var/lib/mysql"],
        networks: ["app-network"],
        healthcheck: {
          test: ["CMD", "mysqladmin", "ping", "-h", "localhost"],
          interval: "10s",
          timeout: "5s",
          retries: 5,
        },
      };

    case "mongodb":
      return {
        image: "mongo:6.0",
        environment: {
          MONGO_INITDB_DATABASE: config.name,
        },
        ports: [`${config.port}:${config.port}`],
        volumes: ["mongodb_data:/data/db"],
        networks: ["app-network"],
        healthcheck: {
          test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"],
          interval: "10s",
          timeout: "5s",
          retries: 5,
        },
      };

    case "redis":
      return {
        image: "redis:7-alpine",
        ports: [`${config.port}:${config.port}`],
        volumes: ["redis_data:/data"],
        networks: ["app-network"],
        healthcheck: {
          test: ["CMD", "redis-cli", "ping"],
          interval: "10s",
          timeout: "5s",
          retries: 5,
        },
      };

    default:
      return {};
  }
}

/**
 * Generate search Docker service
 */
function generateSearchDockerService(): any {
  return {
    image: "elasticsearch:8.8.0",
    environment: {
      "discovery.type": "single-node",
      "xpack.security.enabled": "false",
      ES_JAVA_OPTS: "-Xms512m -Xmx512m",
    },
    ports: ["9200:9200"],
    volumes: ["elasticsearch_data:/usr/share/elasticsearch/data"],
    networks: ["app-network"],
    healthcheck: {
      test: [
        "CMD-SHELL",
        "curl -f http://localhost:9200/_cluster/health || exit 1",
      ],
      interval: "30s",
      timeout: "10s",
      retries: 5,
    },
  };
}

/**
 * Generate database initialization script
 */
function generateInitScript(config: DatabaseConfig): string | null {
  switch (config.type) {
    case "postgresql":
      return `-- PostgreSQL initialization script for ${config.name}
-- This file is automatically executed when the database starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create initial tables (customize as needed)
-- Example:
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   email VARCHAR(255) UNIQUE NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert seed data if needed
-- INSERT INTO users (email) VALUES ('admin@example.com');
`;

    case "mysql":
      return `-- MySQL initialization script for ${config.name}
-- This file is automatically executed when the database starts

-- Create initial tables (customize as needed)
-- Example:
-- CREATE TABLE users (
--   id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
--   email VARCHAR(255) UNIQUE NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert seed data if needed
-- INSERT INTO users (email) VALUES ('admin@example.com');
`;

    default:
      return null;
  }
}

/**
 * Generate ORM configuration
 */
function generateORMConfig(
  ormType: "prisma" | "drizzle" | "both",
  databases: DatabaseConfig[],
  projectName: string
): any {
  const config: any = {
    type: ormType,
    schemas: {},
    migrations: {},
    seeders: {},
  };

  for (const db of databases) {
    if (db.type === "redis" || db.type === "elasticsearch") continue;

    if (ormType === "prisma" || ormType === "both") {
      config.schemas[`prisma-${db.type}`] = generatePrismaSchema(
        db,
        projectName
      );
      config.migrations[`prisma-${db.type}`] = generatePrismaMigration(db);
      config.seeders[`prisma-${db.type}`] = generatePrismaSeeder(db);
    }

    if (ormType === "drizzle" || ormType === "both") {
      config.schemas[`drizzle-${db.type}`] = generateDrizzleSchema(
        db,
        projectName
      );
      config.migrations[`drizzle-${db.type}`] = generateDrizzleMigration(db);
      config.seeders[`drizzle-${db.type}`] = generateDrizzleSeeder(db);
    }
  }

  return config;
}

/**
 * Generate Prisma schema
 */
function generatePrismaSchema(db: DatabaseConfig, projectName: string): string {
  const provider =
    db.type === "postgresql"
      ? "postgresql"
      : db.type === "mysql"
        ? "mysql"
        : db.type === "sqlite"
          ? "sqlite"
          : "mongodb";

  return `// Prisma schema for ${db.type}
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

// Example models - customize as needed
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
`;
}

/**
 * Generate Drizzle schema
 */
function generateDrizzleSchema(
  db: DatabaseConfig,
  projectName: string
): string {
  const imports =
    db.type === "postgresql"
      ? `import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';`
      : db.type === "mysql"
        ? `import { mysqlTable, text, timestamp, boolean, varchar } from 'drizzle-orm/mysql-core';`
        : `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';`;

  const tableFunction =
    db.type === "postgresql"
      ? "pgTable"
      : db.type === "mysql"
        ? "mysqlTable"
        : "sqliteTable";

  const idType =
    db.type === "postgresql"
      ? `uuid('id').primaryKey().defaultRandom()`
      : db.type === "mysql"
        ? `varchar('id', { length: 36 }).primaryKey()`
        : `text('id').primaryKey()`;

  return `// Drizzle schema for ${db.type}
${imports}
import { relations } from 'drizzle-orm';

// Users table
export const users = ${tableFunction}('users', {
  id: ${idType},
  email: ${db.type === "sqlite" ? "text('email').notNull().unique()" : "text('email').notNull().unique()"},
  name: text('name'),
  createdAt: ${db.type === "sqlite" ? "integer('created_at', { mode: 'timestamp' }).notNull().default(sql\`CURRENT_TIMESTAMP\`)" : "timestamp('created_at').notNull().defaultNow()"},
  updatedAt: ${db.type === "sqlite" ? "integer('updated_at', { mode: 'timestamp' }).notNull().default(sql\`CURRENT_TIMESTAMP\`)" : "timestamp('updated_at').notNull().defaultNow()"},
});

// Posts table
export const posts = ${tableFunction}('posts', {
  id: ${idType},
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').notNull().default(false),
  authorId: ${db.type === "sqlite" ? "text('author_id').notNull()" : "text('author_id').notNull()"},
  createdAt: ${db.type === "sqlite" ? "integer('created_at', { mode: 'timestamp' }).notNull().default(sql\`CURRENT_TIMESTAMP\`)" : "timestamp('created_at').notNull().defaultNow()"},
  updatedAt: ${db.type === "sqlite" ? "integer('updated_at', { mode: 'timestamp' }).notNull().default(sql\`CURRENT_TIMESTAMP\`)" : "timestamp('updated_at').notNull().defaultNow()"},
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
`;
}

/**
 * Generate Prisma migration
 */
function generatePrismaMigration(db: DatabaseConfig): string {
  return `-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;
}

/**
 * Generate Drizzle migration
 */
function generateDrizzleMigration(db: DatabaseConfig): string {
  return `import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/${db.type === "postgresql" ? "node-postgres" : db.type === "mysql" ? "mysql2" : "better-sqlite3"}/migrator';
import { db } from '../config/database.js';

async function runMigrations() {
  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './drizzle/migrations' });
  
  console.log('Migrations completed!');
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
`;
}

/**
 * Generate Prisma seeder
 */
function generatePrismaSeeder(db: DatabaseConfig): string {
  return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started with Prisma',
        content: 'Prisma is a next-generation ORM for Node.js and TypeScript.',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'Building APIs with Express',
        content: 'Express.js is a minimal and flexible Node.js web application framework.',
        published: false,
        authorId: user2.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
}

/**
 * Generate Drizzle seeder
 */
function generateDrizzleSeeder(db: DatabaseConfig): string {
  return `import { db } from '../config/database.js';
import { users, posts } from '../schema/schema.js';

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const [user1] = await db.insert(users).values({
    email: 'alice@example.com',
    name: 'Alice Johnson',
  }).returning();

  const [user2] = await db.insert(users).values({
    email: 'bob@example.com',
    name: 'Bob Smith',
  }).returning();

  // Create sample posts
  await db.insert(posts).values([
    {
      title: 'Getting Started with Drizzle',
      content: 'Drizzle is a lightweight and performant TypeScript ORM.',
      published: true,
      authorId: user1.id,
    },
    {
      title: 'Building APIs with Express',
      content: 'Express.js is a minimal and flexible Node.js web application framework.',
      published: false,
      authorId: user2.id,
    },
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  });
`;
}

/**
 * Generate volume configurations
 */
function generateVolumeConfigs(
  databases: DatabaseConfig[],
  volumeType: "preconfigured" | "custom"
): Record<string, VolumeConfig> {
  const volumes: Record<string, VolumeConfig> = {};

  for (const db of databases) {
    switch (db.type) {
      case "postgresql":
        volumes.postgres_data = {
          type: "named",
          target: "/var/lib/postgresql/data",
          options:
            volumeType === "preconfigured"
              ? {
                  driver: "local",
                  driver_opts: {
                    type: "none",
                    o: "bind",
                    device: "./volumes/postgres",
                  },
                }
              : {},
        };
        break;

      case "mysql":
        volumes.mysql_data = {
          type: "named",
          target: "/var/lib/mysql",
          options:
            volumeType === "preconfigured"
              ? {
                  driver: "local",
                  driver_opts: {
                    type: "none",
                    o: "bind",
                    device: "./volumes/mysql",
                  },
                }
              : {},
        };
        break;

      case "mongodb":
        volumes.mongodb_data = {
          type: "named",
          target: "/data/db",
          options:
            volumeType === "preconfigured"
              ? {
                  driver: "local",
                  driver_opts: {
                    type: "none",
                    o: "bind",
                    device: "./volumes/mongodb",
                  },
                }
              : {},
        };
        break;

      case "redis":
        volumes.redis_data = {
          type: "named",
          target: "/data",
          options:
            volumeType === "preconfigured"
              ? {
                  driver: "local",
                  driver_opts: {
                    type: "none",
                    o: "bind",
                    device: "./volumes/redis",
                  },
                }
              : {},
        };
        break;
    }
  }

  // Add Elasticsearch volume if needed
  if (databases.some((db) => db.type === "elasticsearch")) {
    volumes.elasticsearch_data = {
      type: "named",
      target: "/usr/share/elasticsearch/data",
      options:
        volumeType === "preconfigured"
          ? {
              driver: "local",
              driver_opts: {
                type: "none",
                o: "bind",
                device: "./volumes/elasticsearch",
              },
            }
          : {},
    };
  }

  return volumes;
}

/**
 * Apply database configuration to project
 */
export async function applyDatabaseConfig(
  projectPath: string,
  setup: DatabaseSetup
): Promise<void> {
  try {
    // Update .env file
    await updateEnvFile(projectPath, setup.envVariables);

    // Update docker-compose.yml with volumes
    await updateDockerCompose(projectPath, setup.dockerServices, setup.volumes);

    // Create init scripts
    if (setup.initScripts && setup.initScripts.length > 0) {
      await createInitScripts(projectPath, setup.initScripts, setup.databases);
    }

    // Create ORM configuration
    if (setup.ormConfig) {
      await createORMFiles(projectPath, setup.ormConfig);
    }

    // Create volume directories
    await createVolumeDirectories(projectPath, setup.volumes);

    // Create database documentation
    await createDatabaseDocs(projectPath, setup);

    log.ok(
      `Database configuration applied with ${setup.databases.length} database(s)${setup.ormConfig ? ` and ${setup.ormConfig.type} ORM` : ""}`
    );
  } catch (error) {
    throw new Error(
      `Failed to apply database configuration: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Update .env file with database variables
 */
async function updateEnvFile(
  projectPath: string,
  envVars: Record<string, string>
): Promise<void> {
  const envPath = join(projectPath, ".env.example");

  try {
    let envContent = "";
    try {
      envContent = await fs.readFile(envPath, "utf-8");
    } catch {
      // File doesn't exist, start with empty content
    }

    // Add database section
    const dbSection = `
# Database Configuration (Auto-generated by Peezy CLI)
${Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}
`;

    // Append to existing content
    const updatedContent = envContent + dbSection;
    await fs.writeFile(envPath, updatedContent);

    // Also create .env file for development
    const devEnvPath = join(projectPath, ".env");
    await fs.writeFile(devEnvPath, updatedContent);
  } catch (error) {
    throw new Error(`Failed to update .env file: ${error}`);
  }
}

/**
 * Update docker-compose.yml with database services and volumes
 */
async function updateDockerCompose(
  projectPath: string,
  services: Record<string, any>,
  volumes: Record<string, VolumeConfig>
): Promise<void> {
  const composePath = join(projectPath, "docker-compose.yml");

  try {
    let composeContent = "";
    try {
      composeContent = await fs.readFile(composePath, "utf-8");
    } catch {
      // Create new docker-compose.yml
      composeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - app-network
    depends_on:
${Object.keys(services)
  .map((name) => `      - ${name}`)
  .join("\n")}

`;
    }

    // Add database services
    let servicesSection = "";
    const volumes: string[] = [];

    for (const [name, config] of Object.entries(services)) {
      servicesSection += `
  ${name}:
${Object.entries(config)
  .map(([key, value]) => {
    if (key === "environment" && typeof value === "object" && value !== null) {
      return `    ${key}:\n${Object.entries(value)
        .map(([envKey, envValue]) => `      ${envKey}: ${envValue}`)
        .join("\n")}`;
    } else if (Array.isArray(value)) {
      return `    ${key}:\n${value.map((item) => `      - ${item}`).join("\n")}`;
    } else if (typeof value === "object" && value !== null) {
      return `    ${key}:\n${Object.entries(value)
        .map(([subKey, subValue]) => `      ${subKey}: ${subValue}`)
        .join("\n")}`;
    } else {
      return `    ${key}: ${value}`;
    }
  })
  .join("\n")}
`;

      // Extract volume names
      if (config.volumes) {
        config.volumes.forEach((volume: string) => {
          const volumeName = volume.split(":")[0];
          if (!volumes.includes(volumeName)) {
            volumes.push(volumeName);
          }
        });
      }
    }

    // Add volumes section
    const volumesSection =
      volumes.length > 0
        ? `
volumes:
${volumes.map((volume) => `  ${volume}:`).join("\n")}
`
        : "";

    // Add networks section
    const networksSection = `
networks:
  app-network:
    driver: bridge
`;

    const finalContent =
      composeContent + servicesSection + volumesSection + networksSection;
    await fs.writeFile(composePath, finalContent);
  } catch (error) {
    throw new Error(`Failed to update docker-compose.yml: ${error}`);
  }
}

/**
 * Create database initialization scripts
 */
async function createInitScripts(
  projectPath: string,
  scripts: string[],
  databases: DatabaseConfig[]
): Promise<void> {
  const initDir = join(projectPath, "database", "init");

  try {
    await fs.mkdir(initDir, { recursive: true });

    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const database = databases[i];
      const extension =
        database.type === "postgresql"
          ? "sql"
          : database.type === "mysql"
            ? "sql"
            : "txt";
      const filename = `01-init-${database.type}.${extension}`;

      await fs.writeFile(join(initDir, filename), script);
    }
  } catch (error) {
    throw new Error(`Failed to create init scripts: ${error}`);
  }
}

/**
 * Create database documentation
 */
async function createDatabaseDocs(
  projectPath: string,
  setup: DatabaseSetup
): Promise<void> {
  const docsContent = `# Database Configuration

This project has been configured with the following databases:

${setup.databases
  .map(
    (db) => `
## ${db.type.toUpperCase()}

- **Name**: ${db.name}
- **Host**: ${db.host || "localhost"}
- **Port**: ${db.port || "N/A"}
- **Connection URL**: \`${db.url}\`

### Environment Variables
${Object.entries(generateEnvVariables(db))
  .map(([key, value]) => `- \`${key}\`: ${value}`)
  .join("\n")}
`
  )
  .join("\n")}

## Getting Started

1. **Start the databases**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

2. **Check database health**:
   \`\`\`bash
   docker-compose ps
   \`\`\`

3. **View database logs**:
   \`\`\`bash
   docker-compose logs [service-name]
   \`\`\`

4. **Connect to database**:
${setup.databases
  .map((db) => {
    switch (db.type) {
      case "postgresql":
        return `   - PostgreSQL: \`psql ${db.url}\``;
      case "mysql":
        return `   - MySQL: \`mysql -h ${db.host} -P ${db.port} -u ${db.user} -p ${db.name}\``;
      case "mongodb":
        return `   - MongoDB: \`mongo ${db.url}\``;
      case "redis":
        return `   - Redis: \`redis-cli -h ${db.host} -p ${db.port}\``;
      default:
        return "";
    }
  })
  .filter(Boolean)
  .join("\n")}

## Database Management

### Migrations
- Add your migration files to \`database/migrations/\`
- Run migrations with your ORM/framework of choice

### Backups
- PostgreSQL: \`pg_dump ${setup.databases.find((db) => db.type === "postgresql")?.url} > backup.sql\`
- MySQL: \`mysqldump -h host -u user -p database > backup.sql\`

### Monitoring
- Use \`docker-compose logs -f [service]\` to monitor database logs
- Check health status with \`docker-compose ps\`

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml if needed
2. **Permission issues**: Ensure Docker has proper permissions
3. **Data persistence**: Database data is stored in Docker volumes

### Reset Database
\`\`\`bash
docker-compose down -v  # This will delete all data!
docker-compose up -d
\`\`\`
`;

  try {
    await fs.writeFile(join(projectPath, "DATABASE.md"), docsContent);
  } catch (error) {
    throw new Error(`Failed to create database documentation: ${error}`);
  }
}

/**
 * Create ORM configuration files
 */
async function createORMFiles(
  projectPath: string,
  ormConfig: any
): Promise<void> {
  try {
    // Create Prisma files
    if (ormConfig.type === "prisma" || ormConfig.type === "both") {
      const prismaDir = join(projectPath, "prisma");
      await fs.mkdir(prismaDir, { recursive: true });

      // Create schema files
      for (const [name, schema] of Object.entries(ormConfig.schemas)) {
        if (name.startsWith("prisma-")) {
          await fs.writeFile(
            join(prismaDir, "schema.prisma"),
            schema as string
          );
        }
      }

      // Create migration files
      const migrationsDir = join(prismaDir, "migrations", "001_init");
      await fs.mkdir(migrationsDir, { recursive: true });

      for (const [name, migration] of Object.entries(ormConfig.migrations)) {
        if (name.startsWith("prisma-")) {
          await fs.writeFile(
            join(migrationsDir, "migration.sql"),
            migration as string
          );
        }
      }

      // Create seed files
      for (const [name, seeder] of Object.entries(ormConfig.seeders)) {
        if (name.startsWith("prisma-")) {
          await fs.writeFile(join(prismaDir, "seed.ts"), seeder as string);
        }
      }
    }

    // Create Drizzle files
    if (ormConfig.type === "drizzle" || ormConfig.type === "both") {
      const drizzleDir = join(projectPath, "drizzle");
      await fs.mkdir(drizzleDir, { recursive: true });

      const schemaDir = join(projectPath, "src", "schema");
      await fs.mkdir(schemaDir, { recursive: true });

      // Create schema files
      for (const [name, schema] of Object.entries(ormConfig.schemas)) {
        if (name.startsWith("drizzle-")) {
          await fs.writeFile(join(schemaDir, "schema.ts"), schema as string);
        }
      }

      // Create migration files
      const migrationsDir = join(drizzleDir, "migrations");
      await fs.mkdir(migrationsDir, { recursive: true });

      for (const [name, migration] of Object.entries(ormConfig.migrations)) {
        if (name.startsWith("drizzle-")) {
          await fs.writeFile(
            join(drizzleDir, "migrate.ts"),
            migration as string
          );
        }
      }

      // Create seed files
      for (const [name, seeder] of Object.entries(ormConfig.seeders)) {
        if (name.startsWith("drizzle-")) {
          await fs.writeFile(join(drizzleDir, "seed.ts"), seeder as string);
        }
      }

      // Create Drizzle config
      const drizzleConfig = `import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg', // Change to 'mysql2' or 'better-sqlite' as needed
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
`;
      await fs.writeFile(join(projectPath, "drizzle.config.ts"), drizzleConfig);
    }
  } catch (error) {
    throw new Error(`Failed to create ORM files: ${error}`);
  }
}

/**
 * Create volume directories
 */
async function createVolumeDirectories(
  projectPath: string,
  volumes: Record<string, VolumeConfig>
): Promise<void> {
  try {
    const volumesDir = join(projectPath, "volumes");
    await fs.mkdir(volumesDir, { recursive: true });

    for (const [name, config] of Object.entries(volumes)) {
      if (config.type === "named" && config.options?.driver_opts?.device) {
        const volumePath = join(projectPath, config.options.driver_opts.device);
        await fs.mkdir(volumePath, { recursive: true });

        // Create .gitkeep file to ensure directory is tracked
        await fs.writeFile(join(volumePath, ".gitkeep"), "");
      }
    }

    // Create volumes README
    const volumesReadme = `# Database Volumes

This directory contains persistent storage for database containers.

## Structure
- \`postgres/\` - PostgreSQL data files
- \`mysql/\` - MySQL data files  
- \`mongodb/\` - MongoDB data files
- \`redis/\` - Redis data files
- \`elasticsearch/\` - Elasticsearch data files

## Important Notes
- These directories are mounted as Docker volumes
- Data persists between container restarts
- Backup these directories for data recovery
- Add to .gitignore if containing sensitive data

## Backup Commands
\`\`\`bash
# PostgreSQL
docker-compose exec postgres pg_dump -U postgres database_name > backup.sql

# MySQL  
docker-compose exec mysql mysqldump -u root -p database_name > backup.sql

# MongoDB
docker-compose exec mongodb mongodump --out /backup

# Redis
docker-compose exec redis redis-cli BGSAVE
\`\`\`
`;

    await fs.writeFile(join(volumesDir, "README.md"), volumesReadme);
  } catch (error) {
    throw new Error(`Failed to create volume directories: ${error}`);
  }
}
