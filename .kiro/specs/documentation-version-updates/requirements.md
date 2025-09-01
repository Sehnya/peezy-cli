# Requirements Document

## Introduction

This feature addresses critical documentation inconsistencies and outdated version requirements in the Peezy CLI tool. The current documentation contains conflicting information about package manager support, outdated Node.js and Python version requirements, and inconsistent examples that could confuse users. This update will ensure accurate, up-to-date documentation that reflects current best practices and supported versions.

## Requirements

### Requirement 1

**User Story:** As a developer using Peezy CLI, I want accurate package manager documentation so that I understand which options are actually supported for each template type.

#### Acceptance Criteria

1. WHEN a user reads the README options section THEN the package manager list SHALL only include supported options (bun|npm|pnpm|yarn)
2. WHEN a user sees Flask template examples THEN the examples SHALL NOT reference unsupported --pm pip option
3. IF a Python template is scaffolded THEN the documentation SHALL clearly indicate that Python dependencies must be installed separately
4. WHEN a user follows Flask setup instructions THEN they SHALL be directed to run `pip install -r requirements.txt` manually after scaffolding

### Requirement 2

**User Story:** As a developer setting up a development environment, I want accurate Node.js version requirements so that I can ensure compatibility with the latest tooling.

#### Acceptance Criteria

1. WHEN the README specifies Node.js requirements THEN it SHALL reflect the minimum version required by Vite 6 (Node 20.19+ / 22.12+)
2. IF templates use Vite 6 THEN the Node.js requirement SHALL be updated to 20.19.0 or higher
3. WHEN a user checks system requirements THEN they SHALL see current, supported Node.js versions only
4. IF Node.js 18 is no longer supported by Vite THEN it SHALL be removed from documentation

### Requirement 3

**User Story:** As a developer working with Python templates, I want current Python version recommendations so that I avoid using end-of-life versions.

#### Acceptance Criteria

1. WHEN the README specifies Python requirements THEN it SHALL recommend Python 3.10+ instead of 3.8+
2. IF Python 3.8 has reached EOL THEN it SHALL be removed from supported versions
3. WHEN template READMEs specify Python versions THEN they SHALL use 3.10+ consistently
4. IF Python 3.9 is approaching EOL THEN the documentation SHALL recommend 3.10+ for longevity

### Requirement 4

**User Story:** As a maintainer of Peezy CLI, I want a systematic approach to keeping version requirements current so that documentation stays accurate over time.

#### Acceptance Criteria

1. WHEN version requirements are updated THEN all documentation files SHALL be updated consistently
2. IF a new major version of a dependency is released THEN there SHALL be a process to evaluate and update requirements
3. WHEN EOL dates approach for supported versions THEN the documentation SHALL be proactively updated
4. IF version conflicts exist between templates THEN they SHALL be identified and resolved

### Requirement 5

**User Story:** As a user following examples in the documentation, I want consistent and working examples so that I can successfully use the CLI tool.

#### Acceptance Criteria

1. WHEN examples show CLI usage THEN they SHALL only use supported options and flags
2. IF an example includes package manager flags THEN they SHALL match the supported pm options
3. WHEN Flask examples are shown THEN they SHALL demonstrate the correct post-scaffold setup process
4. IF template-specific setup is required THEN examples SHALL clearly indicate the additional steps needed
