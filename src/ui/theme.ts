/**
 * Peezy CLI Theme - Charm-inspired beautiful terminal UI
 * Brand colors: Light Yellow + Forest Green
 */

// ANSI escape codes
const ESC = "\x1b[";
const RESET = `${ESC}0m`;

// Color palette - Peezy brand: Light Yellow & Forest Green
export const colors = {
  // Primary brand colors
  primary: (s: string) => `${ESC}38;5;228m${s}${RESET}`, // Light yellow
  secondary: (s: string) => `${ESC}38;5;71m${s}${RESET}`, // Forest green
  accent: (s: string) => `${ESC}38;5;186m${s}${RESET}`, // Soft gold/yellow

  // Semantic colors
  success: (s: string) => `${ESC}38;5;71m${s}${RESET}`, // Forest green
  warning: (s: string) => `${ESC}38;5;228m${s}${RESET}`, // Light yellow
  error: (s: string) => `${ESC}38;5;203m${s}${RESET}`, // Coral red
  info: (s: string) => `${ESC}38;5;115m${s}${RESET}`, // Sage green

  // Neutral colors
  dim: (s: string) => `${ESC}38;5;245m${s}${RESET}`, // Gray
  muted: (s: string) => `${ESC}38;5;250m${s}${RESET}`, // Light gray
  white: (s: string) => `${ESC}38;5;255m${s}${RESET}`, // Bright white

  // Special
  gradient: (s: string) => {
    const chars = s.split("");
    // Yellow to green gradient
    const gradientColors = [228, 229, 193, 157, 150, 114, 71];
    return chars
      .map((c, i) => `${ESC}38;5;${gradientColors[i % gradientColors.length]}m${c}`)
      .join("") + RESET;
  },
};

// Text styles
export const style = {
  bold: (s: string) => `${ESC}1m${s}${RESET}`,
  dim: (s: string) => `${ESC}2m${s}${RESET}`,
  italic: (s: string) => `${ESC}3m${s}${RESET}`,
  underline: (s: string) => `${ESC}4m${s}${RESET}`,
  inverse: (s: string) => `${ESC}7m${s}${RESET}`,
  strikethrough: (s: string) => `${ESC}9m${s}${RESET}`,
};

// Combine color and style
export const styled = {
  title: (s: string) => style.bold(colors.gradient(s)),
  subtitle: (s: string) => colors.secondary(s),
  command: (s: string) => colors.accent(s),
  path: (s: string) => style.underline(colors.muted(s)),
  code: (s: string) => `${ESC}48;5;236m${ESC}38;5;252m ${s} ${RESET}`,
  highlight: (s: string) => style.bold(colors.primary(s)),
  link: (s: string) => style.underline(colors.secondary(s)),
};

// Icons/Symbols - using brand colors
export const icons = {
  // Status
  success: colors.success("✓"),
  error: colors.error("✗"),
  warning: colors.warning("!"),
  info: colors.info("›"),
  
  // Actions
  arrow: colors.secondary("→"),
  arrowRight: colors.dim("›"),
  bullet: colors.dim("•"),
  star: colors.primary("⭐"),
  sparkle: colors.primary("✦"),
  
  // Progress
  spinner: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  progress: ["░", "▒", "▓", "█"],
  
  // Misc
  folder: colors.primary("📁"),
  file: colors.muted("📄"),
  package: colors.secondary("📦"),
  rocket: "🚀",
  check: colors.success("☑"),
  box: colors.dim("☐"),
};

// Box drawing characters
export const box = {
  topLeft: "╭",
  topRight: "╮",
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  vertical: "│",
  
  // Double line
  dTopLeft: "╔",
  dTopRight: "╗",
  dBottomLeft: "╚",
  dBottomRight: "╝",
  dHorizontal: "═",
  dVertical: "║",
};
