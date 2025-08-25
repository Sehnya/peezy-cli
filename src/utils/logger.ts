/**
 * Logger utility with light/dark theme compatible colors
 * Uses ANSI colors that work well in both terminal themes
 */
export const log = {
  info: (s: string) => console.log(`\x1b[36m›\x1b[0m ${s}`), // Cyan - readable on both backgrounds
  ok: (s: string) => console.log(`\x1b[32m✓\x1b[0m ${s}`), // Green - universally positive
  warn: (s: string) => console.warn(`\x1b[33m!\x1b[0m ${s}`), // Yellow - caution indicator
  err: (s: string) => console.error(`\x1b[31m✗\x1b[0m ${s}`), // Red - clear danger signal

  // Special formatting for popular templates
  popular: (s: string) => `\x1b[93m⭐\x1b[0m ${s}`, // Bright yellow star
  highlight: (s: string) => `\x1b[96m${s}\x1b[0m`, // Bright cyan for highlights
};
