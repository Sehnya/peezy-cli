# Peezy CLI v0.1.4 Release Notes

## 🚀 Major Release: Deterministic Builds & Machine-Consumable Outputs

This release introduces groundbreaking features that make Peezy CLI production-ready for enterprise workflows, CI/CD pipelines, and team collaboration.

## 🎯 Key Features

### ✨ Deterministic Project Reproduction

- **peezy.lock.json system** - Every project includes comprehensive metadata for bit-for-bit reproduction
- **SHA256 file integrity** - All generated files are checksummed for verification
- **Template source tracking** - Exact template name, version, and source information
- **Build option preservation** - CLI flags and interactive answers captured

### 🤖 Machine-Consumable JSON Output

- **Standardized format** - All commands support `--json` with consistent `{ ok, data, warnings, errors, version }` structure
- **Clean automation** - No non-JSON output when `--json` flag is used
- **Error handling** - Structured error responses for reliable automation
- **CI/CD ready** - Perfect for automated workflows and pipelines

### 🔄 Project Reproduction Commands

- **`peezy reproduce`** - Recreate identical projects from lock files
- **`peezy verify`** - Validate project integrity against lock files
- **Cross-platform** - Works identically across different machines and environments

## 📋 New Commands & Features

### New Commands

```bash
# Reproduce project from lock file
peezy reproduce <name> --lock-file path/to/peezy.lock.json [--json]

# Verify project integrity
peezy verify --project-path ./project [--json]
```

### Enhanced Commands

All existing commands now support `--json` flag:

- `peezy list --json`
- `peezy new <template> <name> --json`
- `peezy doctor --json`
- `peezy env <command> --json`
- `peezy readme --json`
- `peezy upgrade --json`
- `peezy add <template> --json`
- `peezy cache <action> --json`
- `peezy check-versions --json`

## 🏗️ New Templates

### Added Templates

- **nextjs-app-router** - Next.js 14 + App Router + TypeScript + Tailwind
- **express-typescript** - Express.js + TypeScript + REST API

### Enhanced Templates

All templates now include:

- Comprehensive `peezy.lock.json` files
- File integrity checksums
- Enhanced metadata and documentation

## 🔧 Technical Improvements

### Lock File System

```json
{
  "$schema": "https://peezy.dev/schemas/peezy.lock.schema.json",
  "peezyVersion": "0.1.4",
  "formatVersion": 1,
  "project": {
    "name": "my-app",
    "createdAt": "2025-09-07T03:01:13.596Z"
  },
  "template": {
    "name": "nextjs-app-router",
    "version": "latest",
    "source": {
      "type": "local",
      "path": "/templates/nextjs-app-router"
    },
    "engine": "dir"
  },
  "options": {
    "flags": {
      "installDeps": true,
      "initGit": true
    },
    "answers": {}
  },
  "checksums": {
    "files": {
      "package.json": "sha256-...",
      "app/page.tsx": "sha256-..."
    }
  }
}
```

### JSON Output Format

```json
{
  "ok": true,
  "data": {
    "project": {
      "name": "my-app",
      "path": "/path/to/my-app",
      "template": {
        "name": "nextjs-app-router",
        "isRemote": false
      }
    }
  },
  "warnings": [],
  "version": "0.1.4"
}
```

## 🎯 Use Cases

### Team Collaboration

```bash
# Developer A creates project
peezy new nextjs-app-router my-app

# Share lock file with team
cp my-app/peezy.lock.json ./project-template.lock.json

# Developer B reproduces identical project
peezy reproduce my-app-copy --lock-file project-template.lock.json

# Verify integrity
peezy verify --project-path my-app-copy
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Create project
  run: peezy new nextjs-app-router app --json --no-install

- name: Verify integrity
  run: peezy verify --project-path app --json

- name: Check for security issues
  run: peezy check-versions --security-only --json
```

### Automation Scripts

```bash
# Get available templates programmatically
peezy list --json | jq '.data.templates[].name'

# Create project and capture metadata
PROJECT_PATH=$(peezy new react my-project --json | jq -r '.data.project.path')

# Check environment status
peezy env check --json | jq '.data.valid'
```

## 🧪 Quality Assurance

### Testing

- **148 tests passing** - Comprehensive test coverage
- **Integration tests** - Real CLI command testing
- **Cross-platform testing** - macOS, Linux, Windows compatibility
- **JSON output validation** - Ensures clean machine-consumable output

### Performance

- **Instant scaffolding** - Zero-network operation with embedded templates
- **Fast checksums** - Efficient SHA256 computation
- **Minimal overhead** - Lock file generation adds <100ms to project creation

## 🔄 Migration Guide

### From v0.1.3 to v0.1.4

- **No breaking changes** - All existing commands work identically
- **New features** - Lock files automatically created for new projects
- **JSON support** - Add `--json` flag to any command for structured output
- **Verification** - Use `peezy verify` to check existing projects

### Upgrading

```bash
# Update globally
npm update -g peezy-cli

# Verify new version
peezy --version  # Should show 0.1.4

# Test new features
peezy list --json
peezy new nextjs-app-router test-app --json
```

## 🚀 What's Next

### Planned Features (v0.1.5+)

- Remote template registry integration
- Advanced plugin ecosystem
- Environment provider integrations (Railway, Vercel, AWS)
- Visual project builder interface
- Team collaboration features

## 📊 Impact

This release transforms Peezy CLI from a development tool into a production-ready platform for:

- **Enterprise teams** requiring consistent development environments
- **DevOps engineers** building automated deployment pipelines
- **Open source maintainers** needing reproducible project templates
- **Educational institutions** teaching modern development practices

## 🙏 Acknowledgments

Special thanks to the community for feedback and testing that made this release possible. The deterministic build system addresses real-world challenges faced by development teams worldwide.

---

**Full Changelog**: https://github.com/Sehnya/peezy-cli/compare/v0.1.3...v0.1.4
**Download**: `npm install -g peezy-cli@0.1.4`
