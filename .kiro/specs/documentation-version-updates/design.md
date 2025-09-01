# Design Document

## Overview

This design addresses critical documentation inconsistencies and outdated version requirements in the Peezy CLI tool. The solution involves updating documentation files, correcting examples, and establishing current version requirements that align with modern tooling and avoid end-of-life software versions.

## Architecture

### Documentation Structure

The documentation updates will target these key files:

- `README.md` (main project documentation)
- `templates/*/README.md` (template-specific documentation)
- `package.json` (Node.js engine requirements)

### Version Management Strategy

- **Node.js**: Update to reflect Vite 6 requirements (20.19+ / 22.12+)
- **Python**: Update to recommend 3.10+ (avoiding EOL versions 3.8-3.9)
- **Package Managers**: Clarify JavaScript-only support (bun|npm|pnpm|yarn)

## Components and Interfaces

### 1. Main README Updates

**Purpose**: Correct inconsistencies and update version requirements

**Changes Required**:

- Remove `--pm pip` from examples
- Update Node.js requirement from "18+" to "20.19.0 or higher"
- Update Python requirement from "3.8+" to "3.10+"
- Clarify Flask example to show manual pip install step
- Ensure package manager options match supported list

### 2. Template README Updates

**Purpose**: Ensure consistency across all template documentation

**Changes Required**:

- Update Python version references in Flask/FastAPI templates
- Ensure all frontend templates reflect current Node.js requirements
- Standardize setup instructions across templates

### 3. Package.json Engine Requirements

**Purpose**: Enforce Node.js version requirements at the package level

**Changes Required**:

- Update `engines.node` field to reflect minimum supported version
- Ensure consistency with documentation

### 4. Example Corrections

**Purpose**: Provide accurate, working examples

**Changes Required**:

- Remove invalid `--pm pip` usage
- Show correct Flask setup workflow
- Demonstrate proper package manager usage

## Data Models

### Version Requirements Schema

```typescript
interface VersionRequirements {
  nodejs: {
    minimum: string;
    recommended: string;
    reason: string;
  };
  python: {
    minimum: string;
    recommended: string;
    reason: string;
  };
  packageManagers: {
    supported: string[];
    scope: "javascript" | "python" | "all";
  };
}
```

### Documentation Update Targets

```typescript
interface DocumentationFile {
  path: string;
  type: "main" | "template" | "config";
  updateTargets: string[];
  validationRules: string[];
}
```

## Error Handling

### Version Compatibility Issues

- **Problem**: User has Node.js < 20.19
- **Solution**: Clear error message with upgrade instructions
- **Implementation**: Update package.json engines field

### Documentation Inconsistencies

- **Problem**: Conflicting information across files
- **Solution**: Systematic review and update of all documentation
- **Implementation**: Comprehensive file updates with validation

### Example Failures

- **Problem**: Users following outdated examples
- **Solution**: Remove invalid examples, provide correct alternatives
- **Implementation**: Example validation and correction

## Testing Strategy

### Documentation Validation

1. **Consistency Checks**: Verify version numbers match across all files
2. **Example Validation**: Test all CLI examples in documentation
3. **Link Verification**: Ensure all external links are current and valid

### Version Requirement Testing

1. **Node.js Compatibility**: Test with minimum required Node.js version
2. **Python Compatibility**: Verify Python templates work with recommended versions
3. **Package Manager Testing**: Confirm all listed package managers work correctly

### Template Testing

1. **Setup Instructions**: Follow each template's setup instructions exactly
2. **Cross-Platform Testing**: Verify instructions work on different operating systems
3. **Dependency Installation**: Test both automatic and manual installation flows

## Implementation Approach

### Phase 1: Version Requirement Updates

1. Research current version requirements for all dependencies
2. Update main README with correct Node.js and Python versions
3. Update package.json engines field
4. Update template READMEs consistently

### Phase 2: Example Corrections

1. Remove invalid `--pm pip` examples
2. Add correct Flask setup instructions
3. Validate all CLI examples
4. Ensure package manager examples are accurate

### Phase 3: Documentation Consistency

1. Review all documentation files for consistency
2. Standardize language and formatting
3. Ensure version numbers match across all files
4. Add validation to prevent future inconsistencies

### Phase 4: Validation and Testing

1. Test all examples in documentation
2. Verify setup instructions work correctly
3. Check external links and references
4. Validate version compatibility claims

## Design Decisions and Rationales

### Node.js Version Update (18+ → 20.19+)

**Decision**: Update minimum Node.js requirement to 20.19.0
**Rationale**: Vite 6 no longer supports Node.js 18, and maintaining compatibility with EOL versions creates security and maintenance issues

### Python Version Update (3.8+ → 3.10+)

**Decision**: Recommend Python 3.10+ instead of 3.8+
**Rationale**: Python 3.8 reached EOL in October 2024, and 3.9 will reach EOL soon. Python 3.10+ provides better long-term support and modern features

### Package Manager Clarification

**Decision**: Explicitly state that `--pm` only supports JavaScript package managers
**Rationale**: The current documentation implies pip support, which is misleading. Python dependencies should be managed separately through standard Python tooling

### Example Simplification

**Decision**: Remove complex examples that mix concepts
**Rationale**: Clear, focused examples reduce user confusion and support burden

## Future Considerations

### Automated Version Monitoring

Consider implementing automated checks for:

- Dependency EOL dates
- New major version releases
- Security advisories for supported versions

### Documentation Automation

Potential improvements:

- Automated consistency checking
- Version synchronization across files
- Example validation in CI/CD pipeline
