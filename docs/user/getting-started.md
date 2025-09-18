# Getting Started with Peezy CLI

Welcome to Peezy CLI! This guide will help you get up and running quickly with the most powerful project scaffolding tool for modern development.

## 🚀 Installation

### Recommended: Native Binaries (No Node.js Required)

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

#### Universal Installer

```bash
curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash
```

### Alternative: npm

```bash
# Install globally via npm
npm install -g peezy-cli

# Or use with npx (no installation required)
npx peezy-cli new
```

### Verify Installation

```bash
peezy --version  # Should show 1.0.0
peezy --help     # See all available commands
```

## 🎯 Quick Start

### Create Your First Project

#### Hero Templates (Recommended)

```bash
# Complete Next.js full-stack app
peezy new nextjs-fullstack my-startup

# Express + React full-stack
peezy new express-fullstack my-api

# Advanced React SPA
peezy new react-spa-advanced my-dashboard
```

#### Interactive Mode

```bash
# Guided setup with smart recommendations
peezy new
```

### What You Get

Each hero template includes:

- ✅ **Complete directory structure** (components/, pages/, public/)
- ✅ **Working examples** and demo functionality
- ✅ **Modern tooling** and best practices
- ✅ **Development server** ready to run
- ✅ **Production build** configuration
- ✅ **Testing setup** with examples

## 📋 Essential Commands

### Project Creation

```bash
peezy new                           # Interactive mode
peezy new <template> <name>         # Direct creation
peezy list                          # Show available templates
```

### Project Management

```bash
peezy migrate --dry-run             # Preview project updates
peezy migrate --interactive         # Update project safely
peezy doctor                        # Health check
```

### Information

```bash
peezy --version                     # Show version
peezy --help                        # Show help
peezy list --json                   # JSON output for automation
```

## 🎨 Available Templates

### 🚀 Hero Templates (Curated Full-Stack)

#### `nextjs-fullstack` - The Complete Package

- Next.js 14 with App Router and TypeScript
- Authentication with NextAuth.js
- Database with PostgreSQL and Drizzle ORM
- Modern UI with Tailwind CSS and Headless UI

#### `express-fullstack` - Full-Stack Powerhouse

- Express.js backend with TypeScript
- React frontend with Vite
- Shared authentication with JWT
- Database integration with Drizzle ORM

#### `react-spa-advanced` - Modern React Excellence

- Advanced React SPA with modern features
- State management with Zustand
- Data fetching with TanStack Query
- Testing with Vitest and Testing Library

### 📦 Classic Templates

- `nextjs-app-router` - Next.js 14 + App Router + Tailwind
- `express-typescript` - Express.js + TypeScript API
- `bun-react-tailwind` - Bun + React + Vite + Tailwind
- `vite-vue-tailwind` - Vue + Vite + Tailwind
- `flask` - Python Flask API/App
- `fastapi` - Python FastAPI
- `flask-bun-hybrid` - Flask backend + Bun frontend

## 🔧 Configuration Options

### Package Managers

```bash
peezy new <template> <name> --pm npm     # Use npm
peezy new <template> <name> --pm bun     # Use Bun (default)
peezy new <template> <name> --pm pnpm    # Use pnpm
peezy new <template> <name> --pm yarn    # Use yarn
```

### Setup Options

```bash
--no-install                        # Skip dependency installation
--no-git                           # Skip git initialization
--json                             # JSON output for automation
```

### Database Integration

```bash
--databases postgresql,redis        # Add databases
--orm drizzle                      # Choose ORM (prisma|drizzle|both)
--volumes preconfigured            # Docker volume setup
```

## 💡 Example Workflows

### Complete Startup Stack

```bash
# Create full-stack app with auth and database
peezy new nextjs-fullstack my-startup
cd my-startup
npm run dev  # Full-stack app ready!
```

### API + Dashboard Combo

```bash
# Create Express + React full-stack
peezy new express-fullstack my-platform
cd my-platform
npm run dev  # Concurrent backend + frontend
```

### Modern SPA

```bash
# Create advanced React SPA
peezy new react-spa-advanced my-dashboard
cd my-dashboard
npm run dev  # Modern SPA with all features
```

## 🔍 Next Steps

1. **Explore Templates**: Try different hero templates to see what fits your needs
2. **Read Template Docs**: Each template includes detailed README with setup instructions
3. **Learn Migration**: Use `peezy migrate` to update existing projects
4. **Join Community**: Check out GitHub Discussions for tips and community support

## 📚 Learn More

- **[Hero Templates Guide](hero-templates.md)** - Detailed template documentation
- **[Migration Guide](migration.md)** - How to update existing projects
- **[CLI Reference](cli-reference.md)** - Complete command documentation
- **[Security Guide](security.md)** - Security features and best practices

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/Sehnya/peezy-cli/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/Sehnya/peezy-cli/discussions)
- **Documentation**: Browse these docs for detailed information

---

Ready to build something amazing? Start with a hero template and see the magic happen! ✨
