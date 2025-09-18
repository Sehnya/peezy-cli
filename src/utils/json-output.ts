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
    version: process.env.npm_package_version || "0.1.5",
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
    version: process.env.npm_package_version || "0.1.5",
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
      this.warnings.push(args.join(" "));
    };

    console.error = (...args) => {
      this.errors.push(args.join(" "));
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
