import { execSync } from "node:child_process";
import path from "node:path";

describe("JSON Output", () => {
  const cliPath = path.resolve(__dirname, "../../dist/index.js");

  const runCommand = (
    cmd: string
  ): { stdout: string; stderr: string; exitCode: number } => {
    try {
      const stdout = execSync(`node "${cliPath}" ${cmd}`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return { stdout, stderr: "", exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        exitCode: error.status || 1,
      };
    }
  };

  const isValidJSON = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  it("should output valid JSON for list --json", () => {
    const result = runCommand("list --json");
    expect(isValidJSON(result.stdout)).toBe(true);

    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty("ok");
    expect(output).toHaveProperty("version");
    expect(output.ok).toBe(true);
  });

  it("should output valid JSON for cache list --json", () => {
    const result = runCommand("cache list --json");
    expect(isValidJSON(result.stdout)).toBe(true);

    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty("ok");
    expect(output).toHaveProperty("data");
    expect(output.data).toHaveProperty("templates");
  });

  it("should output valid JSON for doctor --json", () => {
    const result = runCommand("doctor --json");
    expect(isValidJSON(result.stdout)).toBe(true);

    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty("ok");
    expect(output).toHaveProperty("version");
  });

  it("should output valid JSON for errors with --json", () => {
    const result = runCommand("new nonexistent-template test-app --json");
    expect(isValidJSON(result.stdout)).toBe(true);

    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty("ok");
    expect(output.ok).toBe(false);
    expect(output).toHaveProperty("errors");
    expect(Array.isArray(output.errors)).toBe(true);
  });

  it("should never output non-JSON content to stdout with --json flag", () => {
    const commands = [
      "list --json",
      "cache list --json",
      "doctor --json",
      "new invalid-template test --json",
    ];

    commands.forEach((cmd) => {
      const result = runCommand(cmd);

      // Should be valid JSON
      expect(isValidJSON(result.stdout)).toBe(true);

      // Should not contain any non-JSON prefixes
      expect(result.stdout).not.toMatch(/^[^{]/);
      expect(result.stdout).not.toContain("›");
      expect(result.stdout).not.toContain("✓");
      expect(result.stdout).not.toContain("✔");
    });
  });

  it("should include standard JSON structure", () => {
    const result = runCommand("list --json");
    const output = JSON.parse(result.stdout);

    expect(output).toHaveProperty("ok");
    expect(output).toHaveProperty("version");
    expect(typeof output.ok).toBe("boolean");
    expect(typeof output.version).toBe("string");

    if (output.data) {
      expect(typeof output.data).toBe("object");
    }

    if (output.warnings) {
      expect(Array.isArray(output.warnings)).toBe(true);
    }

    if (output.errors) {
      expect(Array.isArray(output.errors)).toBe(true);
    }
  });
});
