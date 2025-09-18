/**
 * Utilities for preparing technology lists for version checks
 */

/**
 * Normalize, filter empties, then de‑dupe using a Set.
 */
export function uniqueNormalizedTechs(
  input: string[],
  normalize: (s: string) => string | null
): string[] {
  const normalized = (input || [])
    .map((t) => (t || "").trim())
    .map(normalize)
    .filter((t): t is string => !!t);

  return [...new Set(normalized)];
}
