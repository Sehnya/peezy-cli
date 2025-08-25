# Implementation Plan

- [x] 1. Set up project structure and core configuration
  - Create package.json with proper dependencies and scripts
  - Set up TypeScript configuration for ES2022 modules
  - Create bin/peezy.mjs executable wrapper
  - Set up basic directory structure (src/, templates/)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Implement core type definitions and interfaces
  - Create src/types.ts with TemplateKey union type and NewOptions interface
  - Define template registry interface and package manager types
  - Set up proper TypeScript exports for all interfaces
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 3. Create utility modules for logging and file operations
  - Implement src/utils/logger.ts with colored console output methods using light/dark theme compatible colors
  - Create src/utils/fsx.ts with copyDir and replaceTokens functions
  - Add proper error handling and validation in file operations
  - Write unit tests for utility functions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 10.1, 10.2, 10.3, 10.4_

- [x] 4. Build template registry system
  - Create src/registry.ts with template definitions and path resolution
  - Implement template discovery and validation logic
  - Add support for all required templates (bun-react-tailwind, vite-vue-tailwind, flask, fastapi, flask-bun-hybrid)
  - Mark popular templates (bun-react-tailwind, vite-vue-tailwind, flask) with popular flag
  - Write tests for template registry functionality
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 11.1, 11.2, 11.3, 11.4_

- [x] 5. Implement core scaffolding engine
  - Create src/actions/scaffold.ts with main scaffolding logic
  - Implement directory validation and creation
  - Add recursive file copying with proper error handling
  - Implement token replacement system for **APP_NAME** and **PKG_NAME**
  - Write comprehensive tests for scaffolding functionality
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 10.1, 10.2, 10.3, 10.4_

- [x] 6. Create package manager integration
  - Implement src/actions/install.ts with support for npm, yarn, pnpm, and bun
  - Add proper command execution with child process handling
  - Implement error handling that warns but doesn't fail the entire process
  - Write tests for package manager command generation and execution
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 7. Implement git repository initialization
  - Create src/actions/git.ts with git init, add, and commit functionality
  - Add proper error handling for git command failures
  - Implement sequential git operations (init → add → commit)
  - Write tests for git integration functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Build CLI interface and command handling
  - Create src/index.ts with Commander.js setup
  - Implement 'list' command to display available templates
  - Add 'new' command with argument parsing and option handling
  - Integrate interactive prompts using prompts library with popular templates shown first
  - Add visual indicators (⭐ or 🔥) for popular templates in selection lists
  - Add proper command validation and help text
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.4, 11.1, 11.2, 11.3, 11.4_

- [x] 9. Create template files for all supported project types
  - Create templates/bun-react-tailwind/ with Vite + React + Tailwind setup
  - Create templates/vite-vue-tailwind/ with Vue + Vite + Tailwind setup
  - Create templates/flask/ with Python Flask application structure
  - Create templates/fastapi/ with FastAPI application structure
  - Create templates/flask-bun-hybrid/ with Flask backend and Bun frontend
  - Ensure all templates include proper token placeholders
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 10.1, 10.2_

- [x] 10. Integrate all components and implement main workflow
  - Wire together CLI commands with scaffolding engine
  - Implement complete project creation workflow (scaffold → install → git)
  - Add proper error handling and user feedback throughout the process
  - Ensure offline functionality by using embedded templates
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Add comprehensive error handling and validation
  - Implement destination directory validation (existing, non-empty check)
  - Add template validation and clear error messages
  - Handle external command failures gracefully
  - Add input validation for project names and template keys
  - Write tests for all error scenarios
  - _Requirements: 1.4, 8.6, 4.6, 5.4_

- [x] 12. Write comprehensive test suite
  - Create unit tests for all utility functions and core logic
  - Add integration tests for complete scaffolding workflows
  - Test all template types with different configuration options
  - Add tests for error handling and edge cases
  - Ensure cross-platform compatibility testing
  - _Requirements: All requirements validation through automated testing_

- [x] 13. Set up build and distribution configuration
  - Configure TypeScript compilation to dist/ directory
  - Set up npm scripts for build, dev, and publish workflows
  - Ensure proper file inclusion in package.json for npm publishing
  - Test global installation and CLI availability
  - Verify all templates are included in published package
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 7.1, 7.2, 7.3_
