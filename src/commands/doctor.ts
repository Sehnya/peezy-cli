import { execSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { log } from "../utils/logger.js";

function checkCmd(cmd: string): {
  ok: boolean;
  version?: string;
  error?: string;
} {
  try {
    const out = execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] })
      .toString()
      .trim();
    return { ok: true, version: out };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

function findProjectRoot(cwd: string) {
  let dir = cwd;
  while (dir !== path.parse(dir).root) {
    if (
      fs.existsSync(path.join(dir, "package.json")) ||
      fs.existsSync(path.join(dir, "pyproject.toml")) ||
      fs.existsSync(path.join(dir, "requirements.txt"))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return cwd;
}

export type DoctorOptions = {
  fixLint?: boolean;
  fixEnvExamples?: boolean;
  ports?: number[];
  json?: boolean;
};

export async function doctor(opts: DoctorOptions = {}): Promise<
  | number
  | {
      ok: boolean;
      errors: string[];
      warnings: string[];
      checks: any;
    }
> {
  let ok = true;
  const errors: string[] = [];
  const warnings: string[] = [];
  const checks: any = {};

  const cwd = process.cwd();
  const root = findProjectRoot(cwd);

  if (!opts.json) {
    log.info(`Doctor running in ${root}`);
  }

  // Versions
  const node = checkCmd("node -v");
  const bun = checkCmd("bun --version");
  const python = checkCmd("python3 --version");

  checks.versions = { node, bun, python };

  if (!opts.json) {
    log.info(`Node: ${node.ok ? node.version : "missing"}`);
    log.info(`Bun: ${bun.ok ? bun.version : "missing"}`);
    log.info(`Python: ${python.ok ? python.version : "missing"}`);
  }

  if (!node.ok) {
    ok = false;
    errors.push("Node.js is not available");
  }

  // Env
  const envFile = path.join(root, ".env");
  const envExample = path.join(root, ".env.example");
  if (fs.existsSync(envExample)) {
    const example = fs
      .readFileSync(envExample, "utf8")
      .split(/\r?\n/)
      .filter(Boolean);
    const missing: string[] = [];
    const have = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
    for (const line of example) {
      const key = line.split("=")[0];
      if (key && !have.includes(`${key}=`)) missing.push(key);
    }
    if (missing.length) {
      ok = false;
      log.warn(`Missing env vars in .env: ${missing.join(", ")}`);
      if (opts.fixEnvExamples && !fs.existsSync(envExample)) {
        fs.writeFileSync(envExample, "", "utf8");
      }
    } else {
      log.ok("Environment variables present (based on .env.example)");
    }
  } else {
    log.warn(".env.example not found");
  }

  // DB connectivity placeholder (Prisma/Peewee)
  try {
    const hasPrisma = fs.existsSync(path.join(root, "prisma/schema.prisma"));
    if (hasPrisma) {
      // Best-effort check: ensure DATABASE_URL is present
      if (!process.env.DATABASE_URL) {
        ok = false;
        log.warn("DATABASE_URL not set. Skipping DB connectivity check.");
      }
    }
  } catch {}

  // Pending migrations placeholder
  if (fs.existsSync(path.join(root, "prisma/migrations"))) {
    log.info(
      "Prisma migrations folder present. Run your package manager to check pending migrations."
    );
  }

  // Broken imports (TypeScript/JS only: try tsc --noEmit)
  try {
    if (fs.existsSync(path.join(root, "tsconfig.json"))) {
      execSync("npx tsc -p tsconfig.json --noEmit", {
        cwd: root,
        stdio: "pipe",
      });
      log.ok("TypeScript typecheck passed");
    }
  } catch (e) {
    ok = false;
    log.err("TypeScript typecheck failed");
  }

  // Lint autofix
  if (opts.fixLint) {
    try {
      execSync("npm run lint --silent -- --fix", {
        cwd: root,
        stdio: "inherit",
      });
    } catch {
      // ignore, do not flip ok
    }
  }

  // Port conflicts
  const ports =
    opts.ports && opts.ports.length ? opts.ports : [3000, 5173, 8000];
  for (const p of ports) {
    const free = await checkPort(p);
    if (!free) {
      ok = false;
      log.warn(`Port ${p} appears to be in use`);
    }
  }

  if (opts.json) {
    return {
      ok,
      errors,
      warnings,
      checks,
    };
  }

  if (!ok) {
    log.err("Doctor found issues");
    return 1;
  }
  log.ok("All checks passed");
  return 0;
}
