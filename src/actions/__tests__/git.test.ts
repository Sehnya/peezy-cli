import { spawn } from "node:child_process";
import { initGit, isGitAvailable } from "../git";

// Mock child_process
jest.mock("node:child_process");
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

// Mock EventEmitter for process
class MockProcess {
  private listeners: { [event: string]: Function[] } = {};
  public stderr: any = {
    on: jest.fn(),
  };

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

describe("Git Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initGit", () => {
    it("should initialize git repository successfully", async () => {
      let callCount = 0;
      mockSpawn.mockImplementation(() => {
        const mockProcess = new MockProcess();
        setTimeout(() => {
          mockProcess.emit("close", 0);
        }, 0);
        return mockProcess as any;
      });

      await initGit("/test/dir");

      expect(mockSpawn).toHaveBeenCalledTimes(3);
      expect(mockSpawn).toHaveBeenNthCalledWith(1, "git", ["init"], {
        stdio: "pipe",
        cwd: "/test/dir",
      });
      expect(mockSpawn).toHaveBeenNthCalledWith(2, "git", ["add", "."], {
        stdio: "pipe",
        cwd: "/test/dir",
      });
      expect(mockSpawn).toHaveBeenNthCalledWith(
        3,
        "git",
        ["commit", "-m", "chore: scaffold with peezy"],
        {
          stdio: "pipe",
          cwd: "/test/dir",
        }
      );
    });

    it("should fail if git init fails", async () => {
      mockSpawn.mockImplementation((cmd, args) => {
        const mockProcess = new MockProcess();
        setTimeout(() => {
          if (args && args[0] === "init") {
            mockProcess.emit("close", 1);
          } else {
            mockProcess.emit("close", 0);
          }
        }, 0);
        return mockProcess as any;
      });

      await expect(initGit("/test/dir")).rejects.toThrow(
        "Git initialization failed"
      );
    });

    it("should fail if git add fails", async () => {
      mockSpawn.mockImplementation((cmd, args) => {
        const mockProcess = new MockProcess();
        setTimeout(() => {
          if (args && args[0] === "add") {
            mockProcess.emit("close", 1);
          } else {
            mockProcess.emit("close", 0);
          }
        }, 0);
        return mockProcess as any;
      });

      await expect(initGit("/test/dir")).rejects.toThrow(
        "Git initialization failed"
      );
    });

    it("should fail if git commit fails", async () => {
      mockSpawn.mockImplementation((cmd, args) => {
        const mockProcess = new MockProcess();
        setTimeout(() => {
          if (args && args[0] === "commit") {
            mockProcess.emit("close", 1);
          } else {
            mockProcess.emit("close", 0);
          }
        }, 0);
        return mockProcess as any;
      });

      await expect(initGit("/test/dir")).rejects.toThrow(
        "Git initialization failed"
      );
    });

    it("should handle process errors", async () => {
      mockSpawn.mockImplementation(() => {
        const mockProcess = new MockProcess();
        setTimeout(() => {
          mockProcess.emit("error", new Error("Command not found"));
        }, 0);
        return mockProcess as any;
      });

      await expect(initGit("/test/dir")).rejects.toThrow(
        "Git initialization failed"
      );
    });
  });

  describe("isGitAvailable", () => {
    it("should return true when git is available", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = isGitAvailable();
      mockProcess.emit("close", 0);

      await expect(promise).resolves.toBe(true);
    });

    it("should return false when git is not available", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = isGitAvailable();
      mockProcess.emit("close", 1);

      await expect(promise).resolves.toBe(false);
    });

    it("should return false on process error", async () => {
      const mockProcess = new MockProcess();
      mockSpawn.mockReturnValue(mockProcess as any);

      const promise = isGitAvailable();
      mockProcess.emit("error", new Error("Command not found"));

      await expect(promise).resolves.toBe(false);
    });
  });
});
