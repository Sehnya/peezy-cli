# Changelog - v1.0.3

## [1.0.3] - 2024-12-19

### 🚀 Added

#### Enhanced Testing Infrastructure

- **Universal Testing Command**: New `npm run check` command that runs linting, tests, and build in one step
- **Comprehensive PR Validation**: Added 6 specialized GitHub Actions jobs for thorough pull request validation
- **Template Integrity Validation**: Comprehensive structure validation for all 10 templates
- **Version Consistency Checks**: Automated validation to ensure version alignment between package.json and CLI
- **Registry Validation**: Template registry loading and validation tests
- **Workflow Validation Script**: New `npm run validate:workflows` command to validate GitHub Actions configurations

#### Developer Experience Improvements

- **Better Error Messages**: Improved error reporting and validation feedback throughout the system
- **Enhanced Documentation**: Added comprehensive testing strategy documentation and migration guides

#### Distribution Setup

- **Homebrew Distribution**: Complete setup for Homebrew tap distribution
- **Automated Setup Script**: `scripts/setup-homebrew-tap.sh` for easy Homebrew tap creation

### 🔧 Changed

#### Testing Strategy Overhaul

- **Replaced**: Release-specific `npm run pre-flight` command with universal `npm run check`
- **Enhanced**: PR validation workflows with more comprehensive checks and better error reporting
- **Improved**: CI pipeline with enhanced template validation and cross-platform testing

### 🛠️ Breaking Changes

#### Command Changes

```bash
# Old command (removed)
npm run pre-flight

# New command (universal)
npm run check
```

### 🗑️ Removed

- **Preflight Script**: Removed `scripts/pre-flight-check.js` (release-specific with hardcoded versions)

### 🧪 Testing

#### Test Suite Improvements

- **All Tests Passing**: 148/148 tests pass with enhanced validation
- **JSON Output Validation**: Fixed and enhanced CLI JSON output testing
- **Template Testing**: Comprehensive validation for all template structures

### 📋 Migration Guide

#### For Developers

```bash
# Replace old command
# Before:
npm run pre-flight

# After:
npm run check
```

---

**Full Changelog**: [v1.0.2...v1.0.3](https://github.com/Sehnya/peezy-cli/compare/v1.0.2...v1.0.3)
