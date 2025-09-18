#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist-binaries");

const platforms = [
  { os: "linux", arch: "x64", target: "node20-linux-x64" },
  { os: "linux", arch: "arm64", target: "node20-linux-arm64" },
  { os: "macos", arch: "x64", target: "node20-macos-x64" },
  { os: "macos", arch: "arm64", target: "node20-macos-arm64" },
  { os: "windows", arch: "x64", target: "node20-win-x64" },
];

async function buildBinaries() {
  console.log("🔨 Building standalone binaries...");

  // Clean dist directory
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  // Build TypeScript first
  console.log("📦 Building TypeScript...");
  execSync("npm run build", { cwd: rootDir, stdio: "inherit" });

  // Install pkg if not available
  try {
    execSync("pkg --version", { stdio: "ignore" });
  } catch {
    console.log("📥 Installing pkg...");
    execSync("npm install -g pkg", { stdio: "inherit" });
  }

  // Create package.json for pkg
  const pkgConfig = {
    name: "peezy-cli",
    version: "1.0.0",
    bin: "dist/index.js",
    pkg: {
      assets: ["templates/**/*", "dist/**/*"],
      outputPath: distDir,
    },
  };

  await fs.writeFile(
    path.join(rootDir, "pkg.json"),
    JSON.stringify(pkgConfig, null, 2)
  );

  // Build for each platform
  for (const platform of platforms) {
    const outputName = `peezy-${platform.os}-${platform.arch}${platform.os === "windows" ? ".exe" : ""}`;
    const outputPath = path.join(distDir, outputName);

    console.log(`🏗️  Building for ${platform.os}-${platform.arch}...`);

    try {
      execSync(
        `pkg --config pkg.json --target ${platform.target} --output ${outputPath} dist/index.js`,
        { cwd: rootDir, stdio: "inherit" }
      );

      // Create compressed archive
      const archiveName = `peezy-${platform.os}-${platform.arch}.tar.gz`;
      const archivePath = path.join(distDir, archiveName);

      if (platform.os === "windows") {
        // Use zip for Windows
        const zipName = `peezy-${platform.os}-${platform.arch}.zip`;
        const zipPath = path.join(distDir, zipName);
        execSync(`zip -j ${zipPath} ${outputPath}`, { cwd: distDir });
      } else {
        execSync(`tar -czf ${archiveName} -C ${distDir} ${outputName}`, {
          cwd: rootDir,
        });
      }

      console.log(`✅ Built ${outputName}`);
    } catch (error) {
      console.error(
        `❌ Failed to build for ${platform.os}-${platform.arch}:`,
        error.message
      );
    }
  }

  // Generate checksums
  console.log("🔐 Generating checksums...");
  const files = await fs.readdir(distDir);
  const checksums = [];

  for (const file of files) {
    if (file.endsWith(".tar.gz") || file.endsWith(".zip")) {
      const filePath = path.join(distDir, file);
      const checksum = execSync(`shasum -a 256 ${filePath}`, {
        encoding: "utf-8",
      }).trim();
      checksums.push(checksum);
    }
  }

  await fs.writeFile(path.join(distDir, "checksums.txt"), checksums.join("\n"));

  // Clean up
  await fs.unlink(path.join(rootDir, "pkg.json"));

  console.log("🎉 Binary build complete!");
  console.log(`📁 Binaries available in: ${distDir}`);
}

buildBinaries().catch(console.error);
