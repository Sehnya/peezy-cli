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
  const checksums = {};

  try {
    const checksumsContent = await fs.readFile(checksumsPath, "utf-8");
    checksumsContent.split("\n").forEach((line) => {
      if (line.trim()) {
        // Format: "hash  filename" or "hash filename"
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const hash = parts[0];
          const filename = path.basename(parts[parts.length - 1]);
          checksums[filename] = hash;
        }
      }
    });
    console.log("📋 Found checksums:", Object.keys(checksums));
  } catch (error) {
    console.warn("⚠️  No checksums file found. Using placeholder values.");
    console.warn("   Run 'npm run build:binaries' first to generate checksums.");
  }

  // Helper to get checksum or placeholder
  const getChecksum = (filename) => {
    return checksums[filename] || `REPLACE_WITH_${filename.toUpperCase().replace(/[.-]/g, "_")}_CHECKSUM`;
  };

  // Update Homebrew formula
  console.log("🍺 Updating Homebrew formula...");
  const homebrewContent = `class Peezy < Formula
  desc "Production-ready CLI for scaffolding modern applications with curated full-stack templates"
  homepage "https://github.com/Sehnya/peezy-cli"
  version "${version}"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-macos-arm64.tar.gz"
      sha256 "${getChecksum("peezy-macos-arm64.tar.gz")}"

      def install
        bin.install "peezy-macos-arm64" => "peezy"
      end
    end

    on_intel do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-macos-x64.tar.gz"
      sha256 "${getChecksum("peezy-macos-x64.tar.gz")}"

      def install
        bin.install "peezy-macos-x64" => "peezy"
      end
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-linux-arm64.tar.gz"
      sha256 "${getChecksum("peezy-linux-arm64.tar.gz")}"

      def install
        bin.install "peezy-linux-arm64" => "peezy"
      end
    end

    on_intel do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-linux-x64.tar.gz"
      sha256 "${getChecksum("peezy-linux-x64.tar.gz")}"

      def install
        bin.install "peezy-linux-x64" => "peezy"
      end
    end
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/peezy --version")
    assert_match "peezy", shell_output("#{bin}/peezy --help")
  end
end
`;

  await fs.writeFile(path.join(rootDir, "homebrew", "peezy.rb"), homebrewContent);

  // Update Scoop manifest
  console.log("🥄 Updating Scoop manifest...");
  const scoopManifest = {
    version: version,
    description: "Production-ready CLI for scaffolding modern applications with curated full-stack templates",
    homepage: "https://github.com/Sehnya/peezy-cli",
    license: "MIT",
    architecture: {
      "64bit": {
        url: `https://github.com/Sehnya/peezy-cli/releases/download/v${version}/peezy-windows-x64.zip`,
        hash: getChecksum("peezy-windows-x64.zip"),
      },
    },
    bin: "peezy-windows-x64.exe",
    checkver: {
      github: "https://github.com/Sehnya/peezy-cli",
    },
    autoupdate: {
      architecture: {
        "64bit": {
          url: "https://github.com/Sehnya/peezy-cli/releases/download/v$version/peezy-windows-x64.zip",
        },
      },
    },
    suggest: {
      "Node.js": "nodejs",
    },
  };

  await fs.writeFile(
    path.join(rootDir, "scoop", "peezy.json"),
    JSON.stringify(scoopManifest, null, 2) + "\n"
  );

  console.log("✅ Distribution files updated successfully!");
  console.log(`📋 Version: ${version}`);
  console.log("📁 Files updated:");
  console.log("   - homebrew/peezy.rb");
  console.log("   - scoop/peezy.json");

  // Show checksum status
  const expectedFiles = [
    "peezy-macos-arm64.tar.gz",
    "peezy-macos-x64.tar.gz",
    "peezy-linux-arm64.tar.gz",
    "peezy-linux-x64.tar.gz",
    "peezy-windows-x64.zip",
  ];

  const missingChecksums = expectedFiles.filter((f) => !checksums[f]);
  if (missingChecksums.length > 0) {
    console.log("");
    console.warn("⚠️  Missing checksums for:");
    missingChecksums.forEach((f) => console.warn(`   - ${f}`));
    console.warn("   These will need to be updated after building binaries.");
  }
}

updateDistribution().catch(console.error);
