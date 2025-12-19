---
inclusion: manual
---

# Release Process

When pushing changes that should trigger a release, use the following workflow:

## Creating a Release

```bash
# 1. Ensure all changes are committed
git add .
git commit -m "Your commit message"

# 2. Tag the release with version
git tag v1.0.3

# 3. Push the commit and tag to trigger the release workflow
git push origin main
git push origin v1.0.3
```

## Version Tagging Convention

- Stable releases: `v1.0.0`, `v1.0.3`, `v2.0.0`
- Alpha releases: `v1.0.0-alpha.1`
- Beta releases: `v1.0.0-beta.1`
- Release candidates: `v1.0.0-rc.1`

## What Happens on Release

When a tag starting with `v` is pushed:

1. GitHub Actions builds binaries for:
   - Linux (x64, arm64)
   - macOS (x64, arm64)
   - Windows (x64)

2. Creates a GitHub Release with:
   - All binary archives (.tar.gz, .zip)
   - Checksums file
   - Install script

3. For stable releases (no alpha/beta/rc):
   - Publishes to npm

## Pre-release Checklist

- [ ] Update version in `package.json`
- [ ] Run tests: `npm test`
- [ ] Build locally: `npm run build`
- [ ] Update CHANGELOG if needed
