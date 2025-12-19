/**
 * Security commands for template signing and verification
 */

import { Command } from "commander";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import {
  templateSigner,
  DEFAULT_TRUST_POLICY,
  type TrustPolicy,
} from "../security/template-signer.js";
import { log } from "../utils/logger.js";
import { resolveTemplate, isValidTemplate } from "../registry.js";

const TRUST_POLICY_PATH = join(homedir(), ".peezy", "trust-policy.json");

/**
 * Load trust policy from disk
 */
async function loadTrustPolicy(): Promise<TrustPolicy> {
  try {
    const content = await readFile(TRUST_POLICY_PATH, "utf8");
    return { ...DEFAULT_TRUST_POLICY, ...JSON.parse(content) };
  } catch {
    return DEFAULT_TRUST_POLICY;
  }
}

/**
 * Save trust policy to disk
 */
async function saveTrustPolicy(policy: TrustPolicy): Promise<void> {
  await mkdir(dirname(TRUST_POLICY_PATH), { recursive: true });
  await writeFile(TRUST_POLICY_PATH, JSON.stringify(policy, null, 2), "utf8");
}

/**
 * Sign command - sign a template with Sigstore
 */
export function createSignCommand(): Command {
  return new Command("sign")
    .description("Sign a template with Sigstore (keyless)")
    .argument("[path]", "Template path to sign", process.cwd())
    .option("--dev", "Create development signature (no OIDC)")
    .option("-o, --output <path>", "Output signature file path")
    .option("--json", "Output JSON format")
    .action(async (templatePath: string, options) => {
      try {
        let signature;

        if (options.dev) {
          signature = await templateSigner.signTemplateDevelopment(
            templatePath,
            options.output
          );
        } else {
          signature = await templateSigner.signTemplate(
            templatePath,
            options.output
          );
        }

        if (options.json) {
          console.log(JSON.stringify(signature, null, 2));
        } else {
          console.log();
          log.ok("Template signed successfully");
          console.log(`  Signer: ${signature.signer}`);
          console.log(`  Mode: ${signature.mode}`);
          console.log(`  Digest: ${signature.digest.substring(0, 16)}...`);
          if (signature.tlogEntry) {
            console.log(`  Rekor Log Index: ${signature.tlogEntry.logIndex}`);
          }
        }
      } catch (error) {
        if (options.json) {
          console.log(
            JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
              signed: false,
            })
          );
        } else {
          log.err(
            `Signing failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        process.exit(1);
      }
    });
}

/**
 * Verify-template command - verify a template signature
 */
export function createVerifyCommand(): Command {
  return new Command("verify-template")
    .description("Verify template signature")
    .argument("<template>", "Template name or path to verify")
    .option("--signature <path>", "Path to signature file")
    .option("--json", "Output JSON format")
    .action(async (template: string, options) => {
      try {
        // Resolve template path
        let templatePath: string;

        if (isValidTemplate(template)) {
          const resolved = await resolveTemplate(template);
          templatePath = resolved.path;
        } else {
          templatePath = template;
        }

        // Load trust policy
        const policy = await loadTrustPolicy();
        templateSigner.updateTrustPolicy(policy);

        const signature = await templateSigner.verifyTemplate(
          templatePath,
          options.signature
        );

        if (options.json) {
          console.log(JSON.stringify(signature, null, 2));
        } else {
          console.log();
          log.ok("Template signature verified");
          console.log(`  Signer: ${signature.signer}`);
          console.log(`  Mode: ${signature.mode}`);
          console.log(`  Signed: ${new Date(signature.timestamp).toLocaleString()}`);
          console.log(`  Digest: ${signature.digest.substring(0, 16)}...`);

          if (signature.tlogEntry) {
            console.log(`  Rekor Log Index: ${signature.tlogEntry.logIndex}`);
          }

          if (signature.mode === "development") {
            console.log();
            log.warn("This is a development signature (not recorded in transparency log)");
          }
        }
      } catch (error) {
        if (options.json) {
          console.log(
            JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
              verified: false,
            })
          );
        } else {
          log.err(
            `Verification failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        process.exit(1);
      }
    });
}

/**
 * Trust command - manage trusted signers
 */
export function createTrustCommand(): Command {
  const trustCmd = new Command("trust").description(
    "Manage trusted signers and trust policy"
  );

  // List trust policy
  trustCmd
    .command("list")
    .description("Show current trust policy")
    .option("--json", "Output JSON format")
    .action(async (options) => {
      const policy = await loadTrustPolicy();

      if (options.json) {
        console.log(JSON.stringify(policy, null, 2));
      } else {
        console.log();
        log.info("Trust Policy");
        console.log(`  Require Signatures: ${policy.requireSignatures ? "Yes" : "No"}`);
        console.log(`  Allow Unsigned: ${policy.allowUnsigned ? "Yes" : "No"}`);
        console.log(`  Require Tlog: ${policy.requireTlog ? "Yes" : "No"}`);
        console.log(`  Max Signature Age: ${policy.maxSignatureAge || "unlimited"} days`);
        console.log();

        if (policy.trustedSigners.length > 0) {
          log.info("Trusted Signers:");
          policy.trustedSigners.forEach((signer: string) => {
            console.log(`  • ${signer}`);
          });
        } else {
          log.warn("No trusted signers configured (all signers accepted)");
        }
      }
    });

  // Add trusted signer
  trustCmd
    .command("add")
    .description("Add a trusted signer")
    .argument("<email>", "Signer email address")
    .action(async (email: string) => {
      const policy = await loadTrustPolicy();

      if (policy.trustedSigners.includes(email)) {
        log.warn(`Already trusted: ${email}`);
        return;
      }

      policy.trustedSigners.push(email);
      await saveTrustPolicy(policy);

      log.ok(`Added trusted signer: ${email}`);
    });

  // Remove trusted signer
  trustCmd
    .command("remove")
    .description("Remove a trusted signer")
    .argument("<email>", "Signer email address")
    .action(async (email: string) => {
      const policy = await loadTrustPolicy();

      const index = policy.trustedSigners.indexOf(email);
      if (index === -1) {
        log.warn(`Not in trusted list: ${email}`);
        return;
      }

      policy.trustedSigners.splice(index, 1);
      await saveTrustPolicy(policy);

      log.ok(`Removed trusted signer: ${email}`);
    });

  // Set policy options
  trustCmd
    .command("set")
    .description("Set trust policy options")
    .option("--require-signatures <bool>", "Require signatures (true/false)")
    .option("--allow-unsigned <bool>", "Allow unsigned templates (true/false)")
    .option("--require-tlog <bool>", "Require transparency log (true/false)")
    .option("--max-age <days>", "Maximum signature age in days")
    .action(async (options) => {
      const policy = await loadTrustPolicy();

      if (options.requireSignatures !== undefined) {
        policy.requireSignatures = options.requireSignatures === "true";
      }
      if (options.allowUnsigned !== undefined) {
        policy.allowUnsigned = options.allowUnsigned === "true";
      }
      if (options.requireTlog !== undefined) {
        policy.requireTlog = options.requireTlog === "true";
      }
      if (options.maxAge !== undefined) {
        policy.maxSignatureAge = parseInt(options.maxAge, 10);
      }

      await saveTrustPolicy(policy);

      log.ok("Trust policy updated");
      console.log(JSON.stringify(policy, null, 2));
    });

  // Reset to defaults
  trustCmd
    .command("reset")
    .description("Reset trust policy to defaults")
    .action(async () => {
      await saveTrustPolicy(DEFAULT_TRUST_POLICY);
      log.ok("Trust policy reset to defaults");
    });

  return trustCmd;
}

/**
 * Audit command - security audit of project
 */
export function createAuditCommand(): Command {
  return new Command("audit")
    .description("Security audit of current project")
    .option("--json", "Output JSON format")
    .action(async (options) => {
      const results = {
        project: null as any,
        signature: null as any,
        trustPolicy: null as any,
        recommendations: [] as string[],
      };

      // Check for peezy.lock.json
      try {
        const lockContent = await readFile("peezy.lock.json", "utf8");
        const lockFile = JSON.parse(lockContent);
        results.project = {
          name: lockFile.template?.name || "unknown",
          version: lockFile.template?.version || "unknown",
          createdAt: lockFile.createdAt,
        };
      } catch {
        results.recommendations.push(
          "No peezy.lock.json found - run 'peezy new' to create a project"
        );
      }

      // Check for signature
      try {
        await access(".peezy-signature.json");
        const sigContent = await readFile(".peezy-signature.json", "utf8");
        const signature = JSON.parse(sigContent);
        results.signature = {
          signer: signature.signer,
          mode: signature.mode,
          verified: signature.verified,
          timestamp: signature.timestamp,
          hasTlog: !!signature.tlogEntry,
        };

        if (signature.mode === "development") {
          results.recommendations.push(
            "Using development signature - consider signing with 'peezy sign' for production"
          );
        }
      } catch {
        results.signature = { present: false };
        results.recommendations.push(
          "No signature found - sign with 'peezy sign' for security"
        );
      }

      // Check trust policy
      const policy = await loadTrustPolicy();
      results.trustPolicy = {
        requireSignatures: policy.requireSignatures,
        allowUnsigned: policy.allowUnsigned,
        trustedSignersCount: policy.trustedSigners.length,
      };

      if (!policy.requireSignatures) {
        results.recommendations.push(
          "Consider enabling signature requirements with 'peezy trust set --require-signatures true'"
        );
      }

      if (policy.trustedSigners.length === 0) {
        results.recommendations.push(
          "No trusted signers configured - add with 'peezy trust add <email>'"
        );
      }

      // Output
      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log();
        log.info("Security Audit");
        console.log();

        if (results.project) {
          console.log(`Project: ${results.project.name}`);
          console.log(`Created: ${results.project.createdAt || "unknown"}`);
          console.log();
        }

        if (results.signature?.signer) {
          console.log(`Signature: ${results.signature.mode}`);
          console.log(`Signer: ${results.signature.signer}`);
          console.log(`Verified: ${results.signature.verified ? "Yes" : "No"}`);
          console.log(`Transparency Log: ${results.signature.hasTlog ? "Yes" : "No"}`);
        } else {
          log.warn("No signature found");
        }

        console.log();
        console.log(`Trust Policy:`);
        console.log(`  Require Signatures: ${results.trustPolicy.requireSignatures}`);
        console.log(`  Trusted Signers: ${results.trustPolicy.trustedSignersCount}`);

        if (results.recommendations.length > 0) {
          console.log();
          log.warn("Recommendations:");
          results.recommendations.forEach((rec) => {
            console.log(`  • ${rec}`);
          });
        } else {
          console.log();
          log.ok("No security issues found");
        }
      }
    });
}
