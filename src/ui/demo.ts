#!/usr/bin/env node
/**
 * Peezy CLI UI Demo - Preview the theme
 */

import { colors, style, styled, icons, box } from "./theme.js";
import { createBox, banner, divider, list, keyValue, table, progressBar, taskList, Spinner } from "./components.js";
import { log } from "./logger.js";

console.clear();

// Banner
console.log(banner("PEEZY CLI", "Fast, offline-first project scaffolding"));

// Divider
console.log(divider());
console.log();

// Colors demo
console.log(style.bold("  Color Palette:"));
console.log(`    ${colors.primary("■")} Primary (Light Yellow)`);
console.log(`    ${colors.secondary("■")} Secondary (Forest Green)`);
console.log(`    ${colors.accent("■")} Accent (Soft Gold)`);
console.log(`    ${colors.success("■")} Success`);
console.log(`    ${colors.warning("■")} Warning`);
console.log(`    ${colors.error("■")} Error`);
console.log(`    ${colors.info("■")} Info`);
console.log(`    ${colors.dim("■")} Dim`);
console.log();

// Gradient
console.log(`  Gradient: ${colors.gradient("PEEZY CLI ROCKS!")}`);
console.log();

// Icons
console.log(style.bold("  Icons:"));
console.log(`    ${icons.success} Success    ${icons.error} Error    ${icons.warning} Warning    ${icons.info} Info`);
console.log(`    ${icons.star} Star    ${icons.arrow} Arrow    ${icons.bullet} Bullet    ${icons.sparkle} Sparkle`);
console.log(`    ${icons.folder} Folder    ${icons.file} File    ${icons.package} Package    ${icons.rocket} Rocket`);
console.log();

// Box
console.log(createBox([
  `${icons.rocket} Welcome to Peezy CLI!`,
  "",
  `${colors.dim("Create beautiful projects instantly.")}`,
], { title: "Getting Started", borderColor: colors.secondary }));
console.log();

// Logger demo
console.log(style.bold("  Logger:"));
log.info("This is an info message");
log.success("This is a success message");
log.warn("This is a warning message");
log.error("This is an error message");
console.log();

// List
console.log(style.bold("  Template List:"));
console.log(list([
  { label: "nextjs-fullstack", value: "Next.js 14 + Auth + Database", icon: icons.star },
  { label: "express-typescript", value: "Express + TypeScript API", icon: icons.star },
  { label: "react-spa-advanced", value: "React + Vite + Zustand", icon: icons.star },
  { label: "flask", value: "Python Flask API" },
]));
console.log();

// Key-Value
console.log(style.bold("  Project Info:"));
console.log(keyValue({
  "Name": "my-awesome-app",
  "Template": "nextjs-fullstack",
  "Package Manager": "bun",
  "Git": "initialized",
}));
console.log();

// Table
console.log(style.bold("  Available Commands:"));
console.log(table(
  ["Command", "Description"],
  [
    ["new", "Create a new project"],
    ["list", "List available templates"],
    ["add", "Add remote template"],
    ["doctor", "Health check"],
  ]
));
console.log();

// Progress bar
console.log(style.bold("  Progress:"));
console.log(`    ${progressBar(7, 10)}`);
console.log();

// Task list
console.log(style.bold("  Tasks:"));
console.log(taskList([
  { name: "Scaffold files", status: "done" },
  { name: "Install dependencies", status: "done" },
  { name: "Initialize git", status: "running" },
  { name: "Run tests", status: "pending" },
]));
console.log();

// Spinner demo
console.log(style.bold("  Spinner (3 seconds):"));
const spinner = new Spinner("Installing dependencies...");
spinner.start();

setTimeout(() => {
  spinner.stop("Dependencies installed!", true);
  console.log();
  console.log(divider());
  console.log();
  console.log(`  ${colors.dim("Theme demo complete!")} ${icons.sparkle}`);
  console.log();
}, 3000);
