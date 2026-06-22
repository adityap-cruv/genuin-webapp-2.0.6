import type { LayoutTree } from "./schema";

/**
 * Mobile-first picker: select the {@link LayoutTree} with the largest
 * `minWidth` ≤ the host width. Matches the legacy hierarchical-grid
 * picker semantics (`packages/components/src/legacy/hierarchical-grid/pick-breakpoint.ts`).
 *
 * Assumes the registry has at least one entry — the Zod schema enforces
 * `min(1)` on `Page.breakpoints`. The smallest entry should be
 * `minWidth: 0` so widths below all thresholds still resolve.
 *
 * When the host width is below the smallest `minWidth`, falls back to
 * the first entry in the registry (typically `minWidth: 0`).
 */
export function pickBreakpoint(width: number, registry: readonly LayoutTree[]): LayoutTree {
  // Caller is responsible for the non-empty invariant; the schema enforces
  // it but we defend against runtime drift.
  if (registry.length === 0) {
    throw new Error("pickBreakpoint: registry must contain at least one LayoutTree");
  }
  let chosen = registry[0]!;
  for (const bp of registry) {
    if (width >= bp.minWidth && bp.minWidth >= chosen.minWidth) chosen = bp;
  }
  return chosen;
}
