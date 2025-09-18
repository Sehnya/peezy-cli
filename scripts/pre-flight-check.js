#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

async function preFlightCheck() {
  console.log("🚀 Peezy CLI v1.0.2 Pre-Flight Check\n");

  let allGood = true;

  try {
    // Check 1: Version consistency
    console.log("1️⃣ Checking version consistency...");
    const packageJson = JSON.parse(
      await fs.readFile(path.join(rootDir, "package.json"), "utf-8")
    );

    if (packageJson.version === "1.0.2") {
      console.log("   ✅ package.json version: 1.0.2");
    } else {
      console.log(
        `   ❌ package.json version: ${packageJson.version} (should be 1.0.2)`
      );
      allGood = false;
    }

    const indexContent = await fs.readFile(
      path.join(rootDir, "src/index.ts"),
      "utf-8"
    );
    if (indexContent.includes('.version("1.0.2")')) {
      console.log("   ✅ CLI version string: 1.0.2");
    } else {
      console.log("   ❌ CLI version string not updated");
      allGood = false;
    }

    // Check 2: Hero templates
    console.log("\n2️⃣ Checking hero templates...");
    const heroTemplates = [
      "nextjs-fullstack",
      "express-fullstack",
      "react-spa-advanced",
    ];

    for (const template of heroTemplates) {
      const templatePath = path.join(rootDir, "templates", template);
      try {
        await fs.access(templatePath);
        const packageJsonPath = path.join(templatePath, "package.json");
        await fs.access(packageJsonPath);
        console.log(`   ✅ ${template} template complete`);
      } catch {
        console.log(`   ❌ ${template} template missing or incomplete`);
        allGood = false;
      }
    }

    // Check 3: Build system
    console.log("\n3️⃣ Checking build system...");
    try {
      execSync("npm run build", { cwd: rootDir, stdio: "pipe" });
      console.log("   ✅ TypeScript build successful");
    } catch (error) {
      console.log("   ❌ TypeScript build failed");
      console.log(`   Error: ${error.message}`);
      allGood = false;
    }

    // Check 4: Tests
    console.log("\n4️⃣ Running tests...");
    try {
      execSync("npm test", { cwd: rootDir, stdio: "pipe" });
      console.log("   ✅ All tests passing");
    } catch (error) {
      console.log("   ❌ Tests failing");
      console.log(`   Error: ${error.message}`);
      allGood = false;
    }

    // Check 5: Distribution files
    console.log("\n5️⃣ Checking distribution files...");
    const distFiles = [
      "homebrew/peezy.rb",
      "scoop/peezy.json",
      "install.sh",
      "scripts/build-binaries.js",
      "scripts/update-distribution.js",
    ];

    for (const file of distFiles) {
      try {
        await fs.access(path.join(rootDir, file));
        console.log(`   ✅ ${file}`);
      } catch {
        console.log(`   ❌ ${file} missing`);
        allGood = false;
      }
    }

    // Check 6: GitHub Actions workflow
    console.log("\n6️⃣ Checking GitHub Actions workflow...");
    try {
      const workflowContent = await fs.readFile(
        path.join(rootDir, ".github/workflows/release.yml"),
        "utf-8"
      );

      const checks = [
        { name: "Binary building", pattern: "build:binaries" },
        { name: "Sigstore signing", pattern: "sigstore" },
        { name: "Release creation", pattern: "softprops/action-gh-release" },
        { name: "NPM publishing", pattern: "npm publish" },
      ];

      for (const check of checks) {
        if (workflowContent.includes(check.pattern)) {
          console.log(`   ✅ ${check.name} configured`);
        } else {
          console.log(`   ❌ ${check.name} missing`);
          allGood = false;
        }
      }
    } catch {
      console.log("   ❌ GitHub Actions workflow missing");
      allGood = false;
    }

    // Check 7: Documentation
    console.log("\n7️⃣ Checking documentation...");
    const docFiles = [
      "RELEASE_NOTES_1.0.2.md",
      "HERO_FEATURES_README.md",
      "SETUP_SUMMARY.md",
      "RELEASE_CHECKLIST_1.0.0.md",
    ];

    for (const file of docFiles) {
      try {
        await fs.access(path.join(rootDir, file));
        console.log(`   ✅ ${file}`);
      } catch {
        console.log(`   ❌ ${file} missing`);
        allGood = false;
      }
    }

    // Check 8: Git status
    console.log("\n8️⃣ Checking git status...");
    try {
      const gitStatus = execSync("git status --porcelain", {
        cwd: rootDir,
        encoding: "utf-8",
      });

      if (gitStatus.trim() === "") {
        console.log("   ✅ Working directory clean");
      } else {
        console.log("   ⚠️  Uncommitted changes detected:");
        console.log(
          gitStatus
            .split("\n")
            .map((line) => `      ${line}`)
            .join("\n")
        );
        console.log("   Consider committing changes before release");
      }
    } catch {
      console.log("   ⚠️  Could not check git status");
    }

    // Final verdict
    console.log("\n" + "=".repeat(50));
    if (allGood) {
      console.log("🎉 PRE-FLIGHT CHECK PASSED!");
      console.log("\n✅ Ready for v1.0.2 release!");
      console.log("\nNext steps:");
      console.log("1. Commit any final changes");
      console.log('2. Run: git tag -a v1.0.2 -m "Release v1.0.2"');
      console.log("3. Run: git push origin v1.0.2");
      console.log("4. Monitor GitHub Actions");
      console.log("5. Celebrate! 🎊");
    } else {
      console.log("❌ PRE-FLIGHT CHECK FAILED!");
      console.log("\n🔧 Please fix the issues above before releasing.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Pre-flight check failed:", error.message);
    process.exit(1);
  }
}

preFlightCheck().catch(console.error);
