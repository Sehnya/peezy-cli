# Contributing to Peezy CLI

Thank you for your interest in contributing to Peezy CLI! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/peezy-cli.git
   cd peezy-cli
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```
5. **Link for local testing**:
   ```bash
   npm run link:global
   ```

## 🌟 Ways to Contribute

### 🐛 Bug Reports

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- Include reproduction steps, environment details, and error logs
- Search existing issues first to avoid duplicates

### ✨ Feature Requests

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml)
- Describe the problem you're solving and proposed solution
- Consider the impact on existing users

### 📋 Template Requests

- Use the [Template Request template](.github/ISSUE_TEMPLATE/template_request.yml)
- Specify the framework, runtime, and desired features
- Provide examples of similar templates

### 🔄 Version Updates

- Use the [Version Update template](.github/ISSUE_TEMPLATE/version_update.yml)
- Check for breaking changes and security implications
- Test thoroughly before submitting

## 🔧 Development Workflow

### Branch Strategy

We use a **Git Flow** inspired branching strategy:

- `main` - Production-ready code, tagged releases
- `develop` - Integration branch for features
- `feature/*` - New features and enhancements
- `bugfix/*` - Bug fixes for develop branch
- `hotfix/*` - Critical fixes for production
- `release/*` - Release preparation

### Branch Naming Convention

```
feature/add-nextjs-template
bugfix/fix-vite-config-generation
hotfix/security-vulnerability-fix
release/v0.2.0
version/update-react-18.3.0
template/vue-typescript-pinia
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**

```
feat(templates): add Next.js with TypeScript template

Add a new template for Next.js projects with TypeScript,
Tailwind CSS, and ESLint configuration.

Closes #123

fix(cli): resolve path resolution issue on Windows

The path separator was causing issues on Windows systems
when generating project structures.

Fixes #456

docs(readme): update installation instructions

Add npm, pnpm, and yarn installation options with
version requirements.
```

### Development Process

1. **Create a feature branch**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:

   ```bash
   npm test                    # Run unit tests
   npm run build              # Build the project
   npm run link:global        # Link for testing
   peezy create test-app      # Test CLI functionality
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat(templates): add your feature description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 📋 Adding New Templates

### Template Structure

```
templates/
├── framework-name/
│   ├── base/                 # Base template files
│   │   ├── package.json
│   │   ├── src/
│   │   └── public/
│   ├── variants/             # Template variants
│   │   ├── typescript/
│   │   ├── javascript/
│   │   └── minimal/
│   └── config.json          # Template configuration
```

### Template Configuration

```json
{
  "name": "React + Vite",
  "description": "React application with Vite bundler",
  "framework": "react",
  "bundler": "vite",
  "variants": ["typescript", "javascript"],
  "features": ["tailwind", "eslint", "prettier"],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

### Template Guidelines

- **Keep it minimal**: Include only essential dependencies
- **Follow best practices**: Use current recommended patterns
- **Test thoroughly**: Ensure generated projects work correctly
- **Document features**: Add clear README files
- **Version compatibility**: Use stable, compatible versions

## 🧪 Testing

### Running Tests

```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm test -- --coverage    # Run with coverage report
```

### Test Categories

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test CLI commands and workflows
- **Template tests**: Verify template generation and functionality
- **E2E tests**: Test complete user workflows

### Writing Tests

- Place tests in `__tests__` directories or `.test.ts` files
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies
- Aim for good coverage of new code

## 📚 Documentation

### What to Document

- New features and their usage
- Breaking changes and migration guides
- Template additions and modifications
- Configuration options
- Troubleshooting guides

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update relevant README files
- Keep documentation up-to-date

## 🔍 Code Review Process

### For Contributors

- Ensure your PR follows the template
- Respond to feedback promptly
- Keep PRs focused and reasonably sized
- Update your branch with latest changes

### Review Criteria

- **Functionality**: Does it work as intended?
- **Code quality**: Is it readable and maintainable?
- **Tests**: Are there adequate tests?
- **Documentation**: Is it properly documented?
- **Performance**: Does it impact performance?
- **Security**: Are there security implications?

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow

1. **Create release branch**: `release/vX.Y.Z`
2. **Update version**: Update package.json and changelog
3. **Test thoroughly**: Run full test suite
4. **Create PR**: Merge to main via PR
5. **Tag release**: Create Git tag and GitHub release
6. **Publish**: Automated npm publish via CI/CD

## 🎯 Project Priorities

### Current Focus Areas

1. **Template expansion**: More framework and runtime combinations
2. **Developer experience**: Improved CLI interface and error messages
3. **Version management**: Automated dependency updates
4. **Performance**: Faster project generation
5. **Testing**: Better test coverage and reliability

### Roadmap Items

- Plugin system for extensibility
- Interactive configuration wizard
- Project update/migration tools
- Cloud deployment integration
- Template marketplace

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Focus on the issue, not the person
- Follow GitHub's community guidelines

### Getting Help

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord/Slack**: Real-time community chat (if available)
- **Email**: Direct contact for sensitive issues

## 📞 Contact

- **Maintainer**: Sehnya
- **Repository**: https://github.com/Sehnya/peezy-cli
- **Issues**: https://github.com/Sehnya/peezy-cli/issues
- **Discussions**: https://github.com/Sehnya/peezy-cli/discussions

Thank you for contributing to Peezy CLI! 🚀
