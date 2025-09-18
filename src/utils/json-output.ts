import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read version from package.json
let packageVersion = "1.0.0";
try {
  const packageJsonPath = join(__dirname, "../../package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  packageVersion = packageJson.version;
} catch {
  // Fallback to hardcoded version if package.json can't be read
  packageVersion = "1.0.0";
}

/**
 * Standardized JSON output format for CLI commands
 */
export interface JsonOutput<T = any> {
  ok: boolean;
  data?: T;
  warnings?: string[];
  errors?: string[];
  version: string;
}

/**
 * Create a successful JSON output
 */
export function createSuccessOutput<T>(
  data?: T,
  warnings?: string[]
): JsonOutput<T> {
  return {
    ok: true,
    data,
    warnings: warnings?.length ? warnings : undefined,
    version: packageVersion,
  };
}

/**
 * Create an error JSON output
 */
export function createErrorOutput(
  errors: string[],
  warnings?: string[]
): JsonOutput {
  return {
    ok: false,
    errors,
    warnings: warnings?.length ? warnings : undefined,
    version: packageVersion,
  };
}

/**
 * Output JSON to stdout and exit with appropriate code
 */
export function outputJson(output: JsonOutput): void {
  const json = JSON.stringify(output, null, 2);
  // Write synchronously to avoid truncation and let Node exit naturally.
  process.stdout.write(json + "\n");
  // Set exit code but do not force immediate exit to avoid losing buffered output in some environments (e.g., Jest execSync).
  process.exitCode = output.ok ? 0 : 1;
}

/**
 * Capture console output for JSON mode
 */
export class OutputCapture {
  private warnings: string[] = [];
  private errors: string[] = [];
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
  };

  constructor() {
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  start(): void {
    console.log = (...args) => {
      // Suppress regular log output in JSON mode
    };

    console.warn = (...args) => {
      // Strip ANSI color codes from warnings
      const message = args.join(" ").replace(/\x1b\[[0-9;]*m/g, "");
      this.warnings.push(message);
    };

    console.error = (...args) => {
      // Strip ANSI color codes from errors
      const message = args.join(" ").replace(/\x1b\[[0-9;]*m/g, "");
      this.errors.push(message);
    };
  }

  stop(): { warnings: string[]; errors: string[] } {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;

    return {
      warnings: this.warnings,
      errors: this.errors,
    };
  }
}
