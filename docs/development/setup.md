# Development Setup

This guide helps you set up a local development environment for contributing to Peezy CLI.

## 🛠️ Prerequisites

- **Node.js 20.19.0 or higher** (required for Vite 6 and modern ESM support)
- **Git** for version control
- **npm** (comes with Node.js)

## 🚀 Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/Sehnya/peezy-cli.git
cd peezy-cli

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Link for local development
npm run link:global

# 5. Verify setup
peezy --version  # Should show current version
```

## 📋 Development Commands

### Building

```bash
npm run build          # Compile TypeScript to dist/
npm run clean          # Remove dist/ directory
npm run dev           # Run compiled JS with source maps
```

### Testing

```bash
npm test              # Run Jest test suite
npm run test:watch    # Run tests in watch mode
npm run lint          # TypeScript type checking
```

### Local Development

```bash
npm run link:global   # Link CLI globally for testing
npm run unlink:global # Unlink global CLI
```

### Distribution

```bash
npm run build:binaries    # Build cross-platform binaries
npm run test:distribution # Test distribution setup
npm run check            # Comprehensive validation checks
```

## 🏗️ Project Structure

```
peezy-cli/
├── src/                    # TypeScript source code
│   ├── commands/           # CLI command implementations
│   ├── actions/            # Reusable business logic
│   ├── services/           # Service classes
│   ├── utils/              # Utility functions
│   ├── security/           # Security-related code
│   ├── types.ts            # Type definitions
│   └── index.ts            # Main CLI entry point
├── templates/              # Project templates (embedded)
│   ├── nextjs-fullstack/   # Hero template
│   ├── express-fullstack/  # Hero template
│   ├── react-spa-advanced/ # Hero template
│   └── ...                 # Classic templates
├── scripts/                # Build and utility scripts
├── docs/                   # Documentation
├── .github/                # GitHub workflows and templates
└── dist/                   # Compiled output (gitignored)
```

## 🧪 Testing Your Changes

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/actions/__tests__/scaffold.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="JSON Output"
```

### Integration Testing

```bash
# Test CLI functionality
node dist/index.js --version
node dist/index.js list --json
node dist/index.js new nextjs-fullstack test-app --no-install --no-git

# Test template creation
peezy new nextjs-fullstack test-project
cd test-project && npm install && npm run build
```

### Comprehensive Checks

```bash
# Comprehensive checks before committing
npm run check

# This runs:
# - Version consistency checks
# - Template structure validation
# - Build system verification
# - Test suite execution
# - Documentation validation
```

## 🔧 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow existing code patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Changes

```bash
npm test                    # Run all tests
npm run build              # Build TypeScript
npm run check              # Run comprehensive checks
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Create PR on GitHub
```

## 🎯 Common Development Tasks

### Adding a New Template

1. Create template directory in `templates/`
2. Add template to `src/registry.ts`
3. Create template files with proper structure
4. Add tests for template functionality
5. Update documentation

### Adding a New Command

1. Create command file in `src/commands/`
2. Add command to `src/index.ts`
3. Add tests in `src/commands/__tests__/`
4. Update CLI reference documentation

### Debugging

```bash
# Enable debug logging
DEBUG=1 peezy new template-name project-name

# Or use the debug utility
PEEZY_DEBUG=1 peezy doctor
```

## 🔍 Troubleshooting

### Common Issues

#### "Command not found" after linking

```bash
# Rebuild and relink
npm run build
npm run unlink:global
npm run link:global
```

#### Tests failing

```bash
# Clean and rebuild
npm run clean
npm run build
npm test
```

#### TypeScript errors

```bash
# Check types without emitting
npm run lint

# Clean and rebuild
npm run clean
npm run build
```

## 📚 Additional Resources

- **[Contributing Guide](contributing.md)** - Detailed contribution guidelines
- **[Architecture Guide](architecture.md)** - System design and patterns
- **[Testing Guide](testing.md)** - Testing strategies and best practices
- **[Release Process](release-process.md)** - How releases are managed

---

Happy coding! 🚀
