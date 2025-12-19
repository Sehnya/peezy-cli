# Peezy CLI

> Fast, offline-first project scaffolding with curated full-stack templates

A CLI tool for scaffolding modern applications with production-ready templates. All templates are embedded locally for instant, offline project creation.

[![npm version](https://badge.fury.io/js/peezy-cli.svg)](https://badge.fury.io/js/peezy-cli)
[![GitHub release](https://img.shields.io/github/release/Sehnya/peezy-cli.svg)](https://github.com/Sehnya/peezy-cli/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **10 Production-Ready Templates** - Full-stack, frontend, backend, and Python options
- **Zero Network Required** - All templates embedded, works completely offline
- **Interactive & Scriptable** - Smart prompts or `--json` for CI/CD automation
- **Deterministic Builds** - Lock files for reproducible project creation
- **Cross-Platform** - macOS, Linux, Windows with native binaries

## 🚀 Installation

### Quick Install (Recommended)

#### macOS & Linux

```bash
curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash
```

#### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.ps1 | iex
```

### Package Managers

```bash
# Homebrew (macOS/Linux)
brew tap Sehnya/peezy
brew install peezy

# Scoop (Windows)
scoop bucket add peezy https://github.com/Sehnya/peezy-scoop
scoop install peezy
```

### npm

```bash
npm install -g peezy-cli

# Or use without installing
npx peezy-cli new
```

### Verify Installation

```bash
peezy --version
peezy --help
```

## Quick Start

```bash
# Interactive mode - guided setup
peezy new

# Or specify template directly
peezy new nextjs-fullstack my-app
cd my-app
npm run dev
```

## 🎨 Available Templates

### Hero Templates (Full-Stack)

| Template | Description |
|----------|-------------|
| `nextjs-fullstack` | Next.js 14 + NextAuth.js + Drizzle ORM + PostgreSQL + Tailwind |
| `express-fullstack` | Express + React + Vite + TypeScript + Docker |
| `react-spa-advanced` | React + Vite + Zustand + React Router + Vitest |

### Frontend Templates

| Template | Description |
|----------|-------------|
| `nextjs-app-router` | Next.js 14 + App Router + TypeScript + Tailwind |
| `bun-react-tailwind` | Bun + React + Vite + Tailwind CSS |
| `vite-vue-tailwind` | Vue 3 + Vite + Tailwind CSS |

### Backend Templates

| Template | Description |
|----------|-------------|
| `express-typescript` | Express.js + TypeScript + REST API structure |
| `flask` | Python Flask with project structure |
| `fastapi` | Python FastAPI with async support |

### Hybrid

| Template | Description |
|----------|-------------|
| `flask-bun-hybrid` | Flask backend + Bun/React frontend |

## 📋 Commands

### Project Creation

```bash
# Interactive
peezy new

# Direct
peezy new <template> <project-name>

# With options
peezy new express-typescript my-api --databases postgresql --redis --orm drizzle
```

### Options

| Option | Description |
|--------|-------------|
| `-p, --pm <pm>` | Package manager: bun, npm, pnpm, yarn |
| `--no-install` | Skip dependency installation |
| `--no-git` | Skip git initialization |
| `--databases <list>` | Databases: postgresql, mysql, sqlite, mongodb |
| `--redis` | Include Redis configuration |
| `--orm <orm>` | ORM: prisma, drizzle, both |
| `--json` | Output JSON for scripting |

### Other Commands

```bash
# List templates
peezy list

# Health check
peezy doctor

# Environment validation
peezy env check
peezy env diff

# Reproduce from lock file
peezy reproduce my-project --lock-file peezy.lock.json

# Verify project integrity
peezy verify --project-path ./my-project

# Check for version updates
peezy check-versions
```

## Examples

### Full-Stack App with Database

```bash
peezy new nextjs-fullstack my-startup
cd my-startup

# Set up database
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

npm run db:generate
npm run db:migrate
npm run dev
```

### API with PostgreSQL and Redis

```bash
peezy new express-typescript my-api --databases postgresql --redis
cd my-api
docker-compose up -d
npm run dev
```

### CI/CD Integration

```bash
# JSON output for automation
peezy new nextjs-app-router app --json --no-install | jq '.data.project.path'

# Verify project integrity
peezy verify --project-path ./app --json
```

## Deterministic Builds

Every project includes `peezy.lock.json` with:
- Template name and version
- SHA256 checksums for all files
- Build options used
- Creation timestamp

```bash
# Share lock file with team
peezy new nextjs-app-router my-app
# Share my-app/peezy.lock.json

# Reproduce identical project
peezy reproduce team-project --lock-file peezy.lock.json
```

## Template Features

All templates include:
- TypeScript configuration (where applicable)
- Tailwind CSS (frontend templates)
- ESLint configuration
- `.env.example` files
- Docker support (full-stack templates)
- README with setup instructions
- `peezy.lock.json` for reproduction

## Requirements

- **Node.js 20.19.0+** (for npm installation)
- **Git** (optional, for repo initialization)
- **Python 3.10+** (for Python templates)
- **Docker** (optional, for database services)

## Development

```bash
git clone https://github.com/Sehnya/peezy-cli.git
cd peezy-cli
npm install
npm run build
npm run link:global
npm test
```

## Remote Templates

Peezy supports fetching templates from multiple sources:

### GitHub

```bash
# From a GitHub repo
peezy add github:owner/repo
peezy new github:owner/repo my-project

# Specific branch
peezy add github:owner/repo#develop

# Subdirectory in repo
peezy add github:owner/repo/templates/react
```

### npm

```bash
# From npm registry
peezy add npm:create-my-template
peezy new npm:create-my-template my-project

# Specific version
peezy add npm:create-my-template@1.2.0
```

### Template Registry

```bash
# From peezy registry (scoped packages)
peezy add @peezy/nextjs-enterprise
peezy new @peezy/nextjs-enterprise@1.0.0 my-project

# Search templates
peezy search react

# List remote templates
peezy list --remote
```

### Cache Management

```bash
# List cached templates
peezy cache list

# Clear cache
peezy cache clear
```

## Roadmap

Features in development:

- [ ] **Migration System** - Update existing projects to newer templates
- [ ] **Plugin System** - Extend scaffolding with custom hooks

## Security

Peezy CLI includes Sigstore integration for template signing and verification:

```bash
# Sign a template (opens browser for OIDC auth)
peezy sign ./my-template

# Create development signature (no auth required)
peezy sign ./my-template --dev

# Verify a template signature
peezy verify-template ./my-template

# Manage trusted signers
peezy trust list
peezy trust add user@example.com
peezy trust remove user@example.com

# Security audit
peezy audit
```

Signatures are recorded in the Rekor transparency log for production signing.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details.

## License

MIT © [Sehnya](https://github.com/Sehnya)

---

```bash
peezy new nextjs-fullstack my-next-project
```
