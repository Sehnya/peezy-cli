import fs from "node:fs";
import path from "node:path";
import { scaffold } from "../scaffold";
import * as fsx from "../../utils/fsx";

// Mock dependencies
jest.mock("node:fs");
jest.mock("../../utils/fsx");
jest.mock("../../registry", () => ({
  resolveTemplate: jest.fn(),
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

// Import the mocked registry
const mockRegistry = require("../../registry");

describe("scaffold", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock resolveTemplate to return a local path
    mockRegistry.resolveTemplate.mockResolvedValue({
      path: "/mock/templates/bun-react-tailwind",
      isRemote: false,
    });

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

  it("should scaffold a project successfully", async () => {
    const result = await scaffold("bun-react-tailwind", "my-app");

    expect(mockRegistry.resolveTemplate).toHaveBeenCalledWith(
      "bun-react-tailwind"
    );
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

  it("should throw error for unknown template", async () => {
    mockRegistry.resolveTemplate.mockRejectedValue(
      new Error("Template not found")
    );

    await expect(scaffold("unknown-template" as any, "my-app")).rejects.toThrow(
      "Failed to resolve template"
    );
  });

  it("should throw error for non-empty destination", async () => {
    mockFs.existsSync.mockReturnValue(true); // Destination exists
    mockFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as any);
    mockFsx.isDirectoryEmpty.mockReturnValue(false); // Not empty

    await expect(
      scaffold("bun-react-tailwind", "existing-dir")
    ).rejects.toThrow("already exists and is not empty");
  });

  it("should throw error for missing template directory", async () => {
    mockFs.existsSync.mockImplementation((path) => {
      if (typeof path === "string" && path.includes("templates")) {
        return false;
      }
      return true;
    });

    await expect(scaffold("bun-react-tailwind", "my-app")).rejects.toThrow(
      "Template directory not found"
    );
  });

  it("should clean up on failure", async () => {
    // Mock that destination gets created during copyDir, then copyDir fails
    mockFsx.copyDir.mockImplementation(() => {
      // Simulate that the directory was created
      mockFs.existsSync.mockReturnValue(true);
      throw new Error("Copy failed");
    });

    await expect(scaffold("bun-react-tailwind", "my-app")).rejects.toThrow(
      "Copy failed"
    );

    expect(mockFs.rmSync).toHaveBeenCalledWith(
      expect.stringContaining("my-app"),
      { recursive: true, force: true }
    );
  });
});
