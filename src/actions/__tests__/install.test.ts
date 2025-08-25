import { spawn } from "node:child_process";
import {
  installDeps,
  isPackageManagerAvailable,
  getRecommendedPackageManager,
} from "../install";

// Mock child_process
jest.mock("node:child_process");
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

// Mock EventEmitter for process
class MockProcess {
  private listeners: { [event: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(...args));
    }
  }
}

describe("Package Manager Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("installDeps", () => {
    it("should install with npm", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = installDeps("npm", "/test/dir");

      expect(mockSpawn).toHaveBeenCalledWith("npm", ["install"], {
        stdio: "inherit",
        cwd: "/test/dir",
        shell: true,
      });

      // Simulate successful completion
      mockProcess.emit("close", 0);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should install with bun", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = installDeps("bun", "/test/dir");

      expect(mockSpawn).toHaveBeenCalledWith("bun", ["install"], {
        stdio: "inherit",
        cwd: "/test/dir",
        shell: true,
      });

      mockProcess.emit("close", 0);
      await expect(promise).resolves.toBeUndefined();
    });

    it("should install with yarn (no args)", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = installDeps("yarn", "/test/dir");

      expect(mockSpawn).toHaveBeenCalledWith("yarn", [], {
        stdio: "inherit",
        cwd: "/test/dir",
        shell: true,
      });

      mockProcess.emit("close", 0);
      await expect(promise).resolves.toBeUndefined();
    });

    it("should reject on non-zero exit code", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = installDeps("npm", "/test/dir");
      mockProcess.emit("close", 1);

      await expect(promise).rejects.toThrow("npm exited with code 1");
    });

    it("should reject on process error", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = installDeps("npm", "/test/dir");
      mockProcess.emit("error", new Error("Command not found"));

      await expect(promise).rejects.toThrow(
        "Failed to start npm: Command not found"
      );
    });
  });

  describe("isPackageManagerAvailable", () => {
    it("should return true for available package manager", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = isPackageManagerAvailable("npm");
      mockProcess.emit("close", 0);

      await expect(promise).resolves.toBe(true);
    });

    it("should return false for unavailable package manager", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = isPackageManagerAvailable("bun");
      mockProcess.emit("close", 1);

      await expect(promise).resolves.toBe(false);
    });

    it("should return false on process error", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = isPackageManagerAvailable("npm");
      mockProcess.emit("error", new Error("Command not found"));

      await expect(promise).resolves.toBe(false);
    });
  });

  describe("getRecommendedPackageManager", () => {
    it("should return bun if available", async () => {
      mockSpawn.mockImplementation((cmd) => {
        const mockProcess = new MockProcess();
        setTimeout(() => {
          mockProcess.emit("close", cmd === "bun" ? 0 : 1);
        }, 0);
        return mockProcess as any;
      });

      const result = await getRecommendedPackageManager();
      expect(result).toBe("bun");
    });

    it("should fallback to npm if nothing else available", async () => {
      mockSpawn.mockImplementation((cmd) => {
        const mockProcess = new MockProcess();
        setTimeout(() => {
          mockProcess.emit("close", cmd === "npm" ? 0 : 1);
        }, 0);
        return mockProcess as any;
      });

      const result = await getRecommendedPackageManager();
      expect(result).toBe("npm");
    });
  });
});
