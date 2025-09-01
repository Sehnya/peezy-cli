# Peezy CLI

> Initialize projects across runtimes — instantly

A cross-runtime terminal tool that scaffolds opinionated starter applications for JavaScript (Bun/Node), Python (Flask/FastAPI), and front-end frameworks (React/Vite, Vue/Vite), with built-in Tailwind CSS options.

## Features

- 🚀 **Zero-network scaffolding** - All templates embedded, works offline
- 🎯 **Interactive prompts** - Smart defaults with popular options highlighted
- 📦 **Multi-runtime support** - Bun, Node.js, Python (Flask/FastAPI)
- 🎨 **Modern frameworks** - React, Vue with Vite and Tailwind CSS
- 🔧 **Automatic setup** - Dependency installation and git initialization
- ⭐ **Popular templates** - Highlighted for quick selection

## Installation

```bash
npm install -g peezy-cli
```

## Usage

### Quick Start

```bash
# Interactive mode - prompts for all options
peezy new

# Direct template usage
peezy new bun-react-tailwind my-app

# With options
peezy new bun-react-tailwind my-app --pm npm --no-git
```

### Available Commands

```bash
# List all available templates
peezy list

# Create new project (interactive)
peezy new

# Create with specific template
peezy new <template> <name> [options]

# Environment & project health
peezy doctor [--fix-lint] [--fix-env-examples] [--ports 3000,5173,8000]

# Typed env management
peezy env check
peezy env diff
peezy env generate            # generate .env.example from schema JSON
peezy env pull:railway        # stubbed
peezy env push:railway        # stubbed

# README/CHANGELOG generator
peezy readme [--name app] [--no-badges] [--changelog]

# Check for updates
peezy upgrade [--dry-run]
```

### Options

- `-p, --pm <pm>` - Package manager (bun|npm|pnpm|yarn)
- `--no-install` - Skip dependency installation
- `--no-git` - Skip git initialization

## Available Templates

### Frontend Templates

- **bun-react-tailwind** ⭐ - Bun + React + Vite + Tailwind CSS
- **vite-vue-tailwind** ⭐ - Vue + Vite + Tailwind CSS

### Backend Templates

- **flask** ⭐ - Python Flask API/App
- **fastapi** - Python FastAPI with modern features

### Full-Stack Templates

- **flask-bun-hybrid** - Flask backend + Bun frontend

## Examples

```bash
# Create a React app with Bun
peezy new bun-react-tailwind my-react-app

# Create a Flask API (Python dependencies installed manually)
peezy new flask my-api --no-install
cd my-api && python -m pip install -r requirements.txt

# Create a Vue app with npm
peezy new vite-vue-tailwind my-vue-app --pm npm

# Interactive mode (recommended for first-time users)
peezy new
```

## Template Features

All templates include:

- 📝 **README with setup instructions**
- 🔧 **Pre-configured build tools**
- 🎨 **Tailwind CSS** (frontend templates)
- 🌍 **Environment variable support**
- 📦 **Package manager integration**
- 🔄 **Git initialization**
- 🧪 **Development server setup**

## Requirements

- Node.js 20.19.0 or higher (required for Vite 6)
- Git (optional, for repository initialization)
- Python 3.10+ (for Python templates, 3.8-3.9 are EOL)

## Development

```bash
# Clone the repository
git clone https://github.com/Sehnya/peezy-cli.git
cd peezy-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm run link:global

# Run tests
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Sehnya](https://github.com/Sehnya)

## Changelog

### 0.1.0

- Initial release
- Support for 5 project templates
- Interactive CLI with popular template highlighting
- Automatic dependency installation and git initialization
- Cross-platform compatibility
