import { execSync } from "child_process";

export interface VersionRequirements {
  nodejs: {
    minimum: string;
    current?: string;
  };
  python?: {
    minimum: string;
    current?: string;
  };
}

export function checkNodeVersion(): {
  valid: boolean;
  current: string;
  minimum: string;
} {
  const minimum = "20.19.0";
  const current = process.version.slice(1); // Remove 'v' prefix

  return {
    valid: compareVersions(current, minimum) >= 0,
    current,
    minimum,
  };
}

export function checkPythonVersion(): {
  valid: boolean;
  current?: string;
  minimum: string;
  available: boolean;
} {
  const minimum = "3.10.0";

  try {
    const pythonVersion = execSync("python --version 2>&1", {
      encoding: "utf-8",
    }).trim();
    const versionMatch = pythonVersion.match(/Python (\d+\.\d+\.\d+)/);

    if (!versionMatch) {
      return { valid: false, minimum, available: false };
    }

    const current = versionMatch[1];
    return {
      valid: compareVersions(current, minimum) >= 0,
      current,
      minimum,
      available: true,
    };
  } catch (error) {
    // Try python3 command
    try {
      const python3Version = execSync("python3 --version 2>&1", {
        encoding: "utf-8",
      }).trim();
      const versionMatch = python3Version.match(/Python (\d+\.\d+\.\d+)/);

      if (!versionMatch) {
        return { valid: false, minimum, available: false };
      }

      const current = versionMatch[1];
      return {
        valid: compareVersions(current, minimum) >= 0,
        current,
        minimum,
        available: true,
      };
    } catch (error) {
      return { valid: false, minimum, available: false };
    }
  }
}

export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

export function validateVersions(templateName?: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Always check Node.js version
  const nodeCheck = checkNodeVersion();
  if (!nodeCheck.valid) {
    errors.push(
      `Node.js ${nodeCheck.minimum} or higher is required (current: ${nodeCheck.current})\n` +
        `Please upgrade Node.js: https://nodejs.org/`
    );
  }

  // Check Python version only for Python templates
  const pythonTemplates = ["flask", "fastapi", "flask-bun-hybrid"];
  if (templateName && pythonTemplates.includes(templateName)) {
    const pythonCheck = checkPythonVersion();

    if (!pythonCheck.available) {
      warnings.push(
        `Python is not available in your PATH.\n` +
          `Python ${pythonCheck.minimum}+ is recommended for this template.\n` +
          `Install Python: https://python.org/downloads/`
      );
    } else if (!pythonCheck.valid) {
      warnings.push(
        `Python ${pythonCheck.minimum} or higher is recommended (current: ${pythonCheck.current})\n` +
          `Python 3.8-3.9 have reached end-of-life. Consider upgrading for security and feature updates.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
