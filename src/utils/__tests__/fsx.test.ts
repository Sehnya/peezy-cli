import fs from "node:fs";
import path from "node:path";
import {
  copyDir,
  replaceTokens,
  sanitizePackageName,
  isDirectoryEmpty,
} from "../fsx";

// Mock fs module
jest.mock("node:fs");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("fsx utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sanitizePackageName", () => {
    it("should convert to lowercase", () => {
      expect(sanitizePackageName("MyApp")).toBe("myapp");
    });

    it("should replace special characters with hyphens", () => {
      expect(sanitizePackageName("my@app#name")).toBe("my-app-name");
    });

    it("should remove leading and trailing hyphens", () => {
      expect(sanitizePackageName("@my-app@")).toBe("my-app");
    });

    it("should collapse multiple hyphens", () => {
      expect(sanitizePackageName("my---app")).toBe("my-app");
    });

    it("should preserve valid characters", () => {
      expect(sanitizePackageName("my-app_123")).toBe("my-app_123");
    });
  });

  describe("isDirectoryEmpty", () => {
    it("should return true for non-existent directory", () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(isDirectoryEmpty("/non/existent")).toBe(true);
    });

    it("should return false for non-directory", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);
      expect(isDirectoryEmpty("/some/file")).toBe(false);
    });

    it("should return true for empty directory", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.readdirSync.mockReturnValue([]);
      expect(isDirectoryEmpty("/empty/dir")).toBe(true);
    });

    it("should return false for non-empty directory", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.readdirSync.mockReturnValue(["file1.txt"] as any);
      expect(isDirectoryEmpty("/non/empty/dir")).toBe(false);
    });
  });

  describe("copyDir", () => {
    it("should throw error for non-existent source", () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(() => copyDir("/non/existent", "/dest")).toThrow(
        "Template directory not found"
      );
    });
  });

  describe("replaceTokens", () => {
    it("should throw error for non-existent directory", () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(() =>
        replaceTokens("/non/existent", { APP_NAME: "test", PKG_NAME: "test" })
      ).toThrow("Directory does not exist");
    });
  });
});
