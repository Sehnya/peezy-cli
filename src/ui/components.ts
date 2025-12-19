/**
 * Peezy CLI UI Components - Beautiful terminal components
 */

import { colors, style, styled, icons, box } from "./theme.js";

/**
 * Get terminal width
 */
function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

/**
 * Create a styled box around content
 */
export function createBox(
  content: string | string[],
  options: {
    title?: string;
    padding?: number;
    borderColor?: (s: string) => string;
    width?: number;
  } = {}
): string {
  const {
    title,
    padding = 1,
    borderColor = colors.dim,
    width = Math.min(60, getTerminalWidth() - 4),
  } = options;

  const lines = Array.isArray(content) ? content : content.split("\n");
  const innerWidth = width - 2;
  const pad = " ".repeat(padding);

  // Strip ANSI for length calculation
  const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

  const output: string[] = [];

  // Top border
  if (title) {
    const titleText = ` ${title} `;
    const titleLen = stripAnsi(titleText).length;
    const leftPad = Math.floor((innerWidth - titleLen) / 2);
    const rightPad = innerWidth - titleLen - leftPad;
    output.push(
      borderColor(box.topLeft) +
        borderColor(box.horizontal.repeat(leftPad)) +
        styled.title(titleText) +
        borderColor(box.horizontal.repeat(rightPad)) +
        borderColor(box.topRight)
    );
  } else {
    output.push(
      borderColor(box.topLeft) +
        borderColor(box.horizontal.repeat(innerWidth)) +
        borderColor(box.topRight)
    );
  }

  // Padding top
  for (let i = 0; i < padding; i++) {
    output.push(borderColor(box.vertical) + " ".repeat(innerWidth) + borderColor(box.vertical));
  }

  // Content
  for (const line of lines) {
    const lineLen = stripAnsi(line).length;
    const contentWidth = innerWidth - padding * 2;
    const rightPadding = Math.max(0, contentWidth - lineLen);
    output.push(
      borderColor(box.vertical) +
        pad +
        line +
        " ".repeat(rightPadding) +
        pad +
        borderColor(box.vertical)
    );
  }

  // Padding bottom
  for (let i = 0; i < padding; i++) {
    output.push(borderColor(box.vertical) + " ".repeat(innerWidth) + borderColor(box.vertical));
  }

  // Bottom border
  output.push(
    borderColor(box.bottomLeft) +
      borderColor(box.horizontal.repeat(innerWidth)) +
      borderColor(box.bottomRight)
  );

  return output.join("\n");
}

/**
 * Create a styled header/banner
 */
export function banner(text: string, subtitle?: string): string {
  const lines: string[] = [];
  
  lines.push("");
  lines.push(`  ${styled.title(text)}`);
  if (subtitle) {
    lines.push(`  ${colors.dim(subtitle)}`);
  }
  lines.push("");
  
  return lines.join("\n");
}

/**
 * Create a divider line
 */
export function divider(char = "─", width?: number): string {
  const w = width || Math.min(50, getTerminalWidth() - 4);
  return colors.dim(char.repeat(w));
}

/**
 * Create a styled list
 */
export function list(
  items: Array<{ label: string; value?: string; icon?: string }>,
  options: { indent?: number; bullet?: string } = {}
): string {
  const { indent = 2, bullet = icons.bullet } = options;
  const pad = " ".repeat(indent);

  return items
    .map((item) => {
      const icon = item.icon || bullet;
      if (item.value) {
        return `${pad}${icon} ${colors.white(item.label)} ${colors.dim("→")} ${colors.muted(item.value)}`;
      }
      return `${pad}${icon} ${item.label}`;
    })
    .join("\n");
}

/**
 * Create a key-value display
 */
export function keyValue(
  data: Record<string, string | number | boolean>,
  options: { indent?: number; labelWidth?: number } = {}
): string {
  const { indent = 2, labelWidth = 15 } = options;
  const pad = " ".repeat(indent);

  return Object.entries(data)
    .map(([key, value]) => {
      const label = key.padEnd(labelWidth);
      return `${pad}${colors.dim(label)} ${colors.white(String(value))}`;
    })
    .join("\n");
}

/**
 * Create a simple table
 */
export function table(
  headers: string[],
  rows: string[][],
  options: { indent?: number } = {}
): string {
  const { indent = 2 } = options;
  const pad = " ".repeat(indent);

  // Calculate column widths
  const colWidths = headers.map((h, i) => {
    const maxRow = Math.max(...rows.map((r) => (r[i] || "").length));
    return Math.max(h.length, maxRow) + 2;
  });

  const output: string[] = [];

  // Header
  const headerRow = headers
    .map((h, i) => style.bold(colors.secondary(h.padEnd(colWidths[i]))))
    .join("");
  output.push(pad + headerRow);

  // Separator
  output.push(pad + colors.dim("─".repeat(colWidths.reduce((a, b) => a + b, 0))));

  // Rows
  for (const row of rows) {
    const rowStr = row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join("");
    output.push(pad + rowStr);
  }

  return output.join("\n");
}

/**
 * Progress bar with smooth ombre effect (yellow to green)
 * Uses RGB interpolation for smooth gradient
 */
export function progressBar(
  current: number,
  total: number,
  options: { width?: number; showPercent?: boolean } = {}
): string {
  const { width = 30, showPercent = true } = options;
  const percent = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const ESC = "\x1b[";
  const RESET = `${ESC}0m`;

  // RGB values: Light Yellow (255, 238, 88) -> Forest Green (34, 139, 34)
  const startR = 255, startG = 238, startB = 88;
  const endR = 34, endG = 139, endB = 34;

  // Build ombre filled section with smooth RGB interpolation
  let bar = "";
  for (let i = 0; i < filled; i++) {
    // Calculate position ratio (0 to 1) based on position in full bar
    const ratio = width > 1 ? i / (width - 1) : 0;
    
    // Interpolate RGB values
    const r = Math.round(startR + (endR - startR) * ratio);
    const g = Math.round(startG + (endG - startG) * ratio);
    const b = Math.round(startB + (endB - startB) * ratio);
    
    // Use true color (24-bit) ANSI escape
    bar += `${ESC}38;2;${r};${g};${b}m█`;
  }
  bar += RESET;

  // Add empty section
  bar += colors.dim("░".repeat(empty));

  if (showPercent) {
    return `${bar} ${colors.muted(`${percent}%`)}`;
  }
  return bar;
}

/**
 * Spinner animation
 */
export class Spinner {
  private interval: NodeJS.Timeout | null = null;
  private frameIndex = 0;
  private message: string;

  constructor(message: string) {
    this.message = message;
  }

  start(): void {
    this.frameIndex = 0;
    process.stdout.write("\x1b[?25l"); // Hide cursor

    this.interval = setInterval(() => {
      const frame = colors.primary(icons.spinner[this.frameIndex]);
      process.stdout.write(`\r${frame} ${this.message}`);
      this.frameIndex = (this.frameIndex + 1) % icons.spinner.length;
    }, 80);
  }

  update(message: string): void {
    this.message = message;
  }

  stop(finalMessage?: string, success = true): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    process.stdout.write("\x1b[?25h"); // Show cursor
    process.stdout.write("\r\x1b[K"); // Clear line

    if (finalMessage) {
      const icon = success ? icons.success : icons.error;
      console.log(`${icon} ${finalMessage}`);
    }
  }
}

/**
 * Create a task list with status
 */
export function taskList(
  tasks: Array<{ name: string; status: "pending" | "running" | "done" | "error" }>
): string {
  return tasks
    .map((task) => {
      let icon: string;
      let name: string;

      switch (task.status) {
        case "done":
          icon = icons.success;
          name = colors.success(task.name);
          break;
        case "error":
          icon = icons.error;
          name = colors.error(task.name);
          break;
        case "running":
          icon = colors.primary("◐");
          name = colors.white(task.name);
          break;
        default:
          icon = colors.dim("○");
          name = colors.dim(task.name);
      }

      return `  ${icon} ${name}`;
    })
    .join("\n");
}
