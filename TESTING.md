# Testing Guide

This document outlines the testing strategy and guidelines for Peezy CLI.

## Test Structure

```
src/
├── __tests__/           # Unit tests
├── plugins/
│   └── version-scrubbing/
│       └── __tests__/   # Plugin-specific tests
└── ...
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- utils.test.ts
```

## Test Categories

### 1. Unit Tests

- Test individual functions and utilities
- Located in `src/__tests__/`
- Focus on pure functions and business logic

### 2. Integration Tests

- Test CLI commands and workflows
- Test template generation
- Test plugin functionality

### 3. Plugin Tests

- Version scrubbing plugin tests
- Located in `src/plugins/version-scrubbing/__tests__/`
- Test version checking, security advisories, etc.

## Writing Tests

### Basic Test Structure

```typescript
describe("Feature Name", () => {
  describe("specific functionality", () => {
    it("should do something specific", () => {
      // Arrange
      const input = "test-input";

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe("expected-output");
    });
  });
});
```

### Testing CLI Commands

```typescript
import { execSync } from "child_process";

describe("CLI Commands", () => {
  it("should display version", () => {
    const output = execSync("peezy --version", { encoding: "utf8" });
    expect(output.trim()).toMatch(/\d+\.\d+\.\d+/);
  });
});
```

## Test Guidelines

### ✅ Do

- Write descriptive test names
- Test both success and error cases
- Use meaningful assertions
- Mock external dependencies
- Keep tests focused and isolated

### ❌ Don't

- Test implementation details
- Write overly complex tests
- Ignore test failures
- Skip edge cases
- Test multiple things in one test

## Mocking

### File System Operations

```typescript
import { jest } from "@jest/globals";

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}));
```

### Network Requests

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ version: "1.0.0" }),
  })
) as jest.Mock;
```

## CI/CD Integration

Tests are automatically run in GitHub Actions:

- On every push to main branch
- On every pull request
- Multiple Node.js versions (18.x, 20.x)

## Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: Cover all CLI commands
- **Plugin Tests**: >90% coverage for plugins

## Debugging Tests

```bash
# Run tests with debugging
npm test -- --verbose

# Run single test file with debugging
npm test -- --verbose utils.test.ts

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Performance Testing

For performance-critical features:

```typescript
describe("Performance Tests", () => {
  it("should generate template quickly", () => {
    const start = Date.now();
    generateTemplate("react");
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // Should complete in <1s
  });
});
```

## Contributing Tests

When contributing:

1. Add tests for new features
2. Update tests for modified functionality
3. Ensure all tests pass before submitting PR
4. Include both positive and negative test cases
5. Document complex test scenarios

## Test Data

Use consistent test data:

```typescript
const TEST_TEMPLATES = {
  react: "bun-react-tailwind",
  vue: "vite-vue-tailwind",
  flask: "flask",
};

const TEST_CONFIG = {
  name: "test-project",
  template: "react",
  packageManager: "npm",
};
```

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase timeout for async operations
2. **File system errors**: Ensure proper cleanup in tests
3. **Network errors**: Mock external API calls
4. **Version conflicts**: Use exact versions in test dependencies

### Getting Help

- Check existing tests for examples
- Review Jest documentation
- Ask in GitHub discussions
- Check CI logs for detailed error messages
