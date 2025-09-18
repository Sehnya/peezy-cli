/**
 * Logger utility for the Version Scrubbing Plugin
 */

export interface LogLevel {
  SILENT: -1;
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  SILENT: -1,
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  private level: number;
  private prefix: string;

  constructor(level: keyof LogLevel = "INFO", prefix = "[VersionScrubbing]") {
    this.level = LOG_LEVELS[level];
    this.prefix = prefix;
  }

  private log(level: keyof LogLevel, message: string, ...args: any[]) {
    // If configured SILENT, never log
    if (this.level < 0) return;

    if (LOG_LEVELS[level] <= this.level) {
      const timestamp = new Date().toISOString();
      const levelStr = level.padEnd(6);
      console.log(
        `${timestamp} ${levelStr} ${this.prefix} ${message}`,
        ...args
      );
    }
  }

  error(message: string, ...args: any[]) {
    this.log("ERROR", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("WARN", message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log("INFO", message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log("DEBUG", message, ...args);
  }

  setLevel(level: keyof LogLevel) {
    this.level = LOG_LEVELS[level];
  }
}

// Create default logger instance
const resolvedDefaultLevel: keyof LogLevel =
  (process.env.LOG_LEVEL as keyof LogLevel) ||
  (process.env.NODE_ENV === "test" ? "SILENT" : "WARN");

export const logger = new Logger(resolvedDefaultLevel);
