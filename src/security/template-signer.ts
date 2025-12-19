/**
 * Template Security System with Sigstore Integration
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { log } from "../utils/logger.js";

export interface TemplateSignature {
  version: "1.0";
  signer: string;
  digest: string;
  timestamp: string;
  bundle: string;
  verified: boolean;
  verifiedAt?: string;
  tlogEntry?: { logIndex: string; integratedTime: string };
  certificate?: { subject: string; issuer: string; notBefore: string; notAfter: string };
  mode: "production" | "development";
}

export interface TrustPolicy {
  requireSignatures: boolean;
  allowUnsigned: boolean;
  trustedSigners: string[];
  maxSignatureAge?: number;
  requireTlog: boolean;
}

export const DEFAULT_TRUST_POLICY: TrustPolicy = {
  requireSignatures: false,
  allowUnsigned: true,
  trustedSigners: [],
  maxSignatureAge: 365,
  requireTlog: false,
};

export class TemplateSigner {
  private trustPolicy: TrustPolicy;

  constructor(trustPolicy: TrustPolicy = DEFAULT_TRUST_POLICY) {
    this.trustPolicy = trustPolicy;
  }

  async signTemplate(templatePath: string, outputPath?: string): Promise<TemplateSignature> {
    const isCI = process.env.CI === "true" || !process.stdin.isTTY;
    if (isCI) {
      log.info("CI environment detected, using development signature");
      return this.signTemplateDevelopment(templatePath, outputPath);
    }

    try {
      log.info("Signing template with Sigstore (keyless)...");
      log.info("A browser window will open for authentication.");

      const sigstore = await import("sigstore");
      const digest = await this.calculateTemplateHash(templatePath);
      const payload = Buffer.from(digest, "utf8");
      const bundle = await sigstore.sign(payload);

      const bundleStr = JSON.stringify(bundle);
      const bundleAny = bundle as unknown;
      const signer = this.extractSignerFromBundle(bundleAny);
      const tlogEntry = this.extractTlogEntry(bundleAny);

      const signature: TemplateSignature = {
        version: "1.0",
        signer,
        digest,
        timestamp: new Date().toISOString(),
        bundle: bundleStr,
        verified: true,
        tlogEntry,
        certificate: { subject: signer, issuer: "sigstore.dev", notBefore: new Date().toISOString(), notAfter: new Date(Date.now() + 600000).toISOString() },
        mode: "production",
      };

      const sigPath = outputPath || join(templatePath, ".peezy-signature.json");
      await this.saveSignature(signature, sigPath);
      log.ok("Template signed by " + signer);
      if (tlogEntry) log.ok("Recorded in Rekor (index: " + tlogEntry.logIndex + ")");
      return signature;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("OIDC") || msg.includes("authentication") || msg.includes("cancelled")) {
        log.warn("Authentication cancelled, using development signature");
        return this.signTemplateDevelopment(templatePath, outputPath);
      }
      throw error;
    }
  }

  async signTemplateDevelopment(templatePath: string, outputPath?: string): Promise<TemplateSignature> {
    log.info("Creating development signature");
    const digest = await this.calculateTemplateHash(templatePath);
    const signature: TemplateSignature = {
      version: "1.0",
      signer: "development@local",
      digest,
      timestamp: new Date().toISOString(),
      bundle: JSON.stringify({ mediaType: "application/vnd.dev+json", development: true, digest }),
      verified: false,
      mode: "development",
      certificate: { subject: "CN=Development", issuer: "CN=Peezy Dev CA", notBefore: new Date().toISOString(), notAfter: new Date(Date.now() + 31536000000).toISOString() },
    };
    const sigPath = outputPath || join(templatePath, ".peezy-signature.json");
    await this.saveSignature(signature, sigPath);
    log.warn("Development signature created");
    return signature;
  }

  async verifyTemplate(templatePath: string, signaturePath?: string): Promise<TemplateSignature> {
    const sigPath = signaturePath || join(templatePath, ".peezy-signature.json");
    log.info("Verifying template signature...");

    let signature: TemplateSignature;
    try {
      signature = await this.loadSignature(sigPath);
    } catch {
      throw new Error("No signature found at " + sigPath);
    }

    const currentDigest = await this.calculateTemplateHash(templatePath);
    if (currentDigest !== signature.digest) {
      throw new Error("Template integrity check failed: files modified since signing");
    }

    if (signature.mode === "development") {
      log.warn("Development signature - not cryptographically verified");
      signature.verified = true;
      signature.verifiedAt = new Date().toISOString();
    } else {
      try {
        const sigstore = await import("sigstore");
        const bundle = JSON.parse(signature.bundle);
        const payload = Buffer.from(signature.digest, "utf8");
        await sigstore.verify(bundle, payload);
        signature.verified = true;
        signature.verifiedAt = new Date().toISOString();
        log.ok("Signature verified via Sigstore");
      } catch (error) {
        throw new Error("Verification failed: " + (error instanceof Error ? error.message : String(error)));
      }
    }

    this.checkTrustPolicy(signature);
    log.ok("Template verified - signed by " + signature.signer);
    return signature;
  }

  checkTrustPolicy(signature: TemplateSignature): void {
    if (this.trustPolicy.requireSignatures && !signature.verified) {
      throw new Error("Trust policy requires verified signatures");
    }
    if (this.trustPolicy.trustedSigners.length > 0) {
      const isTrusted = this.trustPolicy.trustedSigners.some(t => signature.signer === t || signature.signer.includes(t));
      if (!isTrusted && !this.trustPolicy.allowUnsigned) throw new Error("Signer not trusted: " + signature.signer);
      if (!isTrusted) log.warn("Signer not in trusted list: " + signature.signer);
    }
    if (this.trustPolicy.requireTlog && !signature.tlogEntry) {
      throw new Error("Trust policy requires transparency log entry");
    }
  }

  async calculateTemplateHash(templatePath: string): Promise<string> {
    const { glob } = await import("glob");
    const files = await glob("**/*", {
      cwd: templatePath, nodir: true, dot: true,
      ignore: [".peezy-signature.json", "node_modules/**", ".git/**", "dist/**", "build/**", ".DS_Store"],
    });
    const hash = createHash("sha256");
    files.sort();
    for (const file of files) {
      const content = await readFile(join(templatePath, file));
      hash.update(file);
      hash.update(content);
    }
    return hash.digest("hex");
  }

  private extractSignerFromBundle(bundle: unknown): string {
    try {
      const b = bundle as { verificationMaterial?: { x509CertificateChain?: { certificates?: Array<{ rawBytes: string }> } } };
      const cert = b?.verificationMaterial?.x509CertificateChain?.certificates?.[0];
      if (!cert) return "unknown";
      const certStr = Buffer.from(cert.rawBytes, "base64").toString("utf8");
      const match = certStr.match(/[\w.-]+@[\w.-]+\.\w+/);
      return match ? match[0] : "unknown";
    } catch { return "unknown"; }
  }

  private extractTlogEntry(bundle: unknown): { logIndex: string; integratedTime: string } | undefined {
    try {
      const b = bundle as { verificationMaterial?: { tlogEntries?: Array<{ logIndex: string; integratedTime: string }> } };
      const entry = b?.verificationMaterial?.tlogEntries?.[0];
      if (!entry) return undefined;
      return { logIndex: entry.logIndex, integratedTime: entry.integratedTime };
    } catch { return undefined; }
  }

  private async saveSignature(signature: TemplateSignature, outputPath: string): Promise<void> {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(signature, null, 2), "utf8");
  }

  private async loadSignature(signaturePath: string): Promise<TemplateSignature> {
    const content = await readFile(signaturePath, "utf8");
    return JSON.parse(content) as TemplateSignature;
  }

  updateTrustPolicy(policy: Partial<TrustPolicy>): void {
    this.trustPolicy = { ...this.trustPolicy, ...policy };
  }

  getTrustPolicy(): TrustPolicy {
    return { ...this.trustPolicy };
  }
}

export const templateSigner = new TemplateSigner();
