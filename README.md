# Peezy CLI

> Initialize projects across runtimes — instantly

A cross-runtime terminal tool that scaffolds opinionated starter applications for JavaScript (Bun/Node), Python (Flask/FastAPI), and front-end frameworks (React/Vite, Vue/Vite), with deterministic builds and machine-consumable outputs.

## Features

### Core Capabilities

- **Zero-network scaffolding** — all templates embedded, works offline
- **Deterministic builds** — peezy.lock.json ensures bit-for-bit reproduction
- **Machine-consumable JSON output** — all commands support --json flag
- **File integrity verification** — SHA256 checksums for all generated files
- **Cross-runtime support** — Bun, Node.js, Python with automatic detection
- **Interactive prompts** — smart defaults with popular options highlighted

### Project Management

- **Project reproduction** — recreate identical projects from lock files
- **Template system** — local and remote templates with versioning
- **Environment management** — typed env workflows with validation
- **Health monitoring** — comprehensive project diagnostics
- **Version tracking** — security advisories and update notifications

### Developer Experience

- **Modern frameworks** — React, Vue, Next.js with Vite and Tailwind CSS
- **Automatic setup** — dependency installation and git initialization
- **Popular templates highlighted** for quick selection
- **Experimental plugin system** — extensible with custom hooks
- **Comprehensive documentation** — detailed guides and API reference

## Installation

```bash
# Install globally via npm
npm install -g peezy-cli

# Or use with npx (no installation required)
npx peezy-cli new

# Verify installation
peezy --version
```

## Usage

### Quick Start

```bash
# Interactive mode - prompts for all options
peezy new

# Direct template usage
peezy new bun-react-tailwind my-app

# With options
peezy new bun-react-tailwind my-app --pm npm --no-git
```

### Available Commands

#### Project Creation and Management

```bash
# List all available templates
peezy list [--json]

# List remote templates too
peezy list --remote [--json]

# Create new project (interactive)
peezy new [--json]

# Create with specific template
peezy new <template> <name> [options] [--json]

# Add remote templates to cache
peezy add @org/template@1.0.0 [--json]

# Manage template cache
peezy cache list [--json]
peezy cache clear [--json]
```

#### Deterministic Builds and Reproduction

```bash
# Reproduce project from lock file
peezy reproduce <name> --lock-file path/to/peezy.lock.json [--json]

# Verify project integrity against lock file
peezy verify --project-path ./my-project [--json]

# Reproduce with verification
peezy reproduce <name> --lock-file peezy.lock.json --verify [--json]
```

#### Environment and Project Health

```bash
# Comprehensive health checks
peezy doctor --ports 3000,5173,8000 --fix-lint --fix-env-examples [--json]

# Typed env management
peezy env check [--json]
peezy env diff [--json]
peezy env generate [--json]            # generate .env.example from schema JSON
peezy env pull:railway [--json]        # stubbed
peezy env push:railway [--json]        # stubbed
```

#### Documentation and Maintenance

```bash
# README/CHANGELOG generator
peezy readme --name MyProject --changelog [--json]

# Check for updates
peezy upgrade --dry-run [--json]

# Version & security report
peezy check-versions --format console [--json]
peezy check-versions --format json --technologies node,bun,react --security-only [--json]
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

## Available Templates

### Local Templates (Embedded)

#### Frontend Templates

- **nextjs-app-router** - Next.js 14 + App Router + TypeScript + Tailwind
- **bun-react-tailwind** - Bun + React + Vite + Tailwind CSS
- **vite-vue-tailwind** - Vue + Vite + Tailwind CSS

#### Backend Templates

- **express-typescript** - Express.js + TypeScript + REST API
- **flask** - Python Flask API/App
- **fastapi** - Python FastAPI with modern features

#### Full-Stack Templates

- **flask-bun-hybrid** - Flask backend + Bun frontend

All templates are marked with popularity indicators and include comprehensive peezy.lock.json files for deterministic reproduction.

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

## Examples

### Basic Project Creation

```bash
# Create a Next.js app with deterministic build
peezy new nextjs-app-router my-next-app

# Create a React app with Bun
peezy new bun-react-tailwind my-react-app

# Create a Flask API (Python dependencies installed manually)
peezy new flask my-api --no-install
cd my-api && python -m pip install -r requirements.txt

# Create a Vue app with npm
peezy new vite-vue-tailwind my-vue-app --pm npm

# Interactive mode (recommended for first-time users)
peezy new
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

## License

MIT © [Sehnya](https://github.com/Sehnya)

## Changelog

### 0.1.4 (Latest)

**Major Features:**

- **Deterministic builds** - Complete peezy.lock.json system with SHA256 checksums
- **Machine-consumable JSON output** - All commands support --json flag with standardized format
- **Project reproduction** - peezy reproduce command for identical project recreation
- **File integrity verification** - peezy verify command with comprehensive checksum validation
- **Interactive prompt suppression** - Clean JSON mode for automation and CI/CD

**New Commands:**

- `peezy reproduce` - Recreate projects from lock files
- `peezy verify` - Validate project integrity against lock files
- `peezy cache` - Manage template cache with JSON output

**Enhanced Commands:**

- All existing commands now support --json flag
- Improved error handling with structured responses
- Enhanced template system with source tracking
- Better cross-platform compatibility

**Templates:**

- Added Next.js 14 with App Router template
- Added Express.js + TypeScript template
- Enhanced all templates with lock file generation
- Improved template metadata and versioning

### 0.1.2

- Add check-versions command with security advisory mode
- Add doctor command with ports/env/ts checks and options
- Add README/CHANGELOG generator command
- Introduce experimental plugin system (peezy.config.\*)
- Improve interactive prompts and template highlighting

### 0.1.0

- Initial release
- Support for 5 project templates
- Interactive CLI with popular template highlighting
- Automatic dependency installation and git initialization
- Cross-platform compatibility
