/**
 * Simple utility tests to verify CI workflow
 */

describe("Utility Functions", () => {
  describe("String utilities", () => {
    it("should handle basic string operations", () => {
      const testString = "peezy-cli";
      expect(testString.length).toBe(9);
      expect(testString.includes("peezy")).toBe(true);
      expect(testString.split("-")).toEqual(["peezy", "cli"]);
    });

    it("should handle string transformations", () => {
      const input = "Hello World";
      expect(input.toLowerCase()).toBe("hello world");
      expect(input.toUpperCase()).toBe("HELLO WORLD");
      expect(input.replace(" ", "-")).toBe("Hello-World");
    });
  });

  describe("Array utilities", () => {
    it("should handle array operations", () => {
      const frameworks = ["react", "vue", "flask", "fastapi"];
      expect(frameworks.length).toBe(4);
      expect(frameworks.includes("react")).toBe(true);
      expect(frameworks.filter((f) => f.startsWith("f"))).toEqual([
        "flask",
        "fastapi",
      ]);
    });

    it("should handle array transformations", () => {
      const numbers = [1, 2, 3, 4, 5];
      expect(numbers.map((n) => n * 2)).toEqual([2, 4, 6, 8, 10]);
      expect(numbers.reduce((sum, n) => sum + n, 0)).toBe(15);
    });
  });

  describe("Object utilities", () => {
    it("should handle object operations", () => {
      const config = {
        name: "peezy-cli",
        version: "0.1.3",
        frameworks: ["react", "vue"],
      };

      expect(Object.keys(config)).toEqual(["name", "version", "frameworks"]);
      expect(config.name).toBe("peezy-cli");
      expect(config.frameworks.length).toBe(2);
    });

    it("should handle object transformations", () => {
      const template = { name: "react", bundler: "vite" };
      const extended = { ...template, css: "tailwind" };

      expect(extended).toEqual({
        name: "react",
        bundler: "vite",
        css: "tailwind",
      });
    });
  });
});
