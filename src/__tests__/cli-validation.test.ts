import { describe, it, expect } from "@jest/globals";

describe("CLI Input Validation", () => {
  // These tests simulate the validation logic from the CLI prompts

  const validateProjectName = (value: string): string | true => {
    if (!value || value.trim().length === 0) {
      return "Project name is required";
    }
    if (value.length > 214) {
      return "Project name must be less than 214 characters";
    }
    // Check for reserved names first
    const reserved = [
      "node_modules",
      "package.json",
      "package-lock.json",
      ".git",
      ".env",
    ];
    if (reserved.includes(value.toLowerCase())) {
      return `"${value}" is a reserved name and cannot be used`;
    }
    if (value.startsWith(".")) {
      return "Project name cannot start with a dot";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "Project name can only contain letters, numbers, hyphens, and underscores";
    }
    if (value.startsWith("-") || value.endsWith("-")) {
      return "Project name cannot start or end with hyphens";
    }
    return true;
  };

  describe("Project name validation", () => {
    it("should accept valid project names", () => {
      expect(validateProjectName("my-app")).toBe(true);
      expect(validateProjectName("MyApp")).toBe(true);
      expect(validateProjectName("my_app")).toBe(true);
      expect(validateProjectName("app123")).toBe(true);
      expect(validateProjectName("123app")).toBe(true);
    });

    it("should reject empty or whitespace names", () => {
      expect(validateProjectName("")).toBe("Project name is required");
      expect(validateProjectName("   ")).toBe("Project name is required");
    });

    it("should reject names that are too long", () => {
      const longName = "a".repeat(215);
      expect(validateProjectName(longName)).toBe(
        "Project name must be less than 214 characters"
      );
    });

    it("should reject names with invalid characters", () => {
      expect(validateProjectName("my app")).toContain("can only contain");
      expect(validateProjectName("my@app")).toContain("can only contain");
      expect(validateProjectName("my.app")).toContain("can only contain");
      expect(validateProjectName("my/app")).toContain("can only contain");
    });

    it("should reject names starting or ending with hyphens", () => {
      expect(validateProjectName("-myapp")).toBe(
        "Project name cannot start or end with hyphens"
      );
      expect(validateProjectName("myapp-")).toBe(
        "Project name cannot start or end with hyphens"
      );
      expect(validateProjectName("-myapp-")).toBe(
        "Project name cannot start or end with hyphens"
      );
    });

    it("should reject names starting with dots", () => {
      expect(validateProjectName(".myapp")).toBe(
        "Project name cannot start with a dot"
      );
      expect(validateProjectName(".hidden")).toBe(
        "Project name cannot start with a dot"
      );
    });

    it("should reject reserved names", () => {
      expect(validateProjectName("node_modules")).toContain(
        "is a reserved name"
      );
      expect(validateProjectName("package.json")).toContain(
        "is a reserved name"
      );
      expect(validateProjectName(".git")).toContain("is a reserved name");
      expect(validateProjectName("NODE_MODULES")).toContain(
        "is a reserved name"
      ); // case insensitive
    });
  });

  describe("Package manager validation", () => {
    const validatePackageManager = (pm: string): boolean => {
      return ["bun", "npm", "pnpm", "yarn"].includes(pm);
    };

    it("should accept valid package managers", () => {
      expect(validatePackageManager("bun")).toBe(true);
      expect(validatePackageManager("npm")).toBe(true);
      expect(validatePackageManager("pnpm")).toBe(true);
      expect(validatePackageManager("yarn")).toBe(true);
    });

    it("should reject invalid package managers", () => {
      expect(validatePackageManager("pip")).toBe(false);
      expect(validatePackageManager("cargo")).toBe(false);
      expect(validatePackageManager("")).toBe(false);
      expect(validatePackageManager("NPM")).toBe(false); // case sensitive
    });
  });
});
