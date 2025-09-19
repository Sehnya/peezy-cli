# Peezy AddFile Command 🔧

The `peezy addfile` command intelligently analyzes your existing project and suggests configuration files that can enhance your development experience. It provides an interactive interface to select and add files with smart dependency management.

## Overview

The addfile command:

- **Analyzes** your project structure and dependencies
- **Suggests** relevant configuration files based on your tech stack
- **Provides** interactive selection with spacebar
- **Automatically** updates package.json with new dependencies
- **Generates** framework-specific configurations

## Usage

### Basic Usage

```bash
peezy addfile
```

### With Options

```bash
# JSON output for programmatic use
peezy addfile --json

# Force overwrite existing files
peezy addfile --force

# Filter by category
peezy addfile --category "Code Quality"
```

### Aliases

```bash
peezy add-file    # Alternative command name
```

## How It Works

### 1. Project Analysis

The command analyzes your project to understand:

- **Framework**: Next.js, React, Vue, Express, etc.
- **Language**: TypeScript or JavaScript
- **Build Tools**: Vite, Webpack, etc.
- **Package Manager**: npm, yarn, pnpm, bun
- **Existing Files**: What's already configured

### 2. Smart Suggestions

Based on the analysis, it suggests relevant files:

- **TypeScript configs** for TS projects
- **ESLint configs** matching your framework
- **Docker files** for containerization
- **Testing configs** for your test framework
- **CI/CD workflows** for automation

### 3. Interactive Selection

- Use **spacebar** to select/deselect files
- See **descriptions** for each file
- Files are **grouped by category**
- **Enter** to confirm selection

### 4. Smart Installation

- **Creates files** with appropriate content
- **Updates package.json** with new dependencies
- **Adds scripts** for new tools
- **Shows next steps** for setup

## Supported File Types

### TypeScript Configuration

- `tsconfig.json` - Framework-specific TypeScript config
- `tsconfig.node.json` - Node.js specific config for Vite
- `next-env.d.ts` - Next.js environment types

### Code Quality

- `.eslintrc.json` - ESLint configuration matching your framework
- `.prettierrc` - Prettier code formatting rules

### Testing

- `vitest.config.ts` - Vitest configuration for React/Vue
- `jest.config.js` - Jest configuration for Node.js/Express
- `src/test/setup.ts` - Test environment setup

### Styling

- `postcss.config.js` - PostCSS configuration for Tailwind CSS

### Docker

- `Dockerfile` - Framework-optimized Docker configuration
- `.dockerignore` - Docker build optimization
- `nginx.conf` - Nginx config for React SPAs
- `docker-compose.yml` - Production orchestration
- `docker-compose.dev.yml` - Development environment

### Configuration

- `.env.example` - Environment variables template
- `.gitignore` - Framework-specific ignore patterns

### CI/CD

- `.github/workflows/ci.yml` - GitHub Actions workflow

## Framework Support

### Next.js Projects

- Next.js optimized TypeScript config
- Next.js ESLint rules
- Docker configuration with standalone output
- Environment variables for Next.js

### React + Vite Projects

- React + Vite TypeScript configuration
- React ESLint with hooks support
- Vitest testing setup
- Docker with Nginx for production

### Vue Projects

- Vue 3 TypeScript configuration
- Vue ESLint rules
- Vitest testing setup

### Express Projects

- Express TypeScript configuration
- Node.js ESLint rules
- Jest testing setup
- Express Docker configuration

### Python Projects

- Python-specific .gitignore
- Environment variable templates

## Examples

### Adding ESLint to a React Project

```bash
$ peezy addfile
› Analyzing project structure...
› Detected: react-vite project with typescript
› Found 6 files that can be added to your project:

? Select files to add (use spacebar to select, enter to confirm):
❯ ◯ .eslintrc.json - React ESLint configuration
  ◯ .prettierrc - Prettier code formatting configuration
  ◯ vitest.config.ts - Vitest testing configuration
  ◯ src/test/setup.ts - Test environment setup file
  ◯ .env.example - Environment variables template
  ◯ .gitignore - Git ignore patterns for Node.js projects

# Select .eslintrc.json with spacebar, then press Enter

✓ Added .eslintrc.json
✓ Updated package.json with new dependencies and scripts

🎯 Next Steps:
  1. Install new dependencies: npm install
  2. Run linting: npm run lint

💡 Tip: Run 'peezy doctor' to check your project health
```

### JSON Output for Automation

```bash
$ peezy addfile --json
{
  "ok": true,
  "data": {
    "availableFiles": [
      {
        "name": ".eslintrc.json",
        "description": "React ESLint configuration",
        "category": "Code Quality"
      },
      {
        "name": ".prettierrc",
        "description": "Prettier code formatting configuration",
        "category": "Code Quality"
      }
    ],
    "context": {
      "hasPackageJson": true,
      "hasTypeScript": true,
      "hasReact": true,
      "framework": "react-vite",
      "language": "typescript",
      "packageManager": "npm"
    }
  }
}
```

## Smart Features

### Dependency Management

- **Automatically adds** required dependencies to package.json
- **Uses latest versions** of packages
- **Adds scripts** for new tools (lint, test, format)
- **Alphabetically sorts** dependencies

### Framework Detection

- **Analyzes package.json** dependencies
- **Detects build tools** (Vite, Next.js, etc.)
- **Identifies testing frameworks** (Jest, Vitest)
- **Recognizes styling tools** (Tailwind CSS)

### Conflict Prevention

- **Skips existing files** to prevent overwrites
- **Checks for conflicts** between configurations
- **Validates requirements** before suggesting files
- **Provides force option** for intentional overwrites

### Context Awareness

- **Framework-specific configs** (Next.js vs React)
- **Language-specific patterns** (TypeScript vs JavaScript)
- **Tool-specific optimizations** (Vite vs Webpack)

## Integration with Other Commands

### Works with Doctor Command

```bash
peezy addfile          # Add missing files
peezy doctor           # Check project health
```

### Complements New Command

```bash
peezy new my-app       # Create new project
cd my-app
peezy addfile          # Add additional files later
```

### Supports Migration Workflow

```bash
peezy migrate          # Migrate to newer template
peezy addfile          # Add any missing files
```

## Best Practices

### Regular Health Checks

- Run `peezy addfile` periodically to see new recommendations
- Use `peezy doctor` to validate your project setup
- Keep configurations up to date

### Selective Addition

- Don't add everything at once
- Start with essential files (ESLint, TypeScript)
- Add Docker/CI files when ready for deployment

### Team Consistency

- Use `--json` output for team automation
- Document which files your team uses
- Include addfile in onboarding process

## Troubleshooting

### No Files Suggested

If no files are suggested:

- Check that you have a `package.json` file
- Ensure your project has recognizable dependencies
- Try running in a project directory

### Files Not Added

If files fail to add:

- Check file permissions in the directory
- Ensure you have write access
- Use `--force` to overwrite existing files

### Dependencies Not Updated

If package.json isn't updated:

- Ensure package.json is valid JSON
- Check file permissions
- Verify you're in the project root

## Command Options

| Option             | Description              | Example                             |
| ------------------ | ------------------------ | ----------------------------------- |
| `--json`           | Output in JSON format    | `peezy addfile --json`              |
| `--force`          | Overwrite existing files | `peezy addfile --force`             |
| `--category <cat>` | Filter by category       | `peezy addfile --category "Docker"` |

## Categories

- **TypeScript** - TypeScript configuration files
- **Code Quality** - ESLint, Prettier configurations
- **Testing** - Test framework configurations
- **Styling** - CSS and styling tool configs
- **Docker** - Containerization files
- **Configuration** - Environment and project configs
- **Git** - Version control configurations
- **CI/CD** - Continuous integration workflows

---

The `peezy addfile` command makes it easy to enhance existing projects with modern development tools and configurations, ensuring your project follows best practices and stays up to date with the latest standards.
