# Distribution Setup Guide

This guide walks you through setting up the distribution system for Peezy CLI.

## 1. Create Distribution Repositories

### Homebrew Tap Repository

1. Create a new repository: `homebrew-peezy`
2. Initialize with the Homebrew formula structure:

```bash
# Create the repository structure
mkdir -p Formula
cp homebrew/peezy.rb Formula/peezy.rb
git add .
git commit -m "Initial Homebrew formula"
git push origin main
```

### Scoop Bucket Repository

1. Create a new repository: `peezy-scoop`
2. Initialize with the Scoop manifest:

```bash
# Create the repository structure
cp scoop/peezy.json peezy.json
git add .
git commit -m "Initial Scoop manifest"
git push origin main
```

## 2. Generate GitHub Tokens

### For Homebrew Tap Updates

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `Homebrew Tap Token`
4. Scopes needed:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Copy the token and save it securely

### For Scoop Bucket Updates

1. Generate another token with the same process
2. Name: `Scoop Bucket Token`
3. Same scopes: `repo` and `workflow`
4. Copy the token and save it securely

### For NPM Publishing

1. Go to npmjs.com → Account Settings → Access Tokens
2. Click "Generate New Token"
3. Choose "Automation" token type
4. Copy the token and save it securely

## 3. Add Secrets to Main Repository

In your main `peezy-cli` repository:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

| Secret Name          | Description                         | Value                     |
| -------------------- | ----------------------------------- | ------------------------- |
| `HOMEBREW_TAP_TOKEN` | Token for updating Homebrew formula | Your Homebrew tap token   |
| `SCOOP_BUCKET_TOKEN` | Token for updating Scoop manifest   | Your Scoop bucket token   |
| `NPM_TOKEN`          | Token for publishing to npm         | Your npm automation token |

## 4. Alternative: Simplified Workflow (No External Repos)

If you don't want to manage separate repositories, here's a simplified approach:

### Option A: Manual Distribution

Remove the repository dispatch steps and manually update distribution files after releases.

### Option B: Single Repository Distribution

Keep everything in the main repository and use GitHub Pages or releases for distribution.

## 5. Testing the Setup

### Test Binary Building Locally

```bash
# Install pkg globally
npm install -g pkg

# Build binaries
npm run build:binaries

# Check output
ls -la dist-binaries/
```

### Test Distribution Updates

```bash
# Update distribution files
npm run update:distribution

# Check updated files
git diff homebrew/peezy.rb scoop/peezy.json
```

### Test Release Workflow

1. Create a test tag: `git tag v1.0.0-test`
2. Push the tag: `git push origin v1.0.0-test`
3. Check GitHub Actions for any errors
4. Delete test tag: `git tag -d v1.0.0-test && git push origin :refs/tags/v1.0.0-test`

## 6. Simplified Workflow (Recommended for Now)

Here's a simplified version that doesn't require external repositories:

## Current Workflow Status

The GitHub Actions workflow has been simplified to work without external repository tokens. Here's what happens now:

### ✅ What Works Immediately

- Binary building for all platforms
- Sigstore signing of binaries
- GitHub release creation with all assets
- Distribution files are updated and included in releases

### 🔧 What Requires Setup

#### 1. NPM Publishing (Optional)

Only needed if you want to publish to npm registry:

1. Go to [npmjs.com](https://npmjs.com) → Account Settings → Access Tokens
2. Click "Generate New Token" → Choose "Automation"
3. Copy the token
4. In GitHub: Settings → Secrets → Actions → New repository secret
5. Name: `NPM_TOKEN`, Value: your npm token

#### 2. Manual Distribution Setup (Recommended)

Since the workflow now includes distribution files in releases, you can:

1. **For Homebrew**:
   - Create `homebrew-peezy` repository
   - Copy `homebrew/peezy.rb` from releases to `Formula/peezy.rb`
   - Submit to Homebrew core or maintain as tap

2. **For Scoop**:
   - Create `peezy-scoop` repository
   - Copy `scoop/peezy.json` from releases
   - Submit to Scoop main bucket or maintain as custom bucket

3. **For Direct Installation**:
   - The `install.sh` script is included in releases
   - Users can run: `curl -fsSL https://github.com/Sehnya/peezy-cli/releases/latest/download/install.sh | bash`

## Quick Start (No Tokens Needed)

1. **Test the workflow**:

   ```bash
   git tag v1.0.0-test
   git push origin v1.0.0-test
   ```

2. **Check the release**:
   - Go to GitHub Releases
   - Verify all binaries are built
   - Download and test a binary

3. **Clean up test**:
   ```bash
   git tag -d v1.0.0-test
   git push origin :refs/tags/v1.0.0-test
   ```

## Token Setup (When Ready)

### NPM Token Setup

```bash
# 1. Login to npmjs.com
# 2. Go to Access Tokens → Generate New Token → Automation
# 3. Copy token
# 4. Add to GitHub Secrets as NPM_TOKEN
```

### Future: External Repository Tokens

If you want automated distribution updates:

```bash
# 1. Create homebrew-peezy repository
# 2. Create peezy-scoop repository
# 3. Generate GitHub tokens with repo access
# 4. Add as HOMEBREW_TAP_TOKEN and SCOOP_BUCKET_TOKEN secrets
# 5. Update workflow to use repository dispatch
```

## Testing Locally

```bash
# Test binary building
npm run build:binaries

# Test distribution updates
npm run update:distribution

# Check generated files
ls -la dist-binaries/
cat homebrew/peezy.rb
cat scoop/peezy.json
```

The workflow is now ready to run without any external tokens! 🎉
