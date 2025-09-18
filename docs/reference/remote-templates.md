# Remote Templates

Peezy CLI now supports remote templates with versioning and caching. This allows you to use templates hosted remotely while maintaining fast, offline-capable project creation.

## Features

- **Versioned Templates**: Use specific versions of templates with `@version` syntax
- **Scoped Templates**: Support for organization-scoped templates like `@org/template`
- **Local Caching**: Downloaded templates are cached locally for fast reuse
- **Integrity Verification**: SHA-512 integrity checks ensure template authenticity
- **Fallback Support**: Graceful fallback to cached versions when network is unavailable

## Usage

### Adding Remote Templates

```bash
# Add a scoped template with latest version
peezy add @peezy/flask-bun-tailwind

# Add a specific version
peezy add @peezy/flask-bun-tailwind@1.3.2

# Force re-download
peezy add @peezy/flask-bun-tailwind --force
```

### Using Remote Templates

```bash
# Use latest version
peezy new @peezy/flask-bun-tailwind my-app

# Use specific version
peezy new @peezy/flask-bun-tailwind@1.2.0 my-app

# Interactive mode also supports remote templates
peezy new
```

### Managing Cache

```bash
# View cache information
peezy cache list

# Clear all cached templates
peezy cache clear
```

### Listing Templates

```bash
# List local templates only
peezy list

# List both local and remote templates
peezy list --remote
```

## Registry Format

Remote templates are defined in a JSON registry with the following structure:

```json
{
  "$schema": "https://peezy.dev/schemas/registry.schema.json",
  "version": 1,
  "templates": [
    {
      "name": "@peezy/flask-bun-tailwind",
      "latest": "1.3.2",
      "versions": {
        "1.3.2": {
          "tarball": "https://github.com/org/repo/releases/download/v1.3.2/template.tgz",
          "integrity": "sha512-abc123...",
          "minNode": "18.0.0",
          "tags": ["flask", "bun", "tailwind", "fullstack"]
        }
      }
    }
  ],
  "plugins": [
    {
      "name": "@peezy/plugin-auth",
      "latest": "0.6.0",
      "versions": {
        "0.6.0": {
          "npm": "@peezy/plugin-auth@0.6.0",
          "integrity": "sha512-def456..."
        }
      }
    }
  ]
}
```

## Template Naming

Remote templates support flexible naming:

- **Simple**: `template-name`
- **Scoped**: `@org/template-name`
- **Versioned**: `template-name@1.0.0`
- **Scoped + Versioned**: `@org/template-name@1.0.0`

## Cache Location

Templates are cached in `~/.peezy/registry/`:

```
~/.peezy/registry/
├── cache.json              # Registry metadata and cache index
└── templates/              # Cached template files
    └── @peezy/
        └── flask-bun-tailwind/
            └── 1.3.2/      # Template files
```

## Configuration

The default registry URL can be overridden by setting the `PEEZY_REGISTRY_URL` environment variable:

```bash
export PEEZY_REGISTRY_URL="https://my-company.com/peezy-registry.json"
```

## Security

- All downloads are verified using SHA-512 integrity hashes
- Templates are extracted to isolated directories
- No arbitrary code execution during template download
- Registry URLs must use HTTPS in production

## Offline Support

- Once cached, templates work completely offline
- Registry metadata is cached for 1 hour by default
- Graceful fallback to cached registry when network is unavailable
- Local templates always take precedence over remote ones

## Error Handling

The CLI provides clear error messages for common issues:

- Template not found in registry
- Version not available
- Network connectivity issues
- Integrity verification failures
- Insufficient disk space

## Migration from Local Templates

Existing local templates continue to work unchanged. Remote templates are additive and don't affect local template functionality.

## Future Enhancements

- NPM package support for templates
- Template dependency resolution
- Automatic updates for cached templates
- Template signing and verification
- Private registry support with authentication
