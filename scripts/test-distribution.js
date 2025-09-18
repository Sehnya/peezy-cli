#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

async function testDistribution() {
  console.log("🧪 Testing distribution setup...\n");

  try {
    // Test 1: Check if required files exist
    console.log("1️⃣ Checking required files...");
    const requiredFiles = [
      "homebrew/peezy.rb",
      "scoop/peezy.json",
      "scripts/build-binaries.js",
      "scripts/update-distribution.js",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(rootDir, file);
      try {
        await fs.access(filePath);
        console.log(`   ✅ ${file}`);
      } catch {
        console.log(`   ❌ ${file} - Missing!`);
      }
    }

    // Test 2: Check package.json scripts
    console.log("\n2️⃣ Checking package.json scripts...");
    const packageJson = JSON.parse(
      await fs.readFile(path.join(rootDir, "package.json"), "utf-8")
    );

    const requiredScripts = [
      "build:binaries",
      "update:distribution",
      "release",
    ];

    for (const script of requiredScripts) {
      if (packageJson.scripts[script]) {
        console.log(`   ✅ ${script}: ${packageJson.scripts[script]}`);
      } else {
        console.log(`   ❌ ${script} - Missing!`);
      }
    }

    // Test 3: Check if TypeScript builds
    console.log("\n3️⃣ Testing TypeScript build...");
    try {
      execSync("npm run build", { cwd: rootDir, stdio: "pipe" });
      console.log("   ✅ TypeScript build successful");
    } catch (error) {
      console.log("   ❌ TypeScript build failed");
      console.log(`   Error: ${error.message}`);
    }

    // Test 4: Test distribution file updates
    console.log("\n4️⃣ Testing distribution file updates...");
    try {
      // Create a fake checksums file for testing
      const distDir = path.join(rootDir, "dist-binaries");
      await fs.mkdir(distDir, { recursive: true });
      await fs.writeFile(
        path.join(distDir, "checksums.txt"),
        "abc123  peezy-macos-arm64.tar.gz\ndef456  peezy-macos-x64.tar.gz\n"
      );

      execSync("npm run update:distribution", { cwd: rootDir, stdio: "pipe" });
      console.log("   ✅ Distribution files updated successfully");

      // Check if files were actually updated
      const homebrewContent = await fs.readFile(
        path.join(rootDir, "homebrew/peezy.rb"),
        "utf-8"
      );

      if (
        homebrewContent.includes("abc123") ||
        homebrewContent.includes("def456")
      ) {
        console.log("   ✅ Homebrew formula updated with checksums");
      } else {
        console.log("   ⚠️  Homebrew formula may not have updated checksums");
      }
    } catch (error) {
      console.log("   ❌ Distribution update failed");
      console.log(`   Error: ${error.message}`);
    }

    // Test 5: Check GitHub Actions workflow
    console.log("\n5️⃣ Checking GitHub Actions workflow...");
    try {
      const workflowPath = path.join(rootDir, ".github/workflows/release.yml");
      const workflowContent = await fs.readFile(workflowPath, "utf-8");

      if (workflowContent.includes("build:binaries")) {
        console.log("   ✅ Workflow includes binary building");
      }

      if (workflowContent.includes("sigstore")) {
        console.log("   ✅ Workflow includes Sigstore signing");
      }

      if (workflowContent.includes("softprops/action-gh-release")) {
        console.log("   ✅ Workflow includes GitHub release creation");
      }

      // Check for problematic secrets
      if (
        workflowContent.includes("HOMEBREW_TAP_TOKEN") ||
        workflowContent.includes("SCOOP_BUCKET_TOKEN")
      ) {
        console.log(
          "   ⚠️  Workflow still references external repository tokens"
        );
        console.log("      This will cause errors until tokens are set up");
      } else {
        console.log(
          "   ✅ Workflow does not require external repository tokens"
        );
      }
    } catch (error) {
      console.log("   ❌ Could not read workflow file");
    }

    // Test 6: Installation script
    console.log("\n6️⃣ Checking installation script...");
    try {
      const installScript = await fs.readFile(
        path.join(rootDir, "install.sh"),
        "utf-8"
      );

      if (installScript.includes("curl") && installScript.includes("tar")) {
        console.log("   ✅ Installation script looks good");
      } else {
        console.log("   ⚠️  Installation script may be incomplete");
      }
    } catch {
      console.log("   ❌ Installation script not found");
    }

    console.log("\n🎉 Distribution test complete!");
    console.log("\n📋 Next steps:");
    console.log("   1. Set up NPM_TOKEN secret in GitHub (optional)");
    console.log(
      "   2. Test with: git tag v1.0.0-test && git push origin v1.0.0-test"
    );
    console.log("   3. Check GitHub Actions and releases");
    console.log(
      "   4. Clean up: git tag -d v1.0.0-test && git push origin :refs/tags/v1.0.0-test"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testDistribution().catch(console.error);
