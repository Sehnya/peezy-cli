#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const workflowsDir = path.join(rootDir, ".github", "workflows");

async function validateWorkflows() {
  console.log("🔍 Validating GitHub workflows...\n");

  let allValid = true;

  try {
    const workflowFiles = await fs.readdir(workflowsDir);
    const yamlFiles = workflowFiles.filter(
      (file) => file.endsWith(".yml") || file.endsWith(".yaml")
    );

    for (const file of yamlFiles) {
      console.log(`📄 Validating ${file}...`);

      try {
        const filePath = path.join(workflowsDir, file);
        const content = await fs.readFile(filePath, "utf-8");

        // Parse YAML to validate syntax
        const workflow = yaml.load(content);

        // Basic structure validation
        if (!workflow.name) {
          console.log(`  ❌ Missing 'name' field`);
          allValid = false;
        } else {
          console.log(`  ✅ Name: ${workflow.name}`);
        }

        if (!workflow.on) {
          console.log(`  ❌ Missing 'on' field`);
          allValid = false;
        } else {
          console.log(`  ✅ Triggers: ${Object.keys(workflow.on).join(", ")}`);
        }

        if (!workflow.jobs) {
          console.log(`  ❌ Missing 'jobs' field`);
          allValid = false;
        } else {
          const jobNames = Object.keys(workflow.jobs);
          console.log(`  ✅ Jobs: ${jobNames.join(", ")}`);

          // Validate each job
          for (const jobName of jobNames) {
            const job = workflow.jobs[jobName];

            if (!job["runs-on"]) {
              console.log(`  ❌ Job '${jobName}' missing 'runs-on'`);
              allValid = false;
            }

            if (!job.steps || !Array.isArray(job.steps)) {
              console.log(`  ❌ Job '${jobName}' missing or invalid 'steps'`);
              allValid = false;
            } else {
              console.log(
                `  ✅ Job '${jobName}' has ${job.steps.length} steps`
              );
            }
          }
        }

        console.log(`  ✅ ${file} is valid\n`);
      } catch (error) {
        console.log(`  ❌ ${file} validation failed: ${error.message}\n`);
        allValid = false;
      }
    }

    // Validate workflow interdependencies
    console.log("🔗 Validating workflow interdependencies...");

    // Check if branch protection references match actual job names
    const branchProtectionPath = path.join(
      workflowsDir,
      "branch-protection.yml"
    );
    if (
      await fs
        .access(branchProtectionPath)
        .then(() => true)
        .catch(() => false)
    ) {
      const branchProtectionContent = await fs.readFile(
        branchProtectionPath,
        "utf-8"
      );
      const branchProtection = yaml.load(branchProtectionContent);

      // Extract required contexts from branch protection
      const script = branchProtection.jobs[
        "setup-branch-protection"
      ].steps.find((step) => step.name === "Setup Branch Protection Rules")
        ?.with?.script;

      if (script) {
        const contextMatches = script.match(/contexts:\s*\[([\s\S]*?)\]/);
        if (contextMatches) {
          const contexts = contextMatches[1]
            .split(",")
            .map((ctx) => ctx.trim().replace(/['"]/g, ""))
            .filter((ctx) => ctx.length > 0);

          console.log(`  📋 Required status checks: ${contexts.join(", ")}`);

          // Check if CI workflow has matching job names
          const ciPath = path.join(workflowsDir, "ci.yml");
          if (
            await fs
              .access(ciPath)
              .then(() => true)
              .catch(() => false)
          ) {
            const ciContent = await fs.readFile(ciPath, "utf-8");
            const ciWorkflow = yaml.load(ciContent);
            const ciJobs = Object.keys(ciWorkflow.jobs);

            console.log(`  📋 CI jobs: ${ciJobs.join(", ")}`);

            // Check for potential mismatches
            const expectedJobs = [
              "test",
              "security",
              "code-quality",
              "compatibility",
            ];
            for (const expectedJob of expectedJobs) {
              if (!ciJobs.includes(expectedJob)) {
                console.log(`  ⚠️ Expected CI job '${expectedJob}' not found`);
              }
            }
          }
        }
      }
    }

    console.log("✅ Workflow interdependency validation completed\n");

    // Final result
    if (allValid) {
      console.log("🎉 All workflows are valid!");
      console.log("\n✅ Workflows ready for GitHub Actions");
    } else {
      console.log("❌ Some workflows have validation errors");
      console.log("\n🔧 Please fix the issues above before committing");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Workflow validation failed:", error.message);
    process.exit(1);
  }
}

validateWorkflows().catch(console.error);
