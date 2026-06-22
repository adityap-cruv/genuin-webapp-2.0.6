import type { Breakpoint } from "./types";

/**
 * Mobile-first picker: select the registry entry with the largest
 * `minWidth` that is ≤ the host width. Identical rule to the reference
 * harness in `Downloads/genuin/grid/grid.js`.
 *
 * Assumes the registry has at least one entry with `minWidth: 0` (the
 * fallback). The current registry is sorted ascending but this function
 * does not require sorted input.
 */
export function pickBreakpoint(width: number, registry: Breakpoint[]): Breakpoint {
  let chosen = registry[0]!;
  for (const bp of registry) {
    if (width >= bp.minWidth && bp.minWidth >= chosen.minWidth) chosen = bp;
  }
  return chosen;
}
