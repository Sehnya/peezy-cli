import fs from "node:fs/promises";
import path from "node:path";
import type { PeezyLockFile } from "../types.js";

export class PeezyLockService {
  private lockFileName = "peezy.lock.json";

  async readLockFile(projectPath?: string): Promise<PeezyLockFile | null> {
    try {
      const lockPath = path.join(
        projectPath || process.cwd(),
        this.lockFileName
      );
      const content = await fs.readFile(lockPath, "utf-8");
      return JSON.parse(content) as PeezyLockFile;
    } catch {
      return null;
    }
  }

  async writeLockFile(
    lockFile: PeezyLockFile,
    projectPath?: string
  ): Promise<void> {
    const lockPath = path.join(projectPath || process.cwd(), this.lockFileName);
    await fs.writeFile(lockPath, JSON.stringify(lockFile, null, 2), "utf-8");
  }

  async lockFileExists(projectPath?: string): Promise<boolean> {
    try {
      const lockPath = path.join(
        projectPath || process.cwd(),
        this.lockFileName
      );
      await fs.access(lockPath);
      return true;
    } catch {
      return false;
    }
  }
}
