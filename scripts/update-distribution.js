#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

async function updateDistribution() {
  console.log("🔄 Updating distribution files...");

  // Read package.json for version
  const packageJson = JSON.parse(
    await fs.readFile(path.join(rootDir, "package.json"), "utf-8")
  );
  const version = packageJson.version;

  // Read checksums
  const checksumsPath = path.join(rootDir, "dist-binaries", "checksums.txt");
  let checksums = {};

  try {
    const checksumsContent = await fs.readFile(checksumsPath, "utf-8");
    checksumsContent.split("\n").forEach((line) => {
      if (line.trim()) {
        const [hash, filename] = line.split("  ");
        checksums[filename] = hash;
      }
    });
  } catch (error) {
    console.warn("⚠️  No checksums file found. Run build-binaries.js first.");
    return;
  }

  // Update Homebrew formula
  console.log("🍺 Updating Homebrew formula...");
  const homebrewPath = path.join(rootDir, "homebrew", "peezy.rb");
  let homebrewContent = await fs.readFile(homebrewPath, "utf-8");

  homebrewContent = homebrewContent
    .replace(/version ".*"/, `version "${version}"`)
    .replace(
      /REPLACE_WITH_ARM64_CHECKSUM/,
      checksums["peezy-macos-arm64.tar.gz"] || "CHECKSUM_NOT_FOUND"
    )
    .replace(
      /REPLACE_WITH_X64_CHECKSUM/,
      checksums["peezy-macos-x64.tar.gz"] || "CHECKSUM_NOT_FOUND"
    )
    .replace(
      /REPLACE_WITH_LINUX_ARM64_CHECKSUM/,
      checksums["peezy-linux-arm64.tar.gz"] || "CHECKSUM_NOT_FOUND"
    )
    .replace(
      /REPLACE_WITH_LINUX_X64_CHECKSUM/,
      checksums["peezy-linux-x64.tar.gz"] || "CHECKSUM_NOT_FOUND"
    );

  await fs.writeFile(homebrewPath, homebrewContent);

  // Update Scoop manifest
  console.log("🥄 Updating Scoop manifest...");
  const scoopPath = path.join(rootDir, "scoop", "peezy.json");
  const scoopManifest = JSON.parse(await fs.readFile(scoopPath, "utf-8"));

  scoopManifest.version = version;
  scoopManifest.architecture["64bit"].url = scoopManifest.architecture[
    "64bit"
  ].url.replace(/v[\d.-]+/, `v${version}`);
  scoopManifest.architecture["64bit"].hash =
    checksums["peezy-windows-x64.zip"] || "CHECKSUM_NOT_FOUND";

  await fs.writeFile(scoopPath, JSON.stringify(scoopManifest, null, 2));

  // Generate installation script
  console.log("📜 Generating installation script...");
  const installScript = `#!/bin/bash
set -e

# Peezy CLI Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash

REPO="Sehnya/peezy-cli"
VERSION="${version}"
INSTALL_DIR="/usr/local/bin"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $OS in
  linux)
    OS="linux"
    ;;
  darwin)
    OS="macos"
    ;;
  *)
    echo "❌ Unsupported operating system: $OS"
    exit 1
    ;;
esac

case $ARCH in
  x86_64)
    ARCH="x64"
    ;;
  arm64|aarch64)
    ARCH="arm64"
    ;;
  *)
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

BINARY_NAME="peezy-$OS-$ARCH"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$VERSION/$BINARY_NAME.tar.gz"

echo "🚀 Installing Peezy CLI v$VERSION for $OS-$ARCH..."

# Create temporary directory
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

# Download and extract
echo "📥 Downloading from $DOWNLOAD_URL..."
curl -fsSL "$DOWNLOAD_URL" | tar -xz

# Install binary
echo "📦 Installing to $INSTALL_DIR..."
sudo mv "$BINARY_NAME" "$INSTALL_DIR/peezy"
sudo chmod +x "$INSTALL_DIR/peezy"

# Cleanup
cd /
rm -rf "$TMP_DIR"

echo "✅ Peezy CLI installed successfully!"
echo "🎉 Run 'peezy --help' to get started"

# Verify installation
if command -v peezy >/dev/null 2>&1; then
  echo "📋 Version: $(peezy --version)"
else
  echo "⚠️  Warning: peezy command not found in PATH"
  echo "   Make sure $INSTALL_DIR is in your PATH"
fi
`;

  await fs.writeFile(path.join(rootDir, "install.sh"), installScript);
  execSync(`chmod +x ${path.join(rootDir, "install.sh")}`);

  console.log("✅ Distribution files updated successfully!");
  console.log(`📋 Version: ${version}`);
  console.log("📁 Files updated:");
  console.log("   - homebrew/peezy.rb");
  console.log("   - scoop/peezy.json");
  console.log("   - install.sh");
}

updateDistribution().catch(console.error);
