/**
 * Logger utility with Peezy brand colors
 * Light Yellow + Forest Green theme
 */

// ANSI escape codes
const ESC = "\x1b[";
const RESET = `${ESC}0m`;

// Brand colors
const YELLOW = `${ESC}38;5;228m`; // Light yellow (primary)
const GREEN = `${ESC}38;5;71m`; // Forest green (secondary/success)
const GOLD = `${ESC}38;5;186m`; // Soft gold (accent)
const RED = `${ESC}38;5;203m`; // Coral red (error)
const SAGE = `${ESC}38;5;115m`; // Sage green (info)
const DIM = `${ESC}38;5;245m`; // Gray (dim)

export const log = {
  info: (s: string, ...args: unknown[]) =>
    console.log(`${SAGE}›${RESET} ${s}`, ...args),
  ok: (s: string, ...args: unknown[]) =>
    console.log(`${GREEN}✓${RESET} ${s}`, ...args),
  warn: (s: string, ...args: unknown[]) =>
    console.warn(`${YELLOW}!${RESET} ${YELLOW}${s}${RESET}`, ...args),
  err: (s: string, ...args: unknown[]) =>
    console.error(`${RED}✗${RESET} ${RED}${s}${RESET}`, ...args),
  debug: (s: string, ...args: unknown[]) => {
    if (process.env.DEBUG || process.env.PEEZY_DEBUG) {
      console.log(`${DIM}⚙${RESET} ${DIM}${s}${RESET}`, ...args);
    }
  },

  // Special formatting
  popular: (s: string) => `${GOLD}⭐${RESET} ${s}`,
  highlight: (s: string) => `${YELLOW}${s}${RESET}`,
};
