# Requirements Document

## Introduction

Peezy is a cross-runtime terminal tool that scaffolds opinionated starter applications for JavaScript (Bun/Node), Python (Flask/FastAPI), and front-end frameworks (React/Vite, Vue/Vite), with built-in Tailwind CSS options. The tool provides zero-network scaffolding by shipping with embedded templates and offers a streamlined one-command user experience with intelligent prompting for missing arguments.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to quickly scaffold new projects from predefined templates, so that I can start coding immediately without manual setup.

#### Acceptance Criteria

1. WHEN I run `peezy new <template> <name>` THEN the system SHALL create a new project directory with the specified template
2. WHEN I provide a template name that exists THEN the system SHALL copy all template files to the destination directory
3. WHEN I provide a project name THEN the system SHALL replace all `__APP_NAME__` and `__PKG_NAME__` tokens in the template files
4. WHEN the destination directory already exists and is not empty THEN the system SHALL throw an error and not overwrite existing files

### Requirement 2

**User Story:** As a developer, I want to see all available templates, so that I can choose the right starting point for my project.

#### Acceptance Criteria

1. WHEN I run `peezy list` THEN the system SHALL display all available templates with their descriptions
2. WHEN displaying templates THEN the system SHALL show the template key and human-readable title
3. WHEN no templates are available THEN the system SHALL display an appropriate message

### Requirement 3

**User Story:** As a developer, I want interactive prompts when I don't provide all required arguments, so that I can complete the scaffolding process without restarting the command.

#### Acceptance Criteria

1. WHEN I run `peezy new` without arguments THEN the system SHALL prompt me to select a template
2. WHEN selecting a template THEN the system SHALL show popular templates first in the selection list
3. WHEN I don't provide a project name THEN the system SHALL prompt me for a project name with validation
4. WHEN I don't specify a package manager THEN the system SHALL prompt me to choose from bun, npm, pnpm, or yarn with popular options highlighted
5. WHEN I don't specify installation preferences THEN the system SHALL prompt me whether to install dependencies
6. WHEN I don't specify git preferences THEN the system SHALL prompt me whether to initialize a git repository
7. WHEN I cancel any prompt THEN the system SHALL exit gracefully with a cancellation message

### Requirement 4

**User Story:** As a developer, I want automatic dependency installation, so that my project is ready to run immediately after scaffolding.

#### Acceptance Criteria

1. WHEN I choose to install dependencies THEN the system SHALL run the appropriate package manager install command
2. WHEN using bun as package manager THEN the system SHALL run `bun install`
3. WHEN using npm as package manager THEN the system SHALL run `npm install`
4. WHEN using pnpm as package manager THEN the system SHALL run `pnpm install`
5. WHEN using yarn as package manager THEN the system SHALL run `yarn`
6. WHEN dependency installation fails THEN the system SHALL display a warning but continue with the scaffolding process
7. WHEN I use the `--no-install` flag THEN the system SHALL skip dependency installation

### Requirement 5

**User Story:** As a developer, I want automatic git repository initialization, so that I can start version control immediately.

#### Acceptance Criteria

1. WHEN I choose to initialize git THEN the system SHALL run `git init` in the project directory
2. WHEN git is initialized THEN the system SHALL add all files with `git add .`
3. WHEN files are added THEN the system SHALL create an initial commit with message "chore: scaffold with peezy"
4. WHEN git initialization fails THEN the system SHALL display a warning but continue with the scaffolding process
5. WHEN I use the `--no-git` flag THEN the system SHALL skip git initialization

### Requirement 6

**User Story:** As a developer, I want support for multiple project templates, so that I can scaffold different types of applications.

#### Acceptance Criteria

1. WHEN the system is installed THEN it SHALL support bun-react-tailwind template
2. WHEN the system is installed THEN it SHALL support vite-vue-tailwind template
3. WHEN the system is installed THEN it SHALL support flask template
4. WHEN the system is installed THEN it SHALL support fastapi template
5. WHEN the system is installed THEN it SHALL support flask-bun-hybrid template
6. WHEN I select any supported template THEN the system SHALL scaffold the project with the correct file structure and dependencies

### Requirement 7

**User Story:** As a developer, I want the CLI to work offline, so that I can scaffold projects without internet connectivity.

#### Acceptance Criteria

1. WHEN the CLI is installed THEN all templates SHALL be embedded within the package
2. WHEN I run any peezy command THEN the system SHALL NOT require network access for template retrieval
3. WHEN templates are accessed THEN they SHALL be loaded from the local templates directory

### Requirement 8

**User Story:** As a developer, I want clear feedback during the scaffolding process, so that I understand what's happening and can troubleshoot issues.

#### Acceptance Criteria

1. WHEN scaffolding starts THEN the system SHALL display what template and project name are being used
2. WHEN files are created THEN the system SHALL display a success message with the project directory
3. WHEN dependencies are installed THEN the system SHALL display a success message
4. WHEN git is initialized THEN the system SHALL display a success message
5. WHEN the process completes THEN the system SHALL display next steps including cd command and dev command
6. WHEN errors occur THEN the system SHALL display clear error messages with appropriate color coding
7. WHEN displaying colored output THEN the system SHALL use colors that work well in both light and dark terminal themes

### Requirement 9

**User Story:** As a developer, I want the CLI to be installable via npm, so that I can easily add it to my development environment.

#### Acceptance Criteria

1. WHEN I run `npm i -g peezy-cli` THEN the system SHALL install the CLI globally
2. WHEN installed globally THEN the `peezy` command SHALL be available in my terminal
3. WHEN the package is published THEN it SHALL include all necessary files and templates
4. WHEN I run `peezy --help` THEN the system SHALL display usage information and available commands

### Requirement 10

**User Story:** As a developer, I want proper token replacement in template files, so that my project has the correct naming throughout.

#### Acceptance Criteria

1. WHEN processing template files THEN the system SHALL replace all instances of `__APP_NAME__` with the provided project name
2. WHEN processing template files THEN the system SHALL replace all instances of `__PKG_NAME__` with a kebab-case version of the project name
3. WHEN the project name contains special characters THEN the system SHALL sanitize them for package name usage
4. WHEN token replacement occurs THEN it SHALL apply to all text files in the template directory recursively

### Requirement 11

**User Story:** As a developer, I want to see popular templates highlighted in prompts, so that I can quickly choose commonly used project types.

#### Acceptance Criteria

1. WHEN I run `peezy new` without arguments THEN popular templates SHALL be shown first in the selection list
2. WHEN displaying template choices THEN popular templates SHALL be visually distinguished with indicators like ⭐ or 🔥
3. WHEN templates are marked as popular THEN they SHALL be grouped at the top of the selection list
4. WHEN the system determines popularity THEN it SHALL be based on common use cases (React, Vue, Flask being most popular)
