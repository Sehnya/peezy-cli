/**
 * Normalize various technology aliases to canonical keys used by checkers.
 * Return null for unknown/unsupported technologies.
 */
export function normalizeTech(input: string): string | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  // Collapse punctuation and spaces
  const compact = s.replace(/[^a-z0-9]+/g, "");

  // Node.js aliases
  if (compact === "node" || compact === "nodejs" || compact === "nodejavascript" || compact === "nodejsruntime") {
    return "nodejs";
  }

  // Python aliases (future)
  if (compact === "python" || compact === "cpython" || compact === "py") {
    return "python"; // no checker yet; consumer may filter
  }

  // Bun aliases (future)
  if (compact === "bun") {
    return "bun";
  }

  // Deno aliases (future)
  if (compact === "deno") {
    return "deno";
  }

  // If it's scoped like npm package @scope/name, keep as-is (package checks future)
  if (s.startsWith("@") || s.includes("/")) {
    return s; // allow package names to pass through
  }

  return null;
}
