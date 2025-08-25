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
peezy new flask my-api --pm npm --no-git
```

### Available Commands

```bash
# List all available templates
peezy list

# Create new project (interactive)
peezy new

# Create with specific template
peezy new <template> <name> [options]
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

# Create a Flask API
peezy new flask my-api --pm pip

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

- Node.js 18.0.0 or higher
- Git (optional, for repository initialization)
- Python 3.8+ (for Python templates)

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
