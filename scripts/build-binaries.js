#!/usr/bin/env node

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist-binaries");

// Platforms to build for
const platforms = [
  { os: "linux", arch: "x64", target: "node20-linux-x64" },
  { os: "linux", arch: "arm64", target: "node20-linux-arm64" },
  { os: "macos", arch: "x64", target: "node20-macos-x64" },
  { os: "macos", arch: "arm64", target: "node20-macos-arm64" },
  { os: "windows", arch: "x64", target: "node20-win-x64", ext: ".exe" },
];

// Detect current platform
function getCurrentPlatform() {
  const os = process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : "linux";
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  return { os, arch };
}

// Check if pkg is installed
function checkPkg() {
  try {
    execSync("pkg --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Calculate SHA256 checksum
async function calculateChecksum(filePath) {
  const content = await fs.readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

async function buildBinaries(options = {}) {
  const { currentOnly = false, verbose = false } = options;
  const currentPlatform = getCurrentPlatform();

  console.log("🔨 Building standalone binaries...");
  console.log(`   Current platform: ${currentPlatform.os}-${currentPlatform.arch}`);

  // Clean and create dist directory
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  // Build TypeScript first
  console.log("\n📦 Building TypeScript...");
  execSync("npm run build", { cwd: rootDir, stdio: verbose ? "inherit" : "pipe" });

  // Check for pkg
  if (!checkPkg()) {
    console.log("📥 Installing pkg globally...");
    execSync("npm install -g pkg", { stdio: "inherit" });
  }

  // Determine which platforms to build
  const targetPlatforms = currentOnly
    ? platforms.filter((p) => p.os === currentPlatform.os && p.arch === currentPlatform.arch)
    : platforms;

  if (targetPlatforms.length === 0) {
    console.error("❌ No matching platforms found");
    process.exit(1);
  }

  console.log(`\n🎯 Building for ${targetPlatforms.length} platform(s)...\n`);

  const results = [];
  const checksums = [];

  // Build for each platform
  for (const platform of targetPlatforms) {
    const ext = platform.ext || "";
    const binaryName = `peezy-${platform.os}-${platform.arch}${ext}`;
    const outputPath = path.join(distDir, binaryName);

    console.log(`🏗️  Building ${binaryName}...`);

    try {
      // Build with pkg
      const pkgCmd = `pkg --target ${platform.target} --output "${outputPath}" dist/index.js`;
      execSync(pkgCmd, { cwd: rootDir, stdio: verbose ? "inherit" : "pipe" });

      // Verify binary was created
      await fs.access(outputPath);
      const stats = await fs.stat(outputPath);

      // Create archive
      let archiveName, archivePath;
      if (platform.os === "windows") {
        archiveName = `peezy-${platform.os}-${platform.arch}.zip`;
        archivePath = path.join(distDir, archiveName);
        
        // Use PowerShell on Windows, zip on Unix
        if (process.platform === "win32") {
          execSync(`powershell Compress-Archive -Path "${outputPath}" -DestinationPath "${archivePath}"`, { stdio: "pipe" });
        } else {
          execSync(`zip -j "${archivePath}" "${outputPath}"`, { cwd: distDir, stdio: "pipe" });
        }
      } else {
        archiveName = `peezy-${platform.os}-${platform.arch}.tar.gz`;
        archivePath = path.join(distDir, archiveName);
        execSync(`tar -czf "${archiveName}" "${binaryName}"`, { cwd: distDir, stdio: "pipe" });
      }

      // Calculate checksum
      const checksum = await calculateChecksum(archivePath);
      checksums.push(`${checksum}  ${archiveName}`);

      results.push({
        platform: `${platform.os}-${platform.arch}`,
        binary: binaryName,
        archive: archiveName,
        size: (stats.size / 1024 / 1024).toFixed(2) + " MB",
        checksum: checksum.substring(0, 16) + "...",
        success: true,
      });

      console.log(`   ✅ ${binaryName} (${results[results.length - 1].size})`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.push({
        platform: `${platform.os}-${platform.arch}`,
        success: false,
        error: error.message,
      });
    }
  }

  // Write checksums file
  if (checksums.length > 0) {
    const checksumsPath = path.join(distDir, "checksums.txt");
    await fs.writeFile(checksumsPath, checksums.join("\n") + "\n");
    console.log("\n🔐 Checksums written to checksums.txt");
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Build Summary");
  console.log("=".repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`   ✅ Successful: ${successful.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   📁 Output: ${distDir}`);

  if (failed.length > 0) {
    console.log("\n⚠️  Failed builds:");
    failed.forEach((r) => console.log(`   - ${r.platform}: ${r.error}`));
  }

  // List output files
  console.log("\n📦 Output files:");
  const files = await fs.readdir(distDir);
  for (const file of files.sort()) {
    const stats = await fs.stat(path.join(distDir, file));
    const size = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   ${file} (${size} MB)`);
  }

  console.log("\n🎉 Build complete!");

  return { results, checksums };
}

// CLI handling
const args = process.argv.slice(2);
const options = {
  currentOnly: args.includes("--current") || args.includes("-c"),
  verbose: args.includes("--verbose") || args.includes("-v"),
};

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Peezy CLI Binary Builder

Usage: node scripts/build-binaries.js [options]

Options:
  -c, --current   Build only for current platform
  -v, --verbose   Show detailed build output
  -h, --help      Show this help message

Examples:
  node scripts/build-binaries.js           # Build all platforms
  node scripts/build-binaries.js --current # Build current platform only
`);
  process.exit(0);
}

buildBinaries(options).catch((error) => {
  console.error("❌ Build failed:", error);
  process.exit(1);
});
