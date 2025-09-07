# Peezy CLI - Deterministic Output Implementation

## Overview

This implementation addresses [GitHub Issue #1](https://github.com/Sehnya/peezy-cli/issues/1) by adding standardized JSON output and deterministic project reproduction capabilities to the Peezy CLI.

## ✅ Completed Features

### 1. Standardized JSON Output

All CLI commands now support the `--json` flag with a consistent output format:

```json
{
  "ok": boolean,
  "data": any,
  "warnings": string[],
  "errors": string[],
  "version": string
}
```

#### Commands with JSON Support:

- ✅ `peezy list --json`
- ✅ `peezy new --json`
- ✅ `peezy doctor --json`
- ✅ `peezy env <subcommand> --json`
- ✅ `peezy readme --json`
- ✅ `peezy upgrade --json`
- ✅ `peezy add --json`
- ✅ `peezy cache --json`
- ✅ `peezy reproduce --json`
- ✅ `peezy verify --json`
- ✅ `peezy check-versions --json`

#### JSON Mode Guarantees:

- ✅ No non-JSON output to stdout when `--json` is used
- ✅ Interactive prompts are suppressed in JSON mode
- ✅ Consistent error handling with structured error messages
- ✅ Warnings and errors captured in the JSON response

### 2. Deterministic Project Reproduction

#### peezy.lock.json Format

Every scaffolded project now includes a `peezy.lock.json` file with:

```json
{
  "$schema": "https://peezy.dev/schemas/peezy.lock.schema.json",
  "peezyVersion": "0.1.3",
  "formatVersion": 1,
  "project": {
    "name": "my-app",
    "createdAt": "2025-09-07T03:01:13.596Z"
  },
  "template": {
    "name": "bun-react-tailwind",
    "version": "latest",
    "source": {
      "type": "local",
      "path": "/path/to/template"
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
      "README.md": "sha256-..."
    }
  }
}
```

#### Lock File Features:

- ✅ **Template Source Tracking**: Records exact template name, version, and source
- ✅ **File Integrity**: SHA256 checksums for all generated files
- ✅ **Option Preservation**: Captures all CLI flags and interactive answers
- ✅ **Timestamp Tracking**: Records when the project was created
- ✅ **Schema Validation**: Includes JSON schema reference for validation

#### Reproduction Commands:

```bash
# Reproduce a project from lock file
peezy reproduce new-project-name --lock-file path/to/peezy.lock.json

# Verify project matches its lock file
peezy verify --project-path ./my-project

# JSON output for both commands
peezy reproduce new-project --lock-file peezy.lock.json --json
peezy verify --project-path ./project --json
```

## 🔧 Implementation Details

### New Files Created:

- `src/utils/lock-file.ts` - Lock file creation, reading, and verification
- `src/commands/reproduce.ts` - Project reproduction from lock files
- Enhanced `src/types.ts` - Lock file type definitions

### Modified Files:

- `src/index.ts` - Added JSON support to all commands
- `src/actions/scaffold.ts` - Integrated lock file creation
- `src/commands/env.ts` - Added JSON output support
- `src/commands/readme-changelog.ts` - Added JSON output support
- `src/commands/upgrade.ts` - Added JSON output support

### Key Technical Features:

#### Output Capture System

- `OutputCapture` class intercepts console output in JSON mode
- Warnings and errors are captured and included in JSON response
- Clean separation between human-readable and machine-readable output

#### File Integrity System

- SHA256 checksums for all generated files
- Excludes common build artifacts and dependencies
- Verification detects missing, modified, and extra files

#### Template Source Resolution

- Supports both local and remote template sources
- Preserves exact template resolution information
- Enables bit-for-bit reproduction of projects

## 🧪 Testing

All features have been tested with the following scenarios:

### JSON Output Testing:

```bash
# All commands produce valid JSON
peezy list --json | jq '.ok'
peezy new template project --json | jq '.ok'
peezy doctor --json | jq '.ok'
# ... etc for all commands
```

### Deterministic Reproduction Testing:

```bash
# Create → Reproduce → Verify workflow
peezy new flask test-project --no-install --no-git
peezy reproduce test-copy --lock-file test-project/peezy.lock.json
peezy verify --project-path test-copy
# Result: Projects are identical
```

## 🎯 Acceptance Criteria Met

### ✅ JSON Output Requirements:

- [x] `peezy --json` never prints non-JSON to stdout
- [x] Standardized `{ ok, data, warnings, errors, version }` shape
- [x] All commands support `--json` flag

### ✅ Deterministic Reproduction Requirements:

- [x] `peezy.lock.json` written on scaffold/add/upgrade
- [x] Lock file used as input for re-running commands
- [x] `peezy init → re-run` produces identical file tree & package versions
- [x] File integrity verification with checksums
- [x] Template source and version tracking

## 🚀 Usage Examples

### Machine-Consumable Output:

```bash
# Get available templates programmatically
peezy list --json | jq '.data.templates[].name'

# Create project and capture metadata
peezy new react my-app --json | jq '.data.project.path'

# Check environment status
peezy env check --json | jq '.data.valid'
```

### Deterministic Workflows:

```bash
# Create a project
peezy new nextjs-app-router my-app

# Share the lock file
cp my-app/peezy.lock.json ./project-template.lock.json

# Anyone can reproduce the exact same project
peezy reproduce my-app-copy --lock-file project-template.lock.json

# Verify integrity
peezy verify --project-path my-app-copy
```

## 🔮 Future Enhancements

The implementation provides a solid foundation for:

- Remote template registry integration
- Plugin system with deterministic plugin resolution
- Environment provider integration (Railway, etc.)
- Advanced diff and update capabilities
- CI/CD integration for project validation

## 📋 Summary

This implementation successfully delivers:

1. **Machine-consumable outputs** via standardized JSON format
2. **Deterministic project reproduction** via comprehensive lock files
3. **File integrity verification** via SHA256 checksums
4. **Complete workflow coverage** for all CLI commands

The Peezy CLI now provides the reliability and automation capabilities needed for production workflows while maintaining its ease of use for interactive development.
