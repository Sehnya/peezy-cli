import { config } from "@/config/environment";

type LogLevel = "error" | "warn" | "info" | "debug";

const logLevels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class Logger {
  private level: number;

  constructor(level: LogLevel = "info") {
    this.level = logLevels[level];
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (logLevels[level] <= this.level) {
      const timestamp = new Date().toISOString();
      const levelStr = level.toUpperCase().padEnd(5);
      console.log(`${timestamp} ${levelStr} ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    this.log("error", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("warn", message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log("info", message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log("debug", message, ...args);
  }
}

export const logger = new Logger(config.logging.level as LogLevel);
