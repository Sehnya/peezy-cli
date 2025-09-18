/**
 * Security commands for template verification and trust management
 */

import { Command } from "commander";
import {
  templateSigner,
  DEFAULT_TRUST_POLICY,
} from "../security/template-signer.js";
import { log } from "../utils/logger.js";
import { readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

/**
 * Verify command - verify template signature
 */
export function createVerifyCommand(): Command {
  return new Command("verify")
    .description("Verify template signature")
    .argument("[template]", "Template path or name to verify")
    .option("--signature <path>", "Path to signature file")
    .option("--json", "Output in JSON format")
    .action(async (template?: string, options?: any) => {
      try {
        const templatePath = template || process.cwd();

        log.info(`Verifying template: ${templatePath}`);

        const signature = await templateSigner.verifyTemplate(
          templatePath,
          options?.signature
        );

        if (options?.json) {
          console.log(JSON.stringify(signature, null, 2));
        } else {
          console.log();
          log.ok("Template signature verified successfully");
          console.log(`  Signer: ${signature.signer}`);
          console.log(
            `  Signed: ${new Date(signature.timestamp).toLocaleString()}`
          );
          console.log(`  Digest: ${signature.digest.substring(0, 16)}...`);

          if (signature.certificate) {
            console.log(
              `  Certificate Subject: ${signature.certificate.subject}`
            );
            console.log(
              `  Certificate Issuer: ${signature.certificate.issuer}`
            );
          }
        }
      } catch (error) {
        if (options?.json) {
          console.log(
            JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
                verified: false,
              },
              null,
              2
            )
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

  // Add trusted signer
  trustCmd
    .command("add")
    .description("Add a trusted signer")
    .argument("<signer>", "Signer email or certificate subject")
    .action(async (signer: string) => {
      try {
        const configPath = join(
          process.env.HOME || "~",
          ".peezy",
          "trust-policy.json"
        );

        let policy = DEFAULT_TRUST_POLICY;
        try {
          const content = await readFile(configPath, "utf8");
          policy = { ...policy, ...JSON.parse(content) };
        } catch {
          // File doesn't exist, use defaults
        }

        if (!policy.trustedSigners.includes(signer)) {
          policy.trustedSigners.push(signer);

          // Save updated policy
          await writeFile(configPath, JSON.stringify(policy, null, 2), "utf8");

          log.ok(`Added trusted signer: ${signer}`);
        } else {
          log.warn(`Signer already trusted: ${signer}`);
        }
      } catch (error) {
        log.err(
          `Failed to add trusted signer: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });

  // Remove trusted signer
  trustCmd
    .command("remove")
    .description("Remove a trusted signer")
    .argument("<signer>", "Signer email or certificate subject")
    .action(async (signer: string) => {
      try {
        const configPath = join(
          process.env.HOME || "~",
          ".peezy",
          "trust-policy.json"
        );

        let policy = DEFAULT_TRUST_POLICY;
        try {
          const content = await readFile(configPath, "utf8");
          policy = { ...policy, ...JSON.parse(content) };
        } catch {
          log.warn("No trust policy found");
          return;
        }

        const index = policy.trustedSigners.indexOf(signer);
        if (index > -1) {
          policy.trustedSigners.splice(index, 1);

          // Save updated policy
          await writeFile(configPath, JSON.stringify(policy, null, 2), "utf8");

          log.ok(`Removed trusted signer: ${signer}`);
        } else {
          log.warn(`Signer not found in trusted list: ${signer}`);
        }
      } catch (error) {
        log.err(
          `Failed to remove trusted signer: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });

  // List trusted signers
  trustCmd
    .command("list")
    .description("List trusted signers")
    .option("--json", "Output in JSON format")
    .action(async (options?: any) => {
      try {
        const configPath = join(
          process.env.HOME || "~",
          ".peezy",
          "trust-policy.json"
        );

        let policy = DEFAULT_TRUST_POLICY;
        try {
          const content = await readFile(configPath, "utf8");
          policy = { ...policy, ...JSON.parse(content) };
        } catch {
          // Use defaults
        }

        if (options?.json) {
          console.log(JSON.stringify(policy, null, 2));
        } else {
          console.log();
          log.info("Trust Policy:");
          console.log(
            `  Require Signatures: ${policy.requireSignatures ? "Yes" : "No"}`
          );
          console.log(
            `  Allow Unsigned: ${policy.allowUnsigned ? "Yes" : "No"}`
          );
          console.log();

          if (policy.trustedSigners.length > 0) {
            log.info("Trusted Signers:");
            policy.trustedSigners.forEach((signer) => {
              console.log(`  • ${signer}`);
            });
          } else {
            log.warn("No trusted signers configured");
          }
        }
      } catch (error) {
        log.err(
          `Failed to list trusted signers: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });

  return trustCmd;
}

/**
 * Audit command - security audit of project
 */
export function createAuditCommand(): Command {
  return new Command("audit")
    .description("Security audit of project")
    .option("--json", "Output in JSON format")
    .action(async (options?: any) => {
      try {
        const auditResults = {
          template: null as any,
          plugins: [] as any[],
          dependencies: null as any,
          recommendations: [] as string[],
        };

        // Check if we're in a Peezy project
        const lockFilePath = join(process.cwd(), "peezy.lock.json");
        try {
          await access(lockFilePath);
          const lockContent = await readFile(lockFilePath, "utf8");
          const lockFile = JSON.parse(lockContent);

          // Audit template
          if (lockFile.template?.signature) {
            auditResults.template = {
              name: lockFile.template.name,
              signed: true,
              verified: lockFile.template.signature.verified,
              signer: lockFile.template.signature.signer,
              signedAt: lockFile.template.signature.timestamp,
            };
          } else {
            auditResults.template = {
              name: lockFile.template?.name || "unknown",
              signed: false,
              verified: false,
            };
            auditResults.recommendations.push(
              "Consider using signed templates for better security"
            );
          }

          // Audit plugins
          if (lockFile.plugins) {
            auditResults.plugins = lockFile.plugins.map((plugin: any) => ({
              name: plugin.name,
              version: plugin.version,
              signed: !!plugin.signature,
              verified: plugin.signature?.verified || false,
            }));
          }
        } catch {
          auditResults.recommendations.push(
            "No peezy.lock.json found - run peezy new to create a project"
          );
        }

        // Check trust policy
        const configPath = join(
          process.env.HOME || "~",
          ".peezy",
          "trust-policy.json"
        );
        try {
          await access(configPath);
          const content = await readFile(configPath, "utf8");
          const policy = JSON.parse(content);

          if (!policy.requireSignatures) {
            auditResults.recommendations.push(
              "Consider enabling signature requirements in trust policy"
            );
          }

          if (policy.trustedSigners.length === 0) {
            auditResults.recommendations.push(
              "Configure trusted signers for better security"
            );
          }
        } catch {
          auditResults.recommendations.push(
            "No trust policy configured - run peezy trust list to set up"
          );
        }

        if (options?.json) {
          console.log(JSON.stringify(auditResults, null, 2));
        } else {
          console.log();
          log.info("Security Audit Results:");
          console.log();

          // Template audit
          if (auditResults.template) {
            console.log(`Template: ${auditResults.template.name}`);
            console.log(
              `  Signed: ${auditResults.template.signed ? "✓" : "✗"}`
            );
            if (auditResults.template.signed) {
              console.log(
                `  Verified: ${auditResults.template.verified ? "✓" : "✗"}`
              );
              console.log(`  Signer: ${auditResults.template.signer}`);
            }
          }

          // Plugin audit
          if (auditResults.plugins.length > 0) {
            console.log();
            console.log("Plugins:");
            auditResults.plugins.forEach((plugin) => {
              console.log(`  ${plugin.name}@${plugin.version}`);
              console.log(`    Signed: ${plugin.signed ? "✓" : "✗"}`);
              if (plugin.signed) {
                console.log(`    Verified: ${plugin.verified ? "✓" : "✗"}`);
              }
            });
          }

          // Recommendations
          if (auditResults.recommendations.length > 0) {
            console.log();
            log.warn("Security Recommendations:");
            auditResults.recommendations.forEach((rec) => {
              console.log(`  • ${rec}`);
            });
          } else {
            console.log();
            log.ok("No security issues found");
          }
        }
      } catch (error) {
        log.err(
          `Audit failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });
}
