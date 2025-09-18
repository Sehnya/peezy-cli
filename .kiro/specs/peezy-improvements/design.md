# Design Document

## Overview

This design document outlines the implementation approach for completing and improving the Peezy CLI tool. The design focuses on systematic completion of missing templates, refinement of the version scrubbing plugin, documentation updates, and overall project quality improvements.

## Architecture

### Template System Enhancement

The existing template system will be extended with two new templates following the established patterns:

- **Template Structure**: Each template follows the standard directory structure with proper token replacement
- **Configuration Integration**: Templates are registered in `src/registry.ts` with appropriate metadata
- **Token Replacement**: Uses the existing `__APP_NAME__` and `__PKG_NAME__` token system plus new `{{name}}` variants

### Version Scrubbing Plugin Architecture

The plugin consists of several key components that need refinement:

- **MCP Server**: Entry point that handles tool requests and manages the service lifecycle
- **Version Monitoring Service**: Orchestrates different version checkers and aggregates results
- **Framework Version Checker**: New comprehensive checker for npm and PyPI packages
- **Rate Limiting**: Improved backoff strategies and request management

### Documentation System

Documentation updates will ensure consistency between implementation and documentation:

- **Automated Validation**: Tests verify that documented examples use valid templates and flags
- **Template Registry Sync**: README automatically reflects available templates
- **CLI Flag Documentation**: All supported flags are properly documented with examples

## Components and Interfaces

### Template Components

#### Next.js App Router Template

```typescript
interface NextJSTemplate {
  structure: {
    app: string[]; // App router pages and layouts
    components: string[]; // Reusable React components
    lib: string[]; // Utility functions and configurations
    public: string[]; // Static assets
    styles: string[]; // Tailwind CSS and global styles
  };
  dependencies: {
    runtime: string[]; // Next.js, React, TypeScript
    development: string[]; // ESLint, Prettier, dev tools
    styling: string[]; // Tailwind CSS and plugins
  };
  configuration: {
    nextConfig: object; // Next.js configuration
    tailwindConfig: object; // Tailwind CSS configuration
    tsConfig: object; // TypeScript configuration
  };
}
```

#### Express TypeScript Template

```typescript
interface ExpressTemplate {
  structure: {
    src: string[]; // Source code organization
    routes: string[]; // API route definitions
    middleware: string[]; // Express middleware
    types: string[]; // TypeScript type definitions
    tests: string[]; // Test files
  };
  dependencies: {
    runtime: string[]; // Express, TypeScript runtime
    development: string[]; // Dev tools, testing framework
    types: string[]; // Type definitions
  };
  configuration: {
    tsConfig: object; // TypeScript configuration
    eslintConfig: object; // Linting configuration
    jestConfig: object; // Testing configuration
  };
}
```

### Version Checker Components

#### Framework Version Checker Interface

```typescript
interface FrameworkChecker {
  checkVersion(): Promise<CheckResult>;
  parseVersion(versionString: string): string;
  getChangelogUrl(version: string): string;
  getUpdateCommand(version: string): string;
  getSupportedFrameworks(): string[];
}
```

#### Rate Limiting Strategy

```typescript
interface RateLimitStrategy {
  maxRequests: number;
  windowMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  shouldBackoff(error: Error): boolean;
  calculateBackoff(attempt: number): number;
}
```

### MCP Server Interface

```typescript
interface MCPServerTools {
  check_versions: (
    technologies: string[],
    includePrerelease: boolean
  ) => Promise<VersionResult[]>;
  get_security_advisories: (
    technologies: string[],
    severity: string
  ) => Promise<SecurityAdvisory[]>;
  analyze_updates: (
    currentVersions: Record<string, string>,
    strategy: string
  ) => Promise<UpdateAnalysis>;
  generate_report: (
    format: string,
    includeRecommendations: boolean
  ) => Promise<string>;
  get_supported_technologies: () => Promise<SupportedTechnologies>;
}
```

## Data Models

### Template Metadata

```typescript
interface TemplateMetadata {
  title: string;
  path: string;
  popular: boolean;
  description?: string;
  tags?: string[];
  dependencies?: {
    node?: string;
    npm?: string;
    python?: string;
  };
}
```

### Version Information

```typescript
interface VersionInfo {
  name: string;
  current: string;
  latest: string;
  latestStable: string;
  securityAdvisories: SecurityAdvisory[];
  breakingChanges: BreakingChange[];
  releaseNotes: string;
  publishedAt?: Date;
}
```

### Framework Configuration

```typescript
interface FrameworkConfig {
  displayName: string;
  packageName: string;
  packageManager: "npm" | "pypi";
  apiEndpoint: string;
  changelogUrl?: string;
  releaseNotesUrl?: string;
}
```

## Error Handling

### Template Creation Errors

- **Missing Dependencies**: Graceful fallback when package managers are unavailable
- **File System Errors**: Proper cleanup on partial template creation
- **Token Replacement Errors**: Validation of token patterns before replacement

### Version Checking Errors

- **Network Failures**: Retry logic with exponential backoff
- **Rate Limiting**: Intelligent backoff based on response headers
- **API Changes**: Fallback strategies when API responses change format
- **Parsing Errors**: Robust version string parsing with fallbacks

### MCP Server Errors

- **Tool Execution Errors**: Proper error serialization for MCP protocol
- **Service Initialization**: Graceful degradation when services fail to start
- **Configuration Errors**: Clear error messages for invalid configurations

## Testing Strategy

### Template Testing

- **Structure Validation**: Verify all required files and directories are created
- **Token Replacement**: Ensure all tokens are properly replaced in generated files
- **Dependency Installation**: Test that generated projects can install dependencies
- **Build Process**: Verify that generated projects can build successfully

### Version Checker Testing

- **Unit Tests**: Mock HTTP responses to test parsing and error handling
- **Integration Tests**: Test against real APIs with rate limiting considerations
- **Error Scenarios**: Test network failures, rate limits, and malformed responses
- **Performance Tests**: Ensure efficient handling of multiple concurrent requests

### Documentation Testing

- **Example Validation**: Automated tests verify all documented examples work
- **Template Registry Sync**: Tests ensure README reflects actual available templates
- **CLI Flag Coverage**: Verify all implemented flags are documented

### MCP Server Testing

- **Tool Functionality**: Test each MCP tool with various input scenarios
- **Error Handling**: Verify proper error responses and logging
- **Concurrent Requests**: Test server stability under load
- **Protocol Compliance**: Ensure responses conform to MCP specification

## Implementation Phases

### Phase 1: Template Completion

1. Create Next.js App Router template structure
2. Create Express TypeScript template structure
3. Update registry and documentation
4. Add template-specific tests

### Phase 2: Framework Version Checker Refinement

1. Add comprehensive error handling
2. Implement proper rate limiting
3. Add support for additional frameworks
4. Create thorough test suite

### Phase 3: Documentation and Consistency

1. Update README with new templates and flags
2. Ensure all examples use valid templates
3. Add missing CLI flag documentation
4. Validate documentation accuracy

### Phase 4: MCP Server Optimization

1. Improve error handling and logging
2. Optimize concurrent request handling
3. Add comprehensive tool testing
4. Enhance report generation

### Phase 5: Quality Assurance

1. Run comprehensive test suite
2. Performance testing and optimization
3. Code review and refactoring
4. Final documentation review

## Security Considerations

- **Input Validation**: All user inputs are validated before processing
- **File System Access**: Template creation is restricted to designated directories
- **Network Requests**: Rate limiting prevents abuse of external APIs
- **Error Information**: Error messages don't expose sensitive system information

## Performance Considerations

- **Concurrent Processing**: Version checks can be parallelized for efficiency
- **Caching**: Implement intelligent caching for frequently requested version information
- **Memory Management**: Efficient handling of large template files and API responses
- **Network Optimization**: Minimize API calls through batching and caching strategies
