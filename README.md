# Peezy CLI

> The future of project scaffolding — production-ready, secure, and intelligent

A next-generation CLI that transforms how developers create, maintain, and distribute modern applications. From curated full-stack templates to intelligent project migrations, Peezy CLI delivers enterprise-grade tooling with developer-first experience.

[![npm version](https://badge.fury.io/js/peezy-cli.svg)](https://badge.fury.io/js/peezy-cli)
[![GitHub release](https://img.shields.io/github/release/Sehnya/peezy-cli.svg)](https://github.com/Sehnya/peezy-cli/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ What's New in v1.0.0

### 🚀 Hero Experiences: Curated Full-Stack Templates

Production-ready templates that save hours of setup:

- **`nextjs-fullstack`** - Complete Next.js app with auth, database, and modern UI
- **`express-fullstack`** - Express + React full-stack with shared authentication
- **`react-spa-advanced`** - Modern React SPA with state management and testing

### 🔄 Migration System: Safe Project Updates

Intelligent project migration with conflict resolution:

- **Template diffing** - Compare your project with newer templates
- **Interactive conflicts** - Choose how to handle customized files
- **Automatic backups** - Never lose your work during updates
- **Preview mode** - See changes before applying them

### 📦 Multi-Platform Distribution

Install anywhere, instantly:

- **Homebrew** (macOS/Linux) - `brew install Sehnya/peezy/peezy`
- **Scoop** (Windows) - `scoop install peezy`
- **Universal installer** - `curl -fsSL https://get.peezy.dev | bash`
- **Standalone binaries** - No Node.js required

### 🔐 Production Security with Sigstore

Enterprise-grade security framework ready for production:

- **Security framework** - Complete trust and verification system
- **Template verification** - All templates verified before use
- **Trust policies** - Configure security requirements for your team
- **Audit system** - Comprehensive security reporting
- **Sigstore ready** - Full keyless signing in v1.0.1 (currently using development signatures)

## 🎯 Core Features

### Developer Experience

- **Zero-network scaffolding** — All templates embedded, works offline
- **Interactive prompts** — Smart defaults with enhanced guidance
- **JSON output** — Machine-consumable for automation and CI/CD
- **Cross-platform** — macOS, Linux, Windows with native binaries

### Project Management

- **Deterministic builds** — Reproducible projects with lock files
- **File integrity** — SHA256 verification for all generated files
- **Template system** — Local and remote templates with versioning
- **Health monitoring** — Comprehensive project diagnostics

### Enterprise Ready

- **Security first** — Sigstore integration with transparency logs
- **Migration system** — Safe updates with intelligent conflict resolution
- **Multi-platform** — Native binaries for all major platforms
- **Automation friendly** — Complete JSON API for CI/CD integration

## 🚀 Installation

### Recommended: Native Binaries (No Node.js Required)

#### macOS & Linux (Homebrew)

```bash
brew tap Sehnya/peezy
brew install peezy
```

#### Windows (Scoop)

```bash
scoop bucket add peezy https://github.com/Sehnya/peezy-scoop
scoop install peezy
```

#### Universal Installer

```bash
curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash
```

### Alternative: npm

```bash
# Install globally via npm
npm install -g peezy-cli

# Or use with npx (no installation required)
npx peezy-cli new
```

### Verify Installation

```bash
peezy --version  # Should show 1.0.0
peezy --help     # See all available commands
```

## 🎯 Quick Start

### Hero Templates (Recommended)

```bash
# Complete Next.js full-stack app
peezy new nextjs-fullstack my-startup

# Express + React full-stack
peezy new express-fullstack my-api

# Advanced React SPA
peezy new react-spa-advanced my-dashboard
```

### Interactive Mode

```bash
# Guided setup with smart recommendations
peezy new
```

### Classic Templates

```bash
# Direct template usage
peezy new bun-react-tailwind my-app

# With options
peezy new express-typescript my-api --databases postgresql --redis
```

## 📋 Commands

### 🚀 Project Creation

```bash
# Interactive project creation
peezy new

# Hero templates (recommended)
peezy new nextjs-fullstack my-app
peezy new express-fullstack my-api
peezy new react-spa-advanced my-spa

# List all templates
peezy list [--remote] [--json]

# Add remote templates
peezy add @org/template@1.0.0
```

### 🔄 Project Migration

```bash
# Preview migration changes
peezy migrate --dry-run --template nextjs-fullstack

# Interactive migration with conflict resolution
peezy migrate --interactive --template nextjs-fullstack

# Safe migration with backup
peezy migrate --template nextjs-fullstack --backup
```

### 🔐 Security & Verification

```bash
# Verify template signatures
peezy verify-template nextjs-fullstack

# Security audit of project
peezy audit [--json]

# Manage trusted signers
peezy trust list
peezy trust add developer@company.com
```

### 🔧 Project Management

```bash
# Reproduce project from lock file
peezy reproduce <name> --lock-file peezy.lock.json

# Verify project integrity
peezy verify --project-path ./my-project

# Comprehensive health checks
peezy doctor [--fix-lint] [--fix-env-examples]

# Environment management
peezy env check
peezy env diff
peezy env generate
```

### 📊 Monitoring & Updates

```bash
# Check for updates
peezy upgrade --dry-run

# Version & security monitoring
peezy check-versions [--security-only]

# Generate documentation
peezy readme --changelog
```

### 🗂️ Template Management

```bash
# Manage template cache
peezy cache list
peezy cache clear

# Add remote templates
peezy add @org/template@version
```

#### JSON Output

All commands support the `--json` flag for machine-consumable output with consistent format:

```json
{
  "ok": true,
  "data": {
    /* command-specific data */
  },
  "warnings": ["optional warnings"],
  "errors": ["optional errors"],
  "version": "0.1.4"
}
```

### Options

- `-p, --pm <pm>` - Package manager (bun|npm|pnpm|yarn)
- `--no-install` - Skip dependency installation
- `--no-git` - Skip git initialization
- `--databases <list>` - Comma-separated databases (postgresql,mysql,sqlite,mongodb)
- `--redis` - Include Redis for caching/sessions
- `--search` - Include Elasticsearch for search functionality
- `--orm <orm>` - ORM to configure (prisma|drizzle|both)
- `--volumes <type>` - Volume configuration (preconfigured|custom)

## 🎨 Available Templates

### 🚀 Hero Templates (Curated Full-Stack)

#### `nextjs-fullstack` - The Complete Package

- **Next.js 14** with App Router and TypeScript
- **Authentication** with NextAuth.js and multiple providers
- **Database** with PostgreSQL and Drizzle ORM
- **Modern UI** with Tailwind CSS and Headless UI
- **Production-ready** with proper error handling and security

#### `express-fullstack` - Full-Stack Powerhouse

- **Express.js backend** with TypeScript and REST API
- **React frontend** with Vite and modern tooling
- **Shared authentication** with JWT tokens
- **Database integration** with Drizzle ORM
- **Concurrent development** setup for seamless workflow

#### `react-spa-advanced` - Modern React Excellence

- **Advanced React SPA** with all modern features
- **State management** with Zustand
- **Data fetching** with TanStack Query
- **Routing** with React Router v6
- **Testing** with Vitest and Testing Library
- **Animations** with Framer Motion

### 📦 Classic Templates

#### Frontend

- **nextjs-app-router** - Next.js 14 + App Router + TypeScript + Tailwind
- **bun-react-tailwind** - Bun + React + Vite + Tailwind CSS
- **vite-vue-tailwind** - Vue + Vite + Tailwind CSS

#### Backend

- **express-typescript** - Express.js + TypeScript + REST API
- **flask** - Python Flask API/App
- **fastapi** - Python FastAPI with modern features

#### Full-Stack

- **flask-bun-hybrid** - Flask backend + Bun frontend

### Remote Templates

Remote templates are fetched from registries and cached locally. They support versioning and scoped naming.

```bash
# Add and use remote templates
peezy add @peezy/nextjs-prisma@2.1.0
peezy new @peezy/nextjs-prisma my-app

# List all available remote templates
peezy list --remote

# Manage template cache
peezy cache list
peezy cache clear
```

See [REMOTE_TEMPLATES.md](./REMOTE_TEMPLATES.md) for detailed documentation.

## 💡 Examples

### Hero Template Workflows

```bash
# Complete startup stack in minutes
peezy new nextjs-fullstack my-startup
cd my-startup
npm run dev  # Full-stack app with auth and database ready

# API + Dashboard combo
peezy new express-fullstack my-platform
cd my-platform
npm run dev  # Concurrent backend + frontend development

# Modern SPA with all features
peezy new react-spa-advanced my-dashboard
cd my-dashboard
npm run dev  # Advanced React app with testing and state management
```

### Migration Workflows

```bash
# Safely update existing projects
peezy migrate --dry-run --template nextjs-fullstack
peezy migrate --interactive --template nextjs-fullstack

# Preview changes before applying
peezy migrate --dry-run --template react-spa-advanced
```

### Security Workflows

```bash
# Verify templates before use
peezy verify-template nextjs-fullstack

# Audit project security
peezy audit

# Configure team trust policy
peezy trust add your-team@company.com
```

### Database Integration

```bash
# Create Express API with PostgreSQL and Redis
peezy new express-typescript my-api --databases postgresql --redis

# Create full-stack app with Prisma ORM
peezy new nextjs-app-router my-fullstack --databases postgresql --orm prisma

# Create API with both Prisma and Drizzle ORMs
peezy new express-typescript my-api --databases postgresql --orm both

# Create Flask app with MongoDB and preconfigured volumes
peezy new flask my-python-api --databases mongodb --redis --volumes preconfigured

# Create a Flask API (Python dependencies installed manually)
peezy new flask my-api --no-install
cd my-api && python -m pip install -r requirements.txt

# All database services configured with Docker Compose and volumes
cd my-api && docker-compose up -d
```

### Deterministic Workflows

```bash
# Create project and share lock file
peezy new nextjs-app-router my-app
cp my-app/peezy.lock.json ./project-template.lock.json

# Team member reproduces identical project
peezy reproduce team-project --lock-file project-template.lock.json

# Verify project integrity
peezy verify --project-path team-project

# Automation-friendly JSON output
peezy new bun-react-tailwind my-project --json | jq '.data.project.path'
peezy list --json | jq '.data.templates[].name'
```

### CI/CD Integration

```bash
# Create project in CI pipeline
peezy new nextjs-app-router app --json --no-install

# Verify project integrity in CI
peezy verify --project-path app --json

# Check for security issues
peezy check-versions --security-only --json
```

## Environment Management

Peezy includes a simple typed env workflow:

- `peezy env check` — validates .env against .env.example
- `peezy env diff` — shows missing/extra keys
- `peezy env generate --schema schema.json` — creates .env.example from a JSON schema:

Example schema.json:

```json
{
  "required": ["DATABASE_URL", "JWT_SECRET"],
  "optional": ["PORT", "NODE_ENV"]
}
```

## Version Monitoring & Security

Use `peezy check-versions` to see latest versions or security advisories.

Examples:

```bash
peezy check-versions --format console
peezy check-versions --format markdown
peezy check-versions --format json --technologies node,react,vue
peezy check-versions --security-only
```

## Doctor Command

`peezy doctor` checks your environment and project for common pitfalls:

- Node/Bun/Python presence and versions
- .env vs .env.example parity
- TypeScript typecheck (if tsconfig.json exists)
- Port availability (defaults: 3000, 5173, 8000)

Options:

- `--ports 3000,5173,8000`
- `--fix-lint` — attempt lint autofix via npm script
- `--fix-env-examples` — create minimal .env.example if missing

## Plugin System (experimental)

Add a `peezy.config.js` to extend prompts or run hooks after scaffold:

```js
// peezy.config.js
/** @type {import('peezy-cli').PeezyConfig} */
export default {
  plugins: [
    {
      name: "example-plugin",
      extendPrompts(questions) {
        return [
          ...questions,
          {
            type: "toggle",
            name: "ci",
            message: "Add CI config?",
            initial: true,
          },
        ];
      },
      async onAfterScaffold({ projectPath, options }) {
        // e.g., write CI files based on options.ci
      },
    },
  ],
};
```

Note: Plugin support is experimental and API may change.

## Database Integration

### Automatic Database Setup

Peezy CLI automatically generates production-ready database configurations with Docker Compose services, environment variables, and initialization scripts.

#### Supported Databases

- **PostgreSQL** - Production-ready with connection pooling and health checks
- **MySQL** - Optimized configuration with UTF8MB4 support
- **SQLite** - Lightweight option for development and small applications
- **MongoDB** - Document database with replica set support
- **Redis** - Caching and session storage with persistence
- **Elasticsearch** - Full-text search and analytics

#### ORM Integration

- **Prisma** - Type-safe database client with migrations and introspection
- **Drizzle** - Lightweight TypeScript ORM with SQL-like syntax
- **Both** - Configure both ORMs for flexibility and comparison

#### Volume Management

- **Preconfigured volumes** - Ready-to-use bind mounts in ./volumes directory
- **Custom volumes** - Named Docker volumes for production deployments
- **Persistent storage** - Data survives container restarts and rebuilds

#### Generated Files

- **Environment variables** - Automatically populated .env files
- **Docker Compose services** - Production-ready containers with health checks
- **Database initialization scripts** - SQL scripts for schema setup
- **Connection configuration** - Database clients and connection pooling
- **Documentation** - Complete setup and troubleshooting guides

#### Example Usage

```bash
# Create API with PostgreSQL and Redis
peezy new express-typescript my-api --databases postgresql --redis

# Generated files include:
# - .env with DATABASE_URL and REDIS_URL
# - docker-compose.yml with postgres and redis services
# - database/init/01-init-postgresql.sql
# - src/config/database.ts with connection setup
# - DATABASE.md with complete documentation

# Start all services
cd my-api
docker-compose up -d
npm run dev
```

## Deterministic Builds

### peezy.lock.json

Every scaffolded project includes a comprehensive lock file with:

- **Template metadata** - exact name, version, and source information
- **File checksums** - SHA256 hashes for all generated files
- **Build options** - CLI flags and interactive prompt answers
- **Creation timestamp** - when the project was created
- **Schema validation** - JSON schema for lock file format

### Project Reproduction

```bash
# Original project creation
peezy new nextjs-app-router my-app

# Reproduce identical project anywhere
peezy reproduce my-app-copy --lock-file my-app/peezy.lock.json

# Verify integrity (detects any modifications)
peezy verify --project-path my-app-copy
```

### File Integrity Verification

- Automatic checksum generation for all project files
- Excludes build artifacts and dependencies (node_modules, dist, etc.)
- Detects missing, modified, or extra files
- Supports checksum updates for legitimate changes

## Template Features

All templates include:

- **README with setup instructions** and project-specific documentation
- **Pre-configured build tools** optimized for each framework
- **Tailwind CSS integration** (frontend templates) with custom configurations
- **Environment variable support** with .env.example files
- **Package manager integration** supporting Bun, npm, pnpm, and yarn
- **Git initialization** with appropriate .gitignore files
- **Development server setup** with hot reload and modern tooling
- **peezy.lock.json** for deterministic reproduction
- **TypeScript configuration** where applicable

## Requirements

- **Node.js 20.19.0 or higher** (required for Vite 6 and modern ESM support)
- **Git** (optional, for repository initialization and version control)
- **Python 3.10+** (for Python templates, 3.8-3.9 are EOL)
- **Bun** (optional, for Bun-specific templates and faster package management)

### Supported Package Managers

- **Bun** (recommended for speed and modern features)
- **npm** (Node.js default, widely supported)
- **pnpm** (efficient disk usage and fast installs)
- **yarn** (classic and berry versions supported)

### Platform Support

- **macOS** (Intel and Apple Silicon)
- **Linux** (Ubuntu, Debian, CentOS, Alpine)
- **Windows** (native and WSL2)

All platforms support the full feature set including deterministic builds and JSON output.

## Development

```bash
# Clone the repository
git clone https://github.com/Sehnya/peezy-cli.git
cd peezy-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm run link:global

# Run tests
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- **[Hero Features Guide](HERO_FEATURES_README.md)** - Comprehensive guide to v1.0.0 features
- **[Migration Guide](MIGRATION_GUIDE.md)** - How to migrate existing projects
- **[Security Guide](SECURITY_GUIDE.md)** - Security features and best practices
- **[API Reference](API_REFERENCE.md)** - Complete CLI command reference

## 🔗 Links

- **[GitHub Repository](https://github.com/Sehnya/peezy-cli)**
- **[npm Package](https://www.npmjs.com/package/peezy-cli)**
- **[Release Notes](https://github.com/Sehnya/peezy-cli/releases)**
- **[Issue Tracker](https://github.com/Sehnya/peezy-cli/issues)**

## 📄 License

MIT © [Sehnya](https://github.com/Sehnya)

---

**Ready to build the future?** Get started with a hero template:

```bash
peezy new nextjs-fullstack my-next-big-thing
```

## 📈 Changelog

### 1.0.0 - Hero Features Release 🚀

**🌟 Major Features:**

- **🚀 Hero Experiences** - 3 curated full-stack templates (`nextjs-fullstack`, `express-fullstack`, `react-spa-advanced`)
- **🔄 Migration System** - Safe project updates with intelligent diffing and conflict resolution
- **📦 Multi-Platform Distribution** - Native binaries for macOS, Linux, Windows with Homebrew/Scoop support
- **🔐 Production Security** - Sigstore integration with keyless signing and transparency logs

**🆕 New Commands:**

- `peezy migrate` - Intelligent project migration with conflict resolution
- `peezy verify-template` - Verify template signatures with Sigstore
- `peezy trust` - Manage trusted signers and security policies
- `peezy audit` - Comprehensive security audit system

**✨ Enhanced Features:**

- **Hero template registry** with rich metadata and descriptions
- **Enhanced CLI interface** with better prompts and guidance
- **Cross-platform binaries** with automated release pipeline
- **Security-first approach** with automatic template verification

**🔧 Technical Improvements:**

- **Template diffing system** for intelligent migrations
- **Sigstore integration** for production-grade security
- **Multi-platform build system** with automated distribution
- **Enhanced error handling** with actionable suggestions

### Previous Versions

- **0.1.5** - Prisma/Drizzle ORM integration, volume management
- **0.1.4** - Deterministic builds, JSON output, project reproduction
- **0.1.2** - Version monitoring, doctor command, plugin system
- **0.1.0** - Initial release with 5 templates and interactive CLI
