import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { PromptObject } from "prompts";

export interface PeezyPlugin {
  name: string;
  extendPrompts?: (questions: PromptObject[]) => PromptObject[];
  onAfterScaffold?: (ctx: { projectPath: string; options: any }) => Promise<void> | void;
}

export interface PeezyConfig {
  plugins?: (PeezyPlugin | string)[];
}

export async function loadPeezyConfig(cwd = process.cwd()): Promise<PeezyPlugin[]> {
  const candidates = [
    "peezy.config.mjs",
    "peezy.config.js",
    "peezy.config.cjs",
    "peezy.config.json",
  ];
  for (const file of candidates) {
    const full = path.join(cwd, file);
    if (!fs.existsSync(full)) continue;
    try {
      const mod = await import(pathToFileURL(full).href);
      const cfg: PeezyConfig = (mod.default ?? mod) as PeezyConfig;
      const plugins: PeezyPlugin[] = [];
      for (const p of cfg.plugins ?? []) {
        if (typeof p === "string") {
          try {
            const loaded = await import(p);
            const inst = (loaded.default ?? loaded) as PeezyPlugin;
            if (inst && inst.name) plugins.push(inst);
          } catch {
            // ignore missing plugin
          }
        } else if (p && typeof p === "object" && (p as PeezyPlugin).name) {
          plugins.push(p as PeezyPlugin);
        }
      }
      return plugins;
    } catch {
      return [];
    }
  }
  return [];
}

export function applyExtendPrompts(
  plugins: PeezyPlugin[],
  base: PromptObject[]
): PromptObject[] {
  return plugins.reduce((acc, p) => {
    try {
      return p.extendPrompts ? p.extendPrompts(acc) ?? acc : acc;
    } catch {
      return acc;
    }
  }, base);
}

export async function runAfterScaffold(
  plugins: PeezyPlugin[],
  ctx: { projectPath: string; options: any }
): Promise<void> {
  for (const p of plugins) {
    try {
      if (p.onAfterScaffold) await p.onAfterScaffold(ctx);
    } catch {
      // ignore plugin errors to not break core flow
    }
  }
}
