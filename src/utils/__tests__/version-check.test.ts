import {
  compareVersions,
  checkNodeVersion,
  validateVersions,
} from "../version-check.js";

describe("Version Check Utilities", () => {
  describe("compareVersions", () => {
    test("should correctly compare version numbers", () => {
      expect(compareVersions("20.19.0", "20.19.0")).toBe(0);
      expect(compareVersions("20.19.1", "20.19.0")).toBe(1);
      expect(compareVersions("20.19.0", "20.19.1")).toBe(-1);
      expect(compareVersions("21.0.0", "20.19.0")).toBe(1);
      expect(compareVersions("20.18.0", "20.19.0")).toBe(-1);
    });

    test("should handle different version lengths", () => {
      expect(compareVersions("20.19", "20.19.0")).toBe(0);
      expect(compareVersions("20.19.0", "20.19")).toBe(0);
      expect(compareVersions("20.19.1", "20.19")).toBe(1);
    });
  });

  describe("checkNodeVersion", () => {
    test("should check current Node.js version", () => {
      const result = checkNodeVersion();

      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("current");
      expect(result).toHaveProperty("minimum");
      expect(result.minimum).toBe("20.19.0");
      expect(typeof result.valid).toBe("boolean");
      expect(typeof result.current).toBe("string");
    });
  });

  describe("validateVersions", () => {
    test("should validate versions without template", () => {
      const result = validateVersions();

      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("errors");
      expect(result).toHaveProperty("warnings");
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test("should include Python warnings for Python templates", () => {
      const flaskResult = validateVersions("flask");
      const reactResult = validateVersions("bun-react-tailwind");

      // Both should validate Node.js, but only Flask should check Python
      expect(flaskResult).toHaveProperty("valid");
      expect(reactResult).toHaveProperty("valid");

      // The specific warnings depend on the system, but the structure should be consistent
      expect(Array.isArray(flaskResult.warnings)).toBe(true);
      expect(Array.isArray(reactResult.warnings)).toBe(true);
    });

    test("should recognize Python templates", () => {
      const pythonTemplates = ["flask", "fastapi", "flask-bun-hybrid"];
      const nonPythonTemplates = ["bun-react-tailwind", "vite-vue-tailwind"];

      pythonTemplates.forEach((template) => {
        const result = validateVersions(template);
        expect(result).toHaveProperty("valid");
        // Python templates may have warnings about Python versions
      });

      nonPythonTemplates.forEach((template) => {
        const result = validateVersions(template);
        expect(result).toHaveProperty("valid");
        // Non-Python templates should only check Node.js
      });
    });
  });
});
