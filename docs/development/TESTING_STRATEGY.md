# Testing Strategy

This document outlines the comprehensive testing strategy for Peezy CLI, designed to ensure quality and reliability across all merge requests and releases.

## Overview

We've replaced the release-specific preflight check with a universal testing approach that works for any merge request or development workflow. This ensures consistent quality validation throughout the development lifecycle.

## Testing Levels

### 1. Local Development (`npm run check`)

Quick comprehensive check for developers:

```bash
npm run check
```

This runs:

- **Linting** - TypeScript type checking (`npm run lint`)
- **Unit Tests** - Full test suite (`npm test`)
- **Build Validation** - TypeScript compilation (`npm run build`)

### 2. Pull Request Validation

Automated checks that run on every PR:

#### PR Checks Workflow (`.github/workflows/pr-checks.yml`)

- **PR Title Validation** - Ensures semantic commit format
- **Comprehensive Checks** - Runs `npm run check`
- **CLI Functionality Tests** - Tests basic CLI commands and JSON output
- **Template Integrity** - Validates all template structures
- **Version Consistency** - Ensures version alignment across files
- **Registry Validation** - Validates template registry loading
- **Bundle Size Impact** - Tracks size changes
- **Dependency Security** - Scans for vulnerabilities

#### CI Workflow (`.github/workflows/ci.yml`)

- **Multi-Node Testing** - Tests on Node.js 20.x and 22.x
- **Security Auditing** - Comprehensive vulnerability scanning
- **Code Quality** - TypeScript validation and comprehensive checks
- **Cross-Platform Testing** - Ubuntu, Windows, macOS compatibility
- **Template Structure Validation** - Ensures proper template organization

### 3. Branch Protection

Automated branch protection rules ensure:

- All status checks must pass before merge
- At least one approving review required
- Conversations must be resolved
- No force pushes allowed

## Test Categories

### Unit Tests

- Individual function testing
- Component behavior validation
- Error handling verification
- Edge case coverage

### Integration Tests

- CLI command functionality
- Template scaffolding workflows
- JSON output validation
- Cross-platform compatibility

### Template Tests

- Structure validation (required directories)
- Configuration file validation (package.json, configs)
- Dependency integrity
- Build system compatibility

### Security Tests

- Dependency vulnerability scanning
- Known exception handling (pkg build-time vulnerability)
- High-severity vulnerability blocking
- Security report generation

## Quality Gates

### Before Merge

All PRs must pass:

1. ✅ **Automated Tests** - All test suites pass
2. ✅ **Build Validation** - TypeScript compiles successfully
3. ✅ **Template Integrity** - All templates maintain proper structure
4. ✅ **Security Scan** - No runtime vulnerabilities
5. ✅ **Version Consistency** - All version strings aligned
6. ✅ **Registry Validation** - Template registry loads correctly
7. ✅ **Code Review** - At least one approving review

### Before Release

Additional validation for releases:

1. ✅ **Cross-Platform Testing** - All platforms pass
2. ✅ **Multi-Node Testing** - All Node.js versions pass
3. ✅ **Distribution Testing** - Binary builds work correctly
4. ✅ **Documentation Updates** - Release notes and changelogs updated

## Developer Workflow

### Daily Development

```bash
# Before committing
npm run check

# This ensures:
# - Code compiles without errors
# - All tests pass
# - TypeScript types are valid
```

### Before Creating PR

```bash
# Run comprehensive validation
npm run check

# Test CLI functionality
npm run build
node dist/index.js --version
node dist/index.js list --json
```

### PR Review Process

1. **Automated Checks** - Must pass all CI checks
2. **Manual Review** - Code quality and design review
3. **Template Review** - If templates modified, structure validation
4. **Security Review** - For security-related changes

## Continuous Improvement

### Metrics Tracked

- Test coverage percentage
- Build success rate
- Security vulnerability trends
- Template integrity compliance
- Cross-platform compatibility

### Regular Reviews

- Monthly test strategy review
- Quarterly security audit
- Annual testing tool evaluation

## Tools and Technologies

### Testing Framework

- **Jest** - Unit and integration testing
- **TypeScript** - Type safety and compilation
- **GitHub Actions** - CI/CD automation

### Security Tools

- **npm audit** - Dependency vulnerability scanning
- **Sigstore** - Binary signing and verification
- **GitHub Security Advisories** - Vulnerability tracking

### Quality Tools

- **TypeScript Compiler** - Type checking and linting
- **jq** - JSON validation and parsing
- **Cross-platform testing** - Multi-OS validation

## Migration from Preflight Check

### What Changed

- ❌ **Removed**: Release-specific preflight script
- ✅ **Added**: Universal `npm run check` command
- ✅ **Enhanced**: PR validation workflows
- ✅ **Improved**: Template integrity checking
- ✅ **Added**: Version consistency validation
- ✅ **Added**: Registry validation

### Benefits

- **Universal** - Works for any branch or PR
- **Comprehensive** - More thorough validation
- **Automated** - Runs on every PR automatically
- **Consistent** - Same checks for all contributors
- **Maintainable** - No hardcoded version strings
- **Scalable** - Easy to add new checks

### Migration Guide

Replace old commands:

```bash
# Old
npm run pre-flight

# New
npm run check
```

All functionality is preserved and enhanced in the new approach.

## Troubleshooting

### Common Issues

#### Tests Failing

```bash
# Run specific test
npm test -- --testNamePattern="specific test"

# Run in watch mode
npm run test:watch
```

#### Build Errors

```bash
# Check TypeScript errors
npm run lint

# Clean build
npm run clean && npm run build
```

#### Template Issues

```bash
# Validate specific template
ls -la templates/template-name/
cat templates/template-name/package.json | jq .
```

### Getting Help

- Check GitHub Actions logs for detailed error messages
- Review test output for specific failures
- Consult documentation for expected template structure
- Ask in GitHub Discussions for complex issues

## Future Enhancements

### Planned Improvements

- **Performance Testing** - Bundle size and execution time tracking
- **Visual Regression Testing** - Template UI consistency
- **End-to-End Testing** - Full workflow validation
- **Accessibility Testing** - Template accessibility compliance
- **Internationalization Testing** - Multi-language support validation

### Community Contributions

We welcome contributions to improve our testing strategy:

- New test cases for edge scenarios
- Enhanced template validation rules
- Performance optimization suggestions
- Security testing improvements

---

This testing strategy ensures Peezy CLI maintains high quality and reliability while providing a smooth development experience for all contributors.
