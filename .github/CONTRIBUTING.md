# Contributing to Peezy CLI

Thank you for your interest in contributing to Peezy CLI! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/peezy-cli.git
   cd peezy-cli
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Run tests**
   ```bash
   npm test
   ```
5. **Build the project**
   ```bash
   npm run build
   ```

## 📋 Development Workflow

### Branch Strategy

- `main` - Production-ready code, protected branch
- `develop` - Integration branch for features (if used)
- `feature/feature-name` - Feature development
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation updates

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   npm test                    # Run all tests
   npm run build              # Build TypeScript
   npm run pre-flight         # Run pre-flight checks
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 Contribution Areas

### 🚀 Hero Templates

- Add new curated full-stack templates
- Improve existing template structures
- Ensure proper directory organization (components/, pages/, public/)

### 🔄 Migration System

- Enhance template diffing algorithms
- Improve conflict resolution
- Add new migration strategies

### 📦 Distribution

- Support new package managers
- Improve cross-platform compatibility
- Enhance installation methods

### 🔐 Security

- Improve Sigstore integration
- Enhance trust policy management
- Add security audit features

### 🧪 Testing

- Add test coverage for new features
- Improve existing test suites
- Add integration tests

## 📝 Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use ES modules with `.js` extensions in imports
- Follow existing naming conventions

### File Organization

```
src/
├── commands/          # CLI command implementations
├── actions/           # Reusable business logic
├── services/          # Service classes
├── utils/             # Utility functions
├── types.ts           # Type definitions
└── index.ts           # Main CLI entry point
```

### Template Structure

All hero templates must include:

```
template-name/
├── src/
│   ├── components/    # UI components
│   ├── pages/         # Page components
│   └── ...
├── public/            # Static assets
├── package.json       # Dependencies and scripts
└── README.md          # Template documentation
```

## 🧪 Testing Guidelines

### Test Types

- **Unit tests** - Test individual functions and components
- **Integration tests** - Test CLI commands and workflows
- **Template tests** - Verify template structure and functionality

### Writing Tests

```typescript
describe("Feature Name", () => {
  test("should do something specific", () => {
    // Arrange
    const input = "test input";

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe("expected output");
  });
});
```

### Running Tests

```bash
npm test                    # All tests
npm run test:watch         # Watch mode
npm test -- --testNamePattern="specific test"
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include examples in complex functions
- Document breaking changes

### README Updates

- Update feature lists for new functionality
- Add examples for new commands
- Keep installation instructions current

### Template Documentation

Each template should include:

- Setup instructions
- Development commands
- Architecture overview
- Customization guide

## 🔍 Pull Request Process

### Before Submitting

- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Template structures verified

### PR Requirements

- **Descriptive title** following conventional commits
- **Detailed description** of changes
- **Test coverage** for new features
- **Documentation updates** as needed

### Review Process

1. **Automated checks** must pass (CI, tests, linting)
2. **Code review** by maintainers
3. **Template verification** for template changes
4. **Security review** for security-related changes

## 🚨 Security Guidelines

### Reporting Security Issues

- **Do not** open public issues for security vulnerabilities
- Email security concerns to: [security@peezy.dev]
- Include detailed reproduction steps

### Security Best Practices

- Validate all user inputs
- Use secure defaults
- Follow principle of least privilege
- Keep dependencies updated

## 🎨 Template Guidelines

### Hero Template Requirements

- **Complete functionality** - Working examples, not just boilerplate
- **Modern patterns** - Latest best practices and conventions
- **Proper structure** - components/, pages/, public/ directories
- **Documentation** - Clear setup and customization instructions
- **Testing setup** - Include testing framework and examples

### Template Checklist

- [ ] package.json with correct dependencies
- [ ] Proper directory structure
- [ ] Working development server
- [ ] Build configuration
- [ ] README with setup instructions
- [ ] Example components and pages
- [ ] Styling setup (Tailwind CSS preferred)
- [ ] TypeScript configuration (if applicable)

## 🐛 Bug Reports

### Before Reporting

- Check existing issues
- Test with latest version
- Reproduce with minimal example

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**

1. Run command X
2. See error Y

**Expected Behavior**
What should happen

**Environment**

- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 20.10.0]
- Peezy CLI: [e.g., 1.0.0]
```

## 💡 Feature Requests

### Before Requesting

- Check existing issues and discussions
- Consider if it fits the project scope
- Think about implementation complexity

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other approaches you've considered
```

## 📞 Getting Help

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Check README and guides first

## 🙏 Recognition

Contributors are recognized in:

- Release notes for significant contributions
- README contributors section
- GitHub contributor graphs

Thank you for contributing to Peezy CLI! 🚀
