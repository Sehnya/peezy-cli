# Project Structure

## Root Directory

```
peezy-cli/
├── src/                    # TypeScript source code
├── templates/              # Project templates (embedded)
├── dist/                   # Compiled JavaScript output (gitignored)
├── bin/                    # CLI executable entry point
├── node_modules/           # Dependencies (gitignored)
├── .github/                # GitHub workflows and templates
├── .kiro/                  # Kiro IDE configuration
└── test-hybrid-app/        # Test project for development
```

## Source Code Organization (`src/`)

```
src/
├── index.ts                # Main CLI entry point with Commander setup
├── types.ts                # Shared TypeScript type definitions
├── registry.ts             # Template registry and validation
├── plugin.ts               # Plugin system interface
├── actions/                # Core CLI actions
│   ├── scaffold.ts         # Project scaffolding logic
│   ├── install.ts          # Dependency installation
│   └── git.ts              # Git repository initialization
├── commands/               # CLI command implementations
│   ├── doctor.ts           # Health checks and diagnostics
│   ├── env.ts              # Environment management
│   ├── readme-changelog.ts # Documentation generation
│   └── upgrade.ts          # Update and migration tools
├── utils/                  # Shared utilities
│   ├── logger.ts           # Structured logging
│   ├── fsx.ts              # File system extensions
│   └── version-check.ts    # Version validation
├── plugins/                # Plugin implementations
│   └── version-scrubbing/  # Version monitoring plugin
└── __tests__/              # Test files (co-located with source)
```

## Templates Directory (`templates/`)

Each template is a complete project structure:

```
templates/
├── bun-react-tailwind/     # Bun + React + Vite + Tailwind
├── vite-vue-tailwind/      # Vue + Vite + Tailwind
├── flask/                  # Python Flask API
├── fastapi/                # Python FastAPI
└── flask-bun-hybrid/       # Full-stack Flask + Bun frontend
```

## Key Architectural Patterns

### Command Structure

- **Main CLI**: `src/index.ts` with Commander.js setup
- **Commands**: Individual command files in `src/commands/`
- **Actions**: Reusable business logic in `src/actions/`

### Template System

- **Registry**: Central template registry in `src/registry.ts`
- **Scaffolding**: Template copying and processing in `src/actions/scaffold.ts`
- **Validation**: Template and project name validation

### Plugin Architecture

- **Interface**: Plugin contract defined in `src/plugin.ts`
- **Implementation**: Concrete plugins in `src/plugins/`
- **Configuration**: Plugin-specific config and services

### Testing Strategy

- **Co-location**: Tests alongside source code in `__tests__/` directories
- **Categories**: Unit tests, integration tests, and plugin-specific tests
- **Coverage**: Focus on core business logic and CLI workflows

## File Naming Conventions

- **TypeScript files**: kebab-case (e.g., `version-check.ts`)
- **Test files**: `*.test.ts` or in `__tests__/` directories
- **Templates**: kebab-case directory names matching registry keys
- **Commands**: Single word or kebab-case (e.g., `doctor.ts`, `readme-changelog.ts`)

## Import/Export Patterns

- **ES Modules**: Use `.js` extensions in imports for compiled output
- **Barrel exports**: Index files for clean imports where appropriate
- **Type imports**: Use `import type` for type-only imports
- **Default exports**: For main functionality, named exports for utilities
