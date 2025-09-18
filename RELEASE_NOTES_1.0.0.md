# Release Notes v1.0.0 🚀

## Major Release: Production-Ready Peezy CLI

This is the first major release of Peezy CLI, marking its transition from beta to production-ready status. This release includes significant improvements to template quality, infrastructure, and developer experience.

## 🎯 Hero Features

### New Hero Templates

- **Next.js Full-Stack** - Complete Next.js 14 app with auth, database, and modern UI
- **Express + React Full-Stack** - Express backend with React frontend and authentication
- **React SPA Advanced** - Modern React SPA with routing, state management, and testing

### Production Infrastructure

- **Docker Support** - Multi-stage builds for all hero templates
- **Database Integration** - PostgreSQL with Drizzle ORM out of the box
- **Authentication** - JWT and NextAuth.js implementations
- **Development Environment** - Docker Compose for local development

## 🚀 New Features

### Template System

- **Remote Templates** - Support for @org/template@version format
- **Template Caching** - Local caching of remote templates
- **Template Verification** - Sigstore-based template signing and verification
- **Lock Files** - Deterministic builds with peezy.lock.json

### CLI Enhancements

- **JSON Output** - Machine-readable output for all commands
- **Enhanced Prompts** - Interactive configuration with smart defaults
- **Migration System** - Upgrade existing projects to newer templates
- **Doctor Command** - Health checks and environment validation

### Security & Reliability

- **Template Signing** - Cryptographic verification of templates
- **Integrity Checks** - SHA-256 checksums for all template files
- **Reproducible Builds** - Lock file system for consistent deployments
- **Security Scanning** - Built-in security advisory checks

## 🛠️ Technical Improvements

### ES Module Consistency

- Full ES2022 module support
- Proper `.js` extensions in all imports
- Node.js 20.19.0+ requirement for modern features

### Error Handling

- Comprehensive error messages with actionable guidance
- Graceful fallbacks for network issues
- Detailed logging and debugging support

### Testing & Quality

- 148 passing tests across all components
- Full TypeScript coverage
- ESLint configuration for code quality
- Automated CI/CD pipeline

## 📦 Template Completeness

### All Templates Now Include:

- ✅ `.env.example` - Environment configuration templates
- ✅ `README.md` - Comprehensive documentation
- ✅ `.gitignore` - Proper version control exclusions
- ✅ TypeScript configuration where applicable

### Hero Templates Additionally Include:

- ✅ `Dockerfile` - Production containerization
- ✅ `docker-compose.yml` - Database and service orchestration
- ✅ Security configurations (Helmet, CORS, etc.)
- ✅ Health checks and monitoring setup

## 🔧 Breaking Changes

### CLI Interface

- Removed deprecated `--template-version` flag (use `template@version` format)
- Changed default package manager preference to Bun > pnpm > yarn > npm
- Updated minimum Node.js requirement to 20.19.0+

### Template Structure

- Moved from CommonJS to ES modules in generated projects
- Updated dependency versions to latest stable releases
- Standardized directory structures across templates

## 📈 Performance Improvements

- **50% faster** template generation with parallel file operations
- **Reduced bundle size** through tree-shaking and ES modules
- **Improved startup time** with lazy loading of heavy dependencies
- **Better caching** for remote template downloads

## 🐛 Bug Fixes

- Fixed template token replacement in nested directories
- Resolved package manager detection on Windows
- Fixed git initialization in projects with existing .git folders
- Corrected TypeScript path resolution in generated projects

## 📚 Documentation

### New Documentation

- Complete API reference for all CLI commands
- Template development guide
- Security best practices
- Deployment guides for major platforms

### Updated Documentation

- Getting started guide with new templates
- Contributing guidelines
- Security policy and vulnerability reporting

## 🚀 Deployment & Distribution

### New Distribution Methods

- **Homebrew** - `brew install peezy`
- **Scoop** (Windows) - `scoop install peezy`
- **Direct Download** - Pre-built binaries for all platforms
- **npm** - `npm install -g peezy-cli`

### Automated Releases

- GitHub Actions workflow for automated releases
- Sigstore signing for all release artifacts
- Automated changelog generation
- Cross-platform binary builds

## 🔮 What's Next

### v1.1.0 Roadmap

- Plugin system for custom template processors
- Template marketplace integration
- Advanced database migration tools
- Kubernetes deployment templates

### Community

- Template contribution guidelines
- Community template registry
- Discord server for support and discussions

## 🙏 Acknowledgments

Special thanks to all beta testers and contributors who helped make this release possible. Your feedback and contributions have been invaluable in reaching this milestone.

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/Sehnya/peezy-cli/wiki)
- **Issues**: [GitHub Issues](https://github.com/Sehnya/peezy-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sehnya/peezy-cli/discussions)

---

**Full Changelog**: https://github.com/Sehnya/peezy-cli/compare/v0.1.6...v1.0.0
