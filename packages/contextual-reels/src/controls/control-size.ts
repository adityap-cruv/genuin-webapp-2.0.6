import type { PlayerControlSize } from "@genuin/ui/player-controls";

import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";

/** Single source of truth for V2 control sizes per CXR layout. Tune any cell here. */
const CONTROL_SIZE_BY_LAYOUT: Record<AdLayoutId, { collapse: PlayerControlSize; fullscreen: PlayerControlSize }> = {
  [AD_LAYOUT.Unknown]: { collapse: "md", fullscreen: "lg" },
  [AD_LAYOUT.L1]: { collapse: "sm", fullscreen: "lg" }, // desktop 300×600
  [AD_LAYOUT.L2]: { collapse: "sm", fullscreen: "lg" }, // desktop 300×250
  [AD_LAYOUT.L3]: { collapse: "xs", fullscreen: "lg" }, // mobile 320×50
  [AD_LAYOUT.L4]: { collapse: "sm", fullscreen: "lg" }, // mobile 320×100
  [AD_LAYOUT.L5]: { collapse: "sm", fullscreen: "lg" }, // mobile 320×480
};

/** Used for `undefined`/default layouts and provider-less test renders. */
const FALLBACK_SIZE = { collapse: "md", fullscreen: "lg" } as const;

/** V2 control size for a CXR layout + fullscreen state (`undefined` adLayout → fallback row). */
export function resolveCxrControlSize(adLayout: AdLayoutId | undefined, isFullScreen: boolean): PlayerControlSize {
  const row = (adLayout !== undefined && CONTROL_SIZE_BY_LAYOUT[adLayout]) || FALLBACK_SIZE;
  return isFullScreen ? row.fullscreen : row.collapse;
}
