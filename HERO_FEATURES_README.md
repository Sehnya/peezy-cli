# Peezy CLI v1.0 - Hero Features Implementation

This document outlines the four major hero features implemented for Peezy CLI v1.0:

## 🚀 1. Hero Experiences: Curated Full-Stack Templates

### New Templates Added

#### Next.js Full-Stack (`nextjs-fullstack`)

- **Complete full-stack application** with Next.js 14 App Router
- **Authentication** with NextAuth.js and Drizzle adapter
- **Database integration** with PostgreSQL and Drizzle ORM
- **Modern UI** with Tailwind CSS and Headless UI
- **Type-safe** throughout with TypeScript

```bash
peezy new nextjs-fullstack my-app
```

#### Express + React Full-Stack (`express-fullstack`)

- **Express.js backend** with TypeScript and REST API
- **React frontend** with Vite and modern tooling
- **Shared authentication** with JWT tokens
- **Database integration** with Drizzle ORM
- **Concurrent development** setup

```bash
peezy new express-fullstack my-fullstack-app
```

#### Advanced React SPA (`react-spa-advanced`)

- **Modern React SPA** with advanced features
- **State management** with Zustand
- **Data fetching** with TanStack Query
- **Routing** with React Router v6
- **Testing setup** with Vitest and Testing Library
- **Animations** with Framer Motion

```bash
peezy new react-spa-advanced my-spa
```

### Enhanced Template Registry

Templates now support additional metadata:

- `hero: true` - Marks templates as curated hero experiences
- `description` - Detailed template description
- `tags` - Searchable tags for better discovery

## 🔄 2. Migration System: Safe Project Updates

### Migration Command

```bash
# Preview migration changes
peezy migrate --dry-run --template nextjs-fullstack

# Interactive migration with conflict resolution
peezy migrate --interactive --template nextjs-fullstack

# Force migration (use with caution)
peezy migrate --force --template nextjs-fullstack --version latest
```

### Features

- **Template diffing** - Compare current project with target template
- **Conflict detection** - Identify files that have been customized
- **Interactive resolution** - Choose how to handle conflicts
- **Backup creation** - Automatic backups before migration
- **Safe updates** - Preview changes before applying

### Migration Process

1. **Analysis** - Compare current project with target template
2. **Conflict Detection** - Identify customized files
3. **Preview** - Show what will change
4. **Resolution** - Handle conflicts interactively or automatically
5. **Backup** - Create backup if requested
6. **Application** - Apply changes safely
7. **Lock File Update** - Update project metadata

## 📦 3. Distribution: Multi-Platform Binaries

### Supported Platforms

- **macOS** (Intel & Apple Silicon)
- **Linux** (x64 & ARM64)
- **Windows** (x64)

### Installation Methods

#### Homebrew (macOS/Linux)

```bash
brew tap Sehnya/peezy
brew install peezy
```

#### Scoop (Windows)

```bash
scoop bucket add peezy https://github.com/Sehnya/peezy-scoop
scoop install peezy
```

#### Direct Download

```bash
# One-liner installation script
curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash
```

### Build System

```bash
# Build all platform binaries
npm run build:binaries

# Update distribution files
npm run update:distribution

# Complete release process
npm run release
```

### Binary Features

- **Standalone executables** - No Node.js required
- **Embedded templates** - All templates included
- **Cross-platform** - Works on all major platforms
- **Automatic updates** - Built-in update checking

## 🔐 4. Production Security: Sigstore Integration

### Keyless Signing

Peezy now uses **Sigstore** for production-grade security:

- **Keyless signing** - No private keys to manage
- **Transparency logs** - All signatures recorded publicly
- **Certificate transparency** - Verifiable identity
- **OIDC integration** - Uses existing identity providers

### Security Commands

#### Template Verification

```bash
# Verify template signature
peezy verify-template ./my-template

# Verify with specific signature file
peezy verify-template ./my-template --signature ./template.sig
```

#### Trust Management

```bash
# List trusted signers
peezy trust list

# Add trusted signer
peezy trust add developer@company.com

# Remove trusted signer
peezy trust remove developer@company.com
```

#### Security Audit

```bash
# Audit project security
peezy audit

# JSON output for CI/CD
peezy audit --json
```

### Trust Policy

Configure security requirements in `~/.peezy/trust-policy.json`:

```json
{
  "requireSignatures": true,
  "allowUnsigned": false,
  "trustedSigners": ["peezy-team@example.com", "your-team@company.com"],
  "maxSignatureAge": 365
}
```

### Template Signing Process

1. **Content Hashing** - Calculate SHA-256 of template files
2. **Sigstore Signing** - Sign hash with keyless signing
3. **Transparency Log** - Record signature in public log
4. **Bundle Creation** - Create signature bundle with certificate
5. **Verification** - Verify against transparency log

## 🎯 Usage Examples

### Creating a Hero Experience Project

```bash
# Interactive creation with enhanced prompts
peezy new

# Direct creation of full-stack app
peezy new nextjs-fullstack my-startup --databases postgresql --redis --orm drizzle

# Advanced React SPA with all features
peezy new react-spa-advanced my-dashboard
```

### Migrating Existing Projects

```bash
# Preview migration to hero template
peezy migrate --dry-run --template nextjs-fullstack

# Interactive migration with conflict resolution
peezy migrate --interactive --template nextjs-fullstack

# Migrate with backup
peezy migrate --template nextjs-fullstack --backup
```

### Security Workflow

```bash
# Verify template before use
peezy verify-template nextjs-fullstack

# Audit project security
peezy audit

# Configure trust policy
peezy trust add your-team@company.com
```

### Distribution and Installation

```bash
# Install via Homebrew
brew install Sehnya/peezy/peezy

# Install via script
curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash

# Verify installation
peezy --version
peezy doctor
```

## 🔧 Development

### Building Binaries

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Build platform binaries
npm run build:binaries

# Update distribution files
npm run update:distribution
```

### Testing Security Features

```bash
# Test template signing (development mode)
NODE_ENV=development peezy verify-template ./templates/nextjs-fullstack

# Test migration system
peezy migrate --dry-run --template nextjs-fullstack

# Test binary creation
npm run build:binaries
```

## 📋 Migration Guide

### From v0.x to v1.0

1. **Update CLI**: Install new version via preferred method
2. **Review Templates**: Check if hero templates fit your needs
3. **Migrate Projects**: Use `peezy migrate` for existing projects
4. **Configure Security**: Set up trust policy if needed
5. **Update CI/CD**: Use new binary distributions

### Breaking Changes

- Template registry now includes hero templates first
- Security verification is more strict by default
- Migration system replaces manual template updates
- Binary distribution changes installation methods

## 🚀 What's Next

These hero features establish Peezy CLI as a production-ready tool for modern development workflows. Future enhancements will focus on:

- **Plugin ecosystem** expansion
- **Cloud integrations** (AWS, Vercel, Railway)
- **Team collaboration** features
- **Enterprise security** enhancements
- **Performance optimizations**

---

**Ready to build something amazing?** Start with a hero template:

```bash
peezy new nextjs-fullstack my-next-big-thing
```
