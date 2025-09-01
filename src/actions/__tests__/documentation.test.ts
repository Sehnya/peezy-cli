import { readFileSync } from "fs";
import { join } from "path";

describe("Documentation Validation", () => {
  const readmeContent = readFileSync(join(process.cwd(), "README.md"), "utf-8");
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf-8")
  );

  describe("Package Manager Options", () => {
    test("should only list supported package managers in README", () => {
      const pmOptionsMatch = readmeContent.match(/Package manager \(([^)]+)\)/);
      expect(pmOptionsMatch).toBeTruthy();

      const supportedPMs = pmOptionsMatch![1];
      expect(supportedPMs).toBe("bun|npm|pnpm|yarn");
      expect(supportedPMs).not.toContain("pip");
    });

    test("should not contain invalid --pm pip examples", () => {
      expect(readmeContent).not.toContain("--pm pip");
    });

    test("examples should only use supported package managers", () => {
      const pmFlagMatches = readmeContent.match(/--pm\s+(\w+)/g);
      if (pmFlagMatches) {
        const supportedPMs = ["bun", "npm", "pnpm", "yarn"];
        pmFlagMatches.forEach((match) => {
          const pm = match.split(" ")[1];
          expect(supportedPMs).toContain(pm);
        });
      }
    });
  });

  describe("Version Requirements", () => {
    test("should specify correct Node.js version requirement", () => {
      expect(readmeContent).toContain("Node.js 20.19.0 or higher");
      expect(readmeContent).toContain("required for Vite 6");
      expect(readmeContent).not.toContain("Node.js 18");
    });

    test("should specify correct Python version requirement", () => {
      expect(readmeContent).toContain("Python 3.10+");
      expect(readmeContent).toContain("3.8-3.9 are EOL");
      expect(readmeContent).not.toContain("Python 3.8+");
    });

    test("package.json engines should match README requirements", () => {
      expect(packageJson.engines.node).toBe(">=20.19.0");
    });
  });

  describe("Flask Examples", () => {
    test("Flask examples should show manual pip install", () => {
      expect(readmeContent).toContain("--no-install");
      expect(readmeContent).toContain(
        "python -m pip install -r requirements.txt"
      );
    });

    test("Flask examples should not use unsupported package manager flags", () => {
      const flaskExampleMatch = readmeContent.match(/peezy new flask [^\n]*/);
      if (flaskExampleMatch) {
        expect(flaskExampleMatch[0]).not.toContain("--pm");
      }
    });
  });

  describe("Template READMEs", () => {
    const templatePaths = [
      "templates/flask/README.md",
      "templates/fastapi/README.md",
      "templates/flask-bun-hybrid/README.md",
    ];

    templatePaths.forEach((templatePath) => {
      test(`${templatePath} should have correct Python version requirement`, () => {
        const templateContent = readFileSync(
          join(process.cwd(), templatePath),
          "utf-8"
        );
        expect(templateContent).toContain("Python 3.10 or higher");
        expect(templateContent).not.toContain("Python 3.8 or higher");
      });
    });
  });

  describe("CLI Examples Validation", () => {
    test("all CLI examples should use valid template names", () => {
      const validTemplates = [
        "bun-react-tailwind",
        "vite-vue-tailwind",
        "flask",
        "fastapi",
        "flask-bun-hybrid",
      ];

      const cliExamples = readmeContent.match(/peezy new (\w+(?:-\w+)*)/g);
      if (cliExamples) {
        cliExamples.forEach((example) => {
          const templateName = example.split(" ")[2];
          expect(validTemplates).toContain(templateName);
        });
      }
    });

    test("all CLI examples should use valid flags", () => {
      const validFlags = ["--pm", "--no-install", "--no-git"];
      const flagMatches = readmeContent.match(/--[\w-]+/g);

      if (flagMatches) {
        flagMatches.forEach((flag) => {
          expect(validFlags).toContain(flag);
        });
      }
    });
  });
});
