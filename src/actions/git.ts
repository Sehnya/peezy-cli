import { spawn } from "node:child_process";

/**
 * Run a git command in the specified directory
 * @param command - Git command to run
 * @param args - Arguments for the git command
 * @param cwd - Working directory
 */
function runGitCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: "pipe", // Capture output to avoid cluttering console
      cwd,
    });

    let stderr = "";

    process.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `${command} ${args.join(" ")} exited with code ${code}${stderr ? ": " + stderr : ""}`
          )
        );
      }
    });

    process.on("error", (error) => {
      reject(new Error(`Failed to start ${command}: ${error.message}`));
    });
  });
}

/**
 * Initialize a git repository and create initial commit
 * @param cwd - Directory to initialize git in
 */
export async function initGit(cwd: string): Promise<void> {
  try {
    // Initialize git repository
    await runGitCommand("git", ["init"], cwd);

    // Add all files
    await runGitCommand("git", ["add", "."], cwd);

    // Create initial commit
    await runGitCommand(
      "git",
      ["commit", "-m", "chore: scaffold with peezy"],
      cwd
    );
  } catch (error) {
    // Re-throw with more context
    throw new Error(
      `Git initialization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Check if git is available on the system
 */
export function isGitAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn("git", ["--version"], {
      stdio: "ignore",
    });

    process.on("close", (code) => {
      resolve(code === 0);
    });

    process.on("error", () => {
      resolve(false);
    });
  });
}
