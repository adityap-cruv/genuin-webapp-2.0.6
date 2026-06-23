import type { PlayerControlSize } from "@genuin/ui/player-controls";

/** Single source of truth for V2 control sizes per CXR layout. Tune any cell here. */
const CONTROL_SIZE_BY_LAYOUT: Record<string, { collapse: PlayerControlSize; fullscreen: PlayerControlSize }> = {
  "mobile-320x50": { collapse: "xs", fullscreen: "lg" },
  "mobile-320x100": { collapse: "sm", fullscreen: "lg" },
  "desktop-300x250": { collapse: "sm", fullscreen: "lg" },
  "desktop-300x600": { collapse: "sm", fullscreen: "lg" },
};

/** Used for `unknown`/default layouts and provider-less test renders. */
const FALLBACK_SIZE = { collapse: "md", fullscreen: "lg" } as const;

/** V2 control size for a CXR layout + fullscreen state (`undefined` adLayout → fallback row). */
export function resolveCxrControlSize(adLayout: string | undefined, isFullScreen: boolean): PlayerControlSize {
  const row = (adLayout && CONTROL_SIZE_BY_LAYOUT[adLayout]) || FALLBACK_SIZE;
  return isFullScreen ? row.fullscreen : row.collapse;
}
