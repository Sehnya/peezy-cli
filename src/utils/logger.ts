/**
 * Logger utility with light/dark theme compatible colors
 * Uses ANSI colors that work well in both terminal themes
 */
export const log = {
  info: (s: string, ...args: any[]) =>
    console.log(`\x1b[36m›\x1b[0m ${s}`, ...args), // Cyan - readable on both backgrounds
  ok: (s: string, ...args: any[]) =>
    console.log(`\x1b[32m✓\x1b[0m ${s}`, ...args), // Green - universally positive
  warn: (s: string, ...args: any[]) =>
    console.warn(`\x1b[33m!\x1b[0m ${s}`, ...args), // Yellow - caution indicator
  err: (s: string, ...args: any[]) =>
    console.error(`\x1b[31m✗\x1b[0m ${s}`, ...args), // Red - clear danger signal
  debug: (s: string, ...args: any[]) => {
    if (process.env.DEBUG || process.env.PEEZY_DEBUG) {
      console.log(`\x1b[90m🐛\x1b[0m ${s}`, ...args); // Gray debug messages
    }
  },

  // Special formatting for popular templates
  popular: (s: string) => `\x1b[93m⭐\x1b[0m ${s}`, // Bright yellow star
  highlight: (s: string) => `\x1b[96m${s}\x1b[0m`, // Bright cyan for highlights
};
