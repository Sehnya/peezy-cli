# NPM Publishing Guide for Peezy CLI v1.0.0

## 🚀 Automated Publishing (Recommended)

The GitHub Actions workflow will automatically publish to npm when you push the v1.0.0 tag.

### Prerequisites

1. **NPM Token**: You mentioned you already generated this ✅
2. **GitHub Secret**: Make sure `NPM_TOKEN` is added to repository secrets

### Publishing Process

```bash
# 1. Run comprehensive checks
npm run check

# 2. Commit final changes
git add .
git commit -m "Release v1.0.0: Hero features implementation"

# 3. Create and push tag (this triggers npm publishing)
git tag -a v1.0.0 -m "Peezy CLI v1.0.0 - Hero Features Release"
git push origin v1.0.0
```

### What Happens Automatically

1. **GitHub Actions triggers** on the v1.0.0 tag
2. **Tests run** to ensure quality
3. **TypeScript builds** to dist/
4. **Binaries build** for all platforms
5. **npm publishes** automatically (if NPM_TOKEN is configured)
6. **GitHub release** creates with all assets

## 🔧 Manual Publishing (Backup Option)

If automated publishing fails, you can publish manually:

### Local Publishing Steps

```bash
# 1. Ensure you're logged into npm
npm whoami  # Should show your npm username

# 2. Run pre-publish checks
npm run prepublishOnly  # Runs tests + build

# 3. Test the package
npm run pack:test  # Dry run to see what will be included

# 4. Publish to npm
npm publish

# 5. Verify publication
npm view peezy-cli@1.0.0
```

### Troubleshooting Manual Publishing

If you encounter issues:

```bash
# Check if you're logged in
npm whoami

# Login if needed
npm login

# Check package contents
npm pack --dry-run

# Publish with verbose output
npm publish --verbose

# Check if version already exists
npm view peezy-cli versions --json
```

## 📦 Package Verification

After publishing (automatic or manual), verify the package:

### Check npm Registry

```bash
# View package info
npm view peezy-cli@1.0.0

# Check all versions
npm view peezy-cli versions

# Test installation
npm install -g peezy-cli@1.0.0
peezy --version  # Should show 1.0.0
```

### Test Package Contents

```bash
# Download and inspect
npm pack peezy-cli@1.0.0
tar -tzf peezy-cli-1.0.0.tgz

# Should include:
# - dist/ (compiled JavaScript)
# - templates/ (all templates)
# - bin/ (CLI entry point)
# - package.json
# - README.md
```

## 🔍 Pre-Publishing Checklist

### ✅ Package.json Ready

- [x] Version: 1.0.0
- [x] Description updated for v1.0.0
- [x] Keywords include hero features
- [x] Files array includes all necessary files
- [x] Dependencies are correct
- [x] Scripts are functional

### ✅ Build System Ready

- [x] TypeScript compiles without errors
- [x] All tests pass
- [x] Templates are complete
- [x] Binary entry point works

### ✅ Documentation Ready

- [x] README.md updated for v1.0.0
- [x] Release notes created
- [x] Hero features documented
- [x] Installation instructions updated

### ✅ GitHub Actions Ready

- [x] NPM_TOKEN secret configured
- [x] Workflow includes npm publishing
- [x] Publishing only on non-alpha releases
- [x] Error handling with continue-on-error

## 🎯 Expected npm Package

After publishing, users will be able to:

```bash
# Install globally
npm install -g peezy-cli

# Use immediately
peezy --version  # 1.0.0
peezy new nextjs-fullstack my-app

# View package info
npm view peezy-cli
```

## 📊 Post-Publishing Tasks

### Immediate (First Hour)

- [ ] Verify package appears on npmjs.com
- [ ] Test installation on different platforms
- [ ] Check package contents are correct
- [ ] Verify CLI works after npm install

### Short-term (First Day)

- [ ] Monitor download statistics
- [ ] Respond to any installation issues
- [ ] Update project documentation with npm links
- [ ] Announce v1.0.0 release

### Medium-term (First Week)

- [ ] Gather user feedback
- [ ] Monitor for compatibility issues
- [ ] Plan v1.0.1 patch if needed
- [ ] Update distribution channels

## 🚨 Rollback Plan

If critical issues are discovered after publishing:

### Option 1: Deprecate Version

```bash
npm deprecate peezy-cli@1.0.0 "Critical issue found, use v1.0.1 instead"
```

### Option 2: Unpublish (within 24 hours)

```bash
npm unpublish peezy-cli@1.0.0
```

### Option 3: Publish Hotfix

```bash
# Fix issues, update version to 1.0.1
npm publish
```

## 🎉 Success Metrics

- [ ] Package successfully published to npm
- [ ] Installation works via `npm install -g peezy-cli`
- [ ] CLI shows version 1.0.0
- [ ] Hero templates work correctly
- [ ] All features functional after npm install

---

## 🚀 Ready to Publish!

Everything is prepared for npm publishing. The automated workflow will handle this when you push the v1.0.0 tag, or you can publish manually if needed.

**Time to share Peezy CLI v1.0.0 with the world! 🌟**
