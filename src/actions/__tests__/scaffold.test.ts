import fs from "node:fs";
import path from "node:path";
import { scaffold } from "../scaffold";
import * as fsx from "../../utils/fsx";

// Mock dependencies
jest.mock("node:fs");
jest.mock("../../utils/fsx");
jest.mock("../../registry", () => ({
  registry: {
    "bun-react-tailwind": {
      title: "Bun + React + Vite + Tailwind",
      path: "/mock/templates/bun-react-tailwind",
      popular: true,
    },
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockFsx = fsx as jest.Mocked<typeof fsx>;

describe("scaffold", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fs.existsSync to return true for template paths, false for destination
    mockFs.existsSync.mockImplementation((path) => {
      if (typeof path === "string" && path.includes("templates")) {
        return true; // Template exists
      }
      return false; // Destination doesn't exist
    });
    mockFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as any);
    mockFsx.isDirectoryEmpty.mockReturnValue(true);
    mockFsx.sanitizePackageName.mockImplementation((name) =>
      name.toLowerCase()
    );
  });

  it("should scaffold a project successfully", () => {
    const result = scaffold("bun-react-tailwind", "my-app");

    expect(mockFsx.copyDir).toHaveBeenCalledWith(
      "/mock/templates/bun-react-tailwind",
      expect.stringContaining("my-app")
    );

    expect(mockFsx.replaceTokens).toHaveBeenCalledWith(
      expect.stringContaining("my-app"),
      {
        APP_NAME: "my-app",
        PKG_NAME: "my-app",
      }
    );

    expect(result).toContain("my-app");
  });

  it("should throw error for unknown template", () => {
    expect(() => scaffold("unknown-template" as any, "my-app")).toThrow(
      "Unknown template: unknown-template"
    );
  });

  it("should throw error for non-empty destination", () => {
    mockFs.existsSync.mockReturnValue(true); // Destination exists
    mockFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as any);
    mockFsx.isDirectoryEmpty.mockReturnValue(false); // Not empty

    expect(() => scaffold("bun-react-tailwind", "existing-dir")).toThrow(
      "already exists and is not empty"
    );
  });

  it("should throw error for missing template directory", () => {
    mockFs.existsSync.mockImplementation((path) => {
      if (typeof path === "string" && path.includes("templates")) {
        return false;
      }
      return true;
    });

    expect(() => scaffold("bun-react-tailwind", "my-app")).toThrow(
      "Template directory not found"
    );
  });

  it("should clean up on failure", () => {
    // Mock that destination gets created during copyDir, then copyDir fails
    mockFsx.copyDir.mockImplementation(() => {
      // Simulate that the directory was created
      mockFs.existsSync.mockReturnValue(true);
      throw new Error("Copy failed");
    });

    expect(() => scaffold("bun-react-tailwind", "my-app")).toThrow(
      "Copy failed"
    );

    expect(mockFs.rmSync).toHaveBeenCalledWith(
      expect.stringContaining("my-app"),
      { recursive: true, force: true }
    );
  });
});
