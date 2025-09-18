# Technology Stack

## Core Technologies

- **Language**: TypeScript (ES2022 target)
- **Runtime**: Node.js 20.19.0+ (required for Vite 6)
- **Module System**: ES Modules (ESM)
- **CLI Framework**: Commander.js
- **Interactive Prompts**: prompts library
- **Testing**: Jest with ts-jest preset

## Build System

- **Compiler**: TypeScript compiler (tsc)
- **Target**: ES2022 with Bundler module resolution
- **Output**: `dist/` directory with source maps and declarations
- **Entry Point**: `bin/peezy.mjs` (compiled from `src/index.ts`)

## Package Management

Supports multiple package managers:

- **Bun** (recommended/default)
- **npm**
- **pnpm**
- **yarn**

## Common Commands

```bash
# Development
npm run build          # Compile TypeScript to dist/
npm run dev           # Run compiled JS with source maps
npm run clean         # Remove dist/ directory

# Testing
npm test              # Run Jest test suite
npm run test:watch    # Run tests in watch mode

# Local Development
npm run link:global   # Link CLI globally for testing
npm run unlink:global # Unlink global CLI

# Publishing
npm run prepublishOnly # Run tests + build before publish
npm run pack:test     # Dry run package creation
npm run publish:dry   # Dry run npm publish
```

## Project Structure Conventions

- **Source**: All TypeScript source in `src/`
- **Tests**: Co-located in `__tests__/` directories or `.test.ts` files
- **Templates**: Static project templates in `templates/`
- **Distribution**: Compiled output in `dist/` (gitignored)
- **Binary**: CLI entry point in `bin/`

## Code Style

- **Strict TypeScript**: All strict compiler options enabled
- **ES Modules**: Use `.js` extensions in imports for compiled output
- **Error Handling**: Graceful error handling with user-friendly messages
- **Logging**: Structured logging via custom logger utility
