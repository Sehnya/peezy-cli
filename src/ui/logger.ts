/**
 * Peezy CLI Logger - Beautiful logging with brand colors
 * Light Yellow + Forest Green theme
 */

import { colors, style, styled, icons } from "./theme.js";

export const log = {
  // Standard log levels
  info: (message: string, ...args: unknown[]) => {
    console.log(`${icons.info} ${message}`, ...args);
  },

  success: (message: string, ...args: unknown[]) => {
    console.log(`${icons.success} ${message}`, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${icons.warning} ${colors.warning(message)}`, ...args);
  },

  error: (message: string, ...args: unknown[]) => {
    console.error(`${icons.error} ${colors.error(message)}`, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    if (process.env.DEBUG || process.env.PEEZY_DEBUG) {
      console.log(`${colors.dim("⚙")} ${colors.dim(message)}`, ...args);
    }
  },

  // Styled outputs
  step: (step: number | string, message: string) => {
    const stepNum = colors.secondary(`[${step}]`);
    console.log(`${stepNum} ${message}`);
  },

  title: (message: string) => {
    console.log();
    console.log(`  ${styled.title(message)}`);
    console.log();
  },

  subtitle: (message: string) => {
    console.log(`  ${styled.subtitle(message)}`);
  },

  // Inline formatting helpers - brand colors
  highlight: (s: string) => colors.primary(s), // Light yellow
  command: (s: string) => colors.secondary(s), // Forest green
  path: (s: string) => styled.path(s),
  code: (s: string) => styled.code(s),
  dim: (s: string) => colors.dim(s),

  // Special formatting
  popular: (s: string) => `${icons.star} ${s}`,
  
  // Blank line
  blank: () => console.log(),

  // Raw output (no formatting)
  raw: (message: string) => console.log(message),
};

// Shorthand aliases
export const ok = log.success;
export const err = log.error;
export const warn = log.warn;
export const info = log.info;
