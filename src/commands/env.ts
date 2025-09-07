import fs from "node:fs";
import path from "node:path";
import { log } from "../utils/logger.js";

export type EnvCommand =
  | "check"
  | "diff"
  | "generate"
  | "pull:railway"
  | "push:railway";

function parseDotenv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2];
  });
  return out;
}

export async function runEnv(
  cmd: EnvCommand,
  opts: { schema?: string; json?: boolean } = {}
) {
  const cwd = process.cwd();
  const envPath = path.join(cwd, ".env");
  const examplePath = path.join(cwd, ".env.example");
  const schemaPath = opts.schema || path.join(cwd, "peezy.env.schema.json");

  const hasSchema = fs.existsSync(schemaPath);
  const schema: { required: string[]; optional?: string[] } = hasSchema
    ? JSON.parse(fs.readFileSync(schemaPath, "utf8"))
    : { required: [] };

  const env = fs.existsSync(envPath)
    ? parseDotenv(fs.readFileSync(envPath, "utf8"))
    : {};
  const example = fs.existsSync(examplePath)
    ? parseDotenv(fs.readFileSync(examplePath, "utf8"))
    : {};

  if (cmd === "generate") {
    const keys = [
      ...new Set([...(schema.required || []), ...(schema.optional || [])]),
    ];
    const content = keys.map((k) => `${k}=`).join("\n") + "\n";
    fs.writeFileSync(examplePath, content, "utf8");

    if (opts.json) {
      return {
        action: "generate",
        file: examplePath,
        keys: keys.length,
      };
    } else {
      log.ok(".env.example generated");
    }
    return;
  }

  if (cmd === "check") {
    const keys = schema.required || Object.keys(example);
    const missing = keys.filter((k) => !(k in env) || env[k] === "");

    if (opts.json) {
      return {
        action: "check",
        valid: missing.length === 0,
        missing,
        checked: keys.length,
      };
    } else {
      if (missing.length) {
        log.err(`Missing required env vars: ${missing.join(", ")}`);
        process.exitCode = 1;
      } else {
        log.ok("Environment looks good");
      }
    }
    return;
  }

  if (cmd === "diff") {
    const keys = new Set<string>([
      ...Object.keys(example),
      ...Object.keys(env),
    ]);
    const onlyInExample: string[] = [];
    const onlyInEnv: string[] = [];
    for (const k of keys) {
      if (!(k in env) && k in example) onlyInExample.push(k);
      if (!(k in example) && k in env) onlyInEnv.push(k);
    }
    const inSync = onlyInExample.length === 0 && onlyInEnv.length === 0;

    if (opts.json) {
      return {
        action: "diff",
        inSync,
        missingInEnv: onlyInExample,
        extraInEnv: onlyInEnv,
      };
    } else {
      if (inSync) {
        log.ok(".env and .env.example are in sync");
      } else {
        if (onlyInExample.length)
          log.warn(`Missing in .env: ${onlyInExample.join(", ")}`);
        if (onlyInEnv.length)
          log.warn(`Extra in .env: ${onlyInEnv.join(", ")}`);
        process.exitCode = 1;
      }
    }
    return;
  }

  if (cmd === "pull:railway" || cmd === "push:railway") {
    if (opts.json) {
      return {
        action: cmd,
        status: "not_implemented",
        message: "Railway integration is a stub in this version",
      };
    } else {
      log.warn(
        "Railway integration is a stub in this version. Configure API token and implement in future release."
      );
    }
    return;
  }
}
