# Version Scrubbing Plugin

A Kiro MCP plugin that automatically monitors version updates for runtimes, frameworks, and dependencies used in the Peezy CLI tool.

## Features

- **Automated Version Monitoring**: Checks for latest versions of Node.js, Python, Bun, and major frameworks
- **Security Advisory Tracking**: Monitors security vulnerabilities and provides alerts
- **Update Recommendations**: Intelligent analysis of version updates with impact assessment
- **Multiple Output Formats**: Console, JSON, and Markdown reporting
- **Configurable Monitoring**: Customize which technologies to monitor and notification preferences
- **Rate Limiting**: Respects API rate limits with intelligent backoff strategies
- **Caching**: Efficient caching to minimize API calls and improve performance

## Installation

The plugin is integrated into the Peezy CLI and can be used as both a CLI command and a Kiro MCP server.

### As CLI Command

```bash
# Check all configured technologies
peezy check-versions

# Check specific technologies
peezy check-versions -t nodejs,react,vue

# Get security advisories only
peezy check-versions --security-only

# Output as JSON
peezy check-versions -f json

# Output as Markdown
peezy check-versions -f markdown
```

### As Kiro MCP Server

The plugin can be configured as an MCP server in Kiro. Add the following to your `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "version-scrubbing-plugin": {
      "command": "node",
      "args": ["./dist/plugins/version-scrubbing/index.js"],
      "env": {
        "LOG_LEVEL": "INFO"
      },
      "disabled": false,
      "autoApprove": [
        "check_versions",
        "get_security_advisories",
        "generate_report"
      ]
    }
  }
}
```

## Configuration

The plugin can be configured via a JSON file at `.kiro/settings/version-scrubbing.json` or through environment variables.

### Configuration Options

```json
{
  "schedule": {
    "frequency": "weekly",
    "time": "09:00",
    "timezone": "UTC"
  },
  "monitoring": {
    "runtimes": ["nodejs", "python", "bun"],
    "frameworks": ["react", "vue", "vite", "flask", "fastapi", "tailwindcss"],
    "packages": [],
    "packageManagers": ["npm", "pnpm", "yarn", "pip"]
  },
  "notifications": {
    "enabled": true,
    "channels": ["console"],
    "severity": "major"
  },
  "cache": {
    "ttl": 3600000,
    "maxSize": 1000
  },
  "analysis": {
    "defaultStrategy": "moderate",
    "includePrerelease": false,
    "securityOnly": false
  }
}
```

### Environment Variables

- `VS_SCHEDULE_FREQUENCY`: Override schedule frequency (daily, weekly, monthly)
- `VS_NOTIFICATIONS_ENABLED`: Enable/disable notifications (true/false)
- `VS_WEBHOOK_URL`: Webhook URL for notifications
- `GITHUB_TOKEN`: GitHub API token for enhanced rate limits
- `LOG_LEVEL`: Logging level (ERROR, WARN, INFO, DEBUG)

## MCP Tools

When running as an MCP server, the plugin provides the following tools:

### check_versions

Check for latest versions of specified technologies.

**Parameters:**

- `technologies` (optional): Array of technologies to check
- `includePrerelease` (optional): Include prerelease versions

**Example:**

```json
{
  "technologies": ["nodejs", "react"],
  "includePrerelease": false
}
```

### get_security_advisories

Get security advisories for specified technologies.

**Parameters:**

- `technologies`: Array of technologies to check
- `severity` (optional): Minimum severity level (critical, high, medium, low)

**Example:**

```json
{
  "technologies": ["nodejs", "react"],
  "severity": "medium"
}
```

### analyze_updates

Analyze version updates and provide recommendations.

**Parameters:**

- `currentVersions`: Object mapping technologies to current versions
- `updateStrategy` (optional): Update strategy (conservative, moderate, aggressive)

**Example:**

```json
{
  "currentVersions": {
    "nodejs": "18.0.0",
    "react": "17.0.0"
  },
  "updateStrategy": "moderate"
}
```

### generate_report

Generate a comprehensive version status report.

**Parameters:**

- `format` (optional): Output format (json, markdown, console)
- `includeRecommendations` (optional): Include update recommendations

**Example:**

```json
{
  "format": "markdown",
  "includeRecommendations": true
}
```

## Supported Technologies

### Runtimes

- **Node.js**: Official Node.js API and GitHub releases
- **Python**: Python.org API and PEP 602 release schedule (planned)
- **Bun**: GitHub API for Bun releases (planned)

### Package Managers

- **npm**: npm registry API (planned)
- **pnpm**: GitHub releases (planned)
- **yarn**: GitHub releases (planned)
- **pip**: PyPI API (planned)

### Frameworks

- **React**: npm registry and GitHub releases (planned)
- **Vue**: npm registry and GitHub releases (planned)
- **Vite**: npm registry and GitHub releases (planned)
- **Flask**: PyPI API (planned)
- **FastAPI**: PyPI API (planned)
- **Tailwind CSS**: npm registry and GitHub releases (planned)

## Update Strategies

The plugin supports three update strategies:

### Conservative

- Only recommends critical security updates and patch releases
- Avoids major version updates unless security-critical
- Prioritizes stability over new features

### Moderate (Default)

- Recommends patch and minor updates
- Suggests major updates with careful consideration
- Balances stability and feature updates

### Aggressive

- Recommends all available updates
- Prioritizes latest versions and new features
- Suitable for development environments

## Rate Limiting

The plugin implements intelligent rate limiting to respect API limits:

- **GitHub API**: 60 requests per hour (5000 with authentication)
- **npm Registry**: 100 requests per minute
- **Exponential Backoff**: Automatic retry with increasing delays
- **Circuit Breaker**: Temporary suspension on repeated failures

## Caching

To minimize API calls and improve performance:

- **TTL-based Caching**: Configurable time-to-live for cached data
- **Memory Cache**: In-memory storage for frequently accessed data
- **Cache Invalidation**: Automatic cleanup of expired entries
- **Size Limits**: Configurable maximum cache size

## Error Handling

The plugin handles various error scenarios gracefully:

- **Network Failures**: Retry with exponential backoff
- **API Rate Limits**: Automatic throttling and queuing
- **Invalid Responses**: Fallback to cached data when available
- **Configuration Errors**: Detailed validation and error messages

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Running Tests for Plugin

```bash
npm test -- --testPathPattern=version-scrubbing
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see the main project LICENSE file for details.
