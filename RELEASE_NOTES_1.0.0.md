# Peezy CLI v1.0.0 - Major Release 🚀

**The Future of Project Scaffolding is Here**

Peezy CLI v1.0.0 introduces four game-changing features that transform how developers create, maintain, and distribute modern applications.

## 🌟 What's New

### 🚀 Hero Experiences: Curated Full-Stack Templates

Three production-ready templates that give you everything you need:

#### `nextjs-fullstack` - The Complete Package

```bash
peezy new nextjs-fullstack my-startup
```

- **Next.js 14** with App Router and TypeScript
- **Authentication** with NextAuth.js and multiple providers
- **Database** with PostgreSQL and Drizzle ORM
- **Modern UI** with Tailwind CSS and Headless UI
- **Production-ready** with proper error handling and security

#### `express-fullstack` - Full-Stack Powerhouse

```bash
peezy new express-fullstack my-api
```

- **Express.js backend** with TypeScript and REST API
- **React frontend** with Vite and modern tooling
- **Shared authentication** with JWT tokens
- **Database integration** with Drizzle ORM
- **Concurrent development** setup for seamless workflow

#### `react-spa-advanced` - Modern React Excellence

```bash
peezy new react-spa-advanced my-dashboard
```

- **Advanced React SPA** with all the modern features
- **State management** with Zustand
- **Data fetching** with TanStack Query
- **Routing** with React Router v6
- **Testing** with Vitest and Testing Library
- **Animations** with Framer Motion

### 🔄 Migration System: Safe Project Updates

Never get stuck on old template versions again:

```bash
# Preview what will change
peezy migrate --dry-run --template nextjs-fullstack

# Interactive migration with conflict resolution
peezy migrate --interactive --template nextjs-fullstack

# Safe migration with automatic backup
peezy migrate --template nextjs-fullstack --backup
```

**Features:**

- **Smart diffing** - Compares your project with target template
- **Conflict detection** - Identifies customized files
- **Interactive resolution** - Choose how to handle each conflict
- **Automatic backups** - Never lose your work
- **Preview mode** - See changes before applying

### 📦 Multi-Platform Distribution

Install Peezy CLI anywhere, instantly:

#### macOS & Linux (Homebrew)

```bash
brew tap Sehnya/peezy
brew install peezy
```

#### Windows (Scoop)

```bash
scoop bucket add peezy https://github.com/Sehnya/peezy-scoop
scoop install peezy
```

#### Universal (One-liner)

```bash
curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash
```

**Supported Platforms:**

- macOS (Intel & Apple Silicon)
- Linux (x64 & ARM64)
- Windows (x64)

### 🔐 Production Security with Sigstore

Enterprise-grade security without the complexity:

```bash
# Verify template authenticity
peezy verify-template nextjs-fullstack

# Audit project security
peezy audit

# Manage trusted signers
peezy trust add developer@company.com
```

**Security Features:**

- **Keyless signing** with Sigstore - No private keys to manage
- **Transparency logs** - All signatures publicly verifiable
- **Certificate transparency** - Verifiable signer identity
- **Trust policies** - Configure security requirements
- **Automatic verification** - Templates verified before use

## 🎯 Enhanced Developer Experience

### Smarter Template Discovery

- **Hero templates** prominently featured
- **Rich metadata** with descriptions and tags
- **Better organization** with popular templates first

### Improved CLI Interface

- **Enhanced prompts** with better guidance
- **JSON output** for automation and CI/CD
- **Better error messages** with actionable suggestions
- **Consistent formatting** across all commands

### Robust Infrastructure

- **Deterministic builds** with lock files
- **Integrity verification** for all templates
- **Cross-platform compatibility** tested
- **Automated releases** with signed binaries

## 📊 Migration from v0.x

### Automatic Compatibility

- All existing templates continue to work
- Existing projects remain fully functional
- No breaking changes to core commands

### New Capabilities

- Use `peezy migrate` to update existing projects
- Leverage hero templates for new projects
- Benefit from enhanced security automatically

### Recommended Actions

1. **Update CLI**: Install v1.0.0 via your preferred method
2. **Try hero templates**: Create a new project with a hero template
3. **Migrate existing projects**: Use `peezy migrate --dry-run` to preview updates
4. **Configure security**: Set up trust policies if needed

## 🔧 Technical Improvements

### Performance

- **Faster scaffolding** with optimized file operations
- **Parallel processing** for binary builds
- **Efficient caching** for remote templates
- **Reduced memory usage** in large projects

### Reliability

- **Better error handling** with graceful degradation
- **Comprehensive testing** across all platforms
- **Automated quality checks** in CI/CD
- **Fallback mechanisms** for network issues

### Developer Tools

- **Enhanced debugging** with detailed logs
- **Testing utilities** for distribution
- **Development mode** for local testing
- **Comprehensive documentation**

## 🚀 What's Next

v1.0.0 establishes Peezy CLI as the definitive tool for modern project scaffolding. Future releases will focus on:

- **Plugin ecosystem** expansion
- **Cloud platform integrations** (AWS, Vercel, Railway)
- **Team collaboration** features
- **Enterprise security** enhancements
- **AI-powered** template suggestions

## 🙏 Acknowledgments

Special thanks to the community for feedback, testing, and contributions that made v1.0.0 possible.

## 📋 Full Changelog

### Added

- Hero templates: `nextjs-fullstack`, `express-fullstack`, `react-spa-advanced`
- Migration system with `peezy migrate` command
- Multi-platform binary distribution
- Sigstore integration for template signing
- Enhanced template registry with metadata
- Cross-platform installation scripts
- Automated release pipeline
- Comprehensive security audit system
- Trust policy management
- Template verification system

### Enhanced

- CLI interface with better prompts and guidance
- Error handling with actionable messages
- JSON output support for automation
- Template discovery and organization
- Documentation and help system
- Testing infrastructure
- Build and release processes

### Fixed

- Cross-platform compatibility issues
- Template scaffolding edge cases
- Dependency resolution conflicts
- File permission handling
- Network timeout handling

---

**Ready to build the future?** Get started with a hero template:

```bash
peezy new nextjs-fullstack my-next-big-thing
```

**Download:** [GitHub Releases](https://github.com/Sehnya/peezy-cli/releases/tag/v1.0.0)
**Documentation:** [Hero Features Guide](./HERO_FEATURES_README.md)
**Support:** [GitHub Issues](https://github.com/Sehnya/peezy-cli/issues)
