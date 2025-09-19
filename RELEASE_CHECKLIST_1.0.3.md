# 🚀 Release Checklist - Peezy CLI v1.0.3

## Pre-Release Validation

### ✅ Version Updates

- [x] **package.json**: Updated to 1.0.3
- [x] **src/index.ts**: CLI version string updated to 1.0.3
- [x] **Version consistency**: Verified alignment across files

### ✅ Code Quality

- [x] **Linting**: TypeScript compilation without errors
- [x] **Tests**: All 148 tests passing
- [x] **Build**: Successful TypeScript build
- [x] **CLI Functionality**: Basic commands working correctly

### ✅ Template Validation

- [x] **nextjs-fullstack**: Structure and configuration valid
- [x] **express-fullstack**: Structure and configuration valid
- [x] **react-spa-advanced**: Structure and configuration valid
- [x] **nextjs-app-router**: Structure and configuration valid
- [x] **express-typescript**: Structure and configuration valid
- [x] **bun-react-tailwind**: Structure and configuration valid
- [x] **vite-vue-tailwind**: Structure and configuration valid
- [x] **flask**: Structure and configuration valid
- [x] **fastapi**: Structure and configuration valid
- [x] **flask-bun-hybrid**: Structure and configuration valid

### ✅ GitHub Workflows

- [x] **Workflow Validation**: All workflows syntactically correct
- [x] **PR Checks**: Enhanced validation workflow ready
- [x] **CI Pipeline**: Updated with new testing approach
- [x] **Branch Protection**: Updated with new job requirements
- [x] **Release Workflow**: Ready for automated release

### ✅ Documentation

- [x] **Release Notes**: Created RELEASE_NOTES_1.0.3.md
- [x] **Testing Strategy**: Updated documentation
- [x] **Migration Guide**: Provided for new testing approach
- [x] **Command References**: Updated throughout documentation

## Release Execution

### 1. Final Validation

```bash
# Run comprehensive checks
npm run check

# Validate workflows
npm run validate:workflows

# Test CLI functionality
node dist/index.js --version  # Should output: 1.0.3
node dist/index.js list --json | jq -r '.ok'  # Should output: true
node dist/index.js doctor --json | jq -r '.ok'  # Should output: true
```

### 2. Git Operations

```bash
# Ensure working directory is clean
git status

# Add all changes
git add .

# Commit release
git commit -m "chore: release v1.0.3

- Enhanced testing infrastructure with universal validation
- Improved PR validation workflows with comprehensive checks
- Added template integrity and version consistency validation
- Updated documentation and migration guides
- Replaced preflight checks with universal npm run check command"

# Create and push tag
git tag -a v1.0.3 -m "Release v1.0.3 - Testing Infrastructure Improvements"
git push origin main
git push origin v1.0.3
```

### 3. GitHub Release

- [ ] **Automated Release**: GitHub Actions will create release automatically
- [ ] **Release Notes**: Will be populated from RELEASE_NOTES_1.0.3.md
- [ ] **Binaries**: Cross-platform binaries will be built and attached
- [ ] **NPM Publishing**: Package will be published to npm registry

### 4. Distribution Updates

- [ ] **Homebrew**: Formula will be updated automatically
- [ ] **Scoop**: Manifest will be updated automatically
- [ ] **Install Script**: Will reference new version

## Post-Release Validation

### 1. NPM Package

```bash
# Verify npm package
npm view peezy-cli@1.0.3

# Test installation
npm install -g peezy-cli@1.0.3
peezy --version  # Should output: 1.0.3
```

### 2. GitHub Release

- [ ] **Release Created**: Verify release appears on GitHub
- [ ] **Binaries Available**: Check all platform binaries are attached
- [ ] **Release Notes**: Verify release notes are properly formatted
- [ ] **Download Links**: Test binary downloads work

### 3. Distribution Channels

- [ ] **Homebrew**: Test `brew install peezy-cli` (may take time to update)
- [ ] **Install Script**: Test `curl -fsSL https://get.peezy.dev | sh`
- [ ] **Direct Downloads**: Verify all binary downloads work

## Rollback Plan

If issues are discovered post-release:

### 1. Immediate Actions

```bash
# Unpublish from npm (if critical issue)
npm unpublish peezy-cli@1.0.3

# Delete GitHub release and tag
git tag -d v1.0.3
git push origin :refs/tags/v1.0.3
```

### 2. Fix and Re-release

```bash
# Fix issues
# Update version to 1.0.4
# Follow release process again
```

## Success Criteria

### ✅ Technical Validation

- [x] All tests passing (148/148)
- [x] TypeScript build successful
- [x] CLI commands working correctly
- [x] JSON output valid
- [x] Template structures validated
- [x] Version consistency confirmed
- [x] GitHub workflows validated

### ✅ Release Artifacts

- [ ] NPM package published successfully
- [ ] GitHub release created with binaries
- [ ] Release notes properly formatted
- [ ] Distribution channels updated

### ✅ User Experience

- [ ] Installation works across platforms
- [ ] CLI functionality preserved
- [ ] New testing approach documented
- [ ] Migration guide available

## Key Changes in v1.0.3

### 🚀 Enhanced Testing Infrastructure

- **Universal Testing**: Replaced preflight with `npm run check`
- **PR Validation**: 6 specialized validation jobs
- **Template Integrity**: Comprehensive structure validation
- **Version Consistency**: Automated alignment checks
- **Registry Validation**: Template loading validation

### 🔧 Developer Experience

- **Single Command**: `npm run check` for all validation
- **Better Errors**: Improved error reporting
- **Comprehensive Docs**: Enhanced testing strategy guide

### 🛠️ Breaking Changes

- **Command Change**: `npm run pre-flight` → `npm run check`
- **Workflow Updates**: Enhanced PR validation requirements

## Communication Plan

### 1. Release Announcement

- [ ] **GitHub Release**: Automated with detailed notes
- [ ] **NPM**: Package description and changelog
- [ ] **Documentation**: Updated installation instructions

### 2. Migration Support

- [ ] **Migration Guide**: Available in documentation
- [ ] **Breaking Changes**: Clearly documented
- [ ] **Support Channels**: GitHub Issues and Discussions

## Final Checklist

- [x] **Version Numbers**: Updated and consistent
- [x] **Tests**: All passing
- [x] **Build**: Successful
- [x] **Templates**: All validated
- [x] **Workflows**: All validated
- [x] **Documentation**: Updated
- [x] **Release Notes**: Created
- [ ] **Git Tag**: Ready to create
- [ ] **Release**: Ready to execute

---

**Ready for Release**: ✅ All pre-release validation completed  
**Next Step**: Execute git operations and trigger release workflow
