import type { ChunkName } from "./chunk-loaders";

/**
 * A lifecycle moment that can kick off a prefetch sequence. Triggers are named by
 * WHAT just became available (the parent that loaded), not by which chunks to warm —
 * the chunk list is resolved from the plan below. Add a trigger here, then map it in
 * PREFETCH_PLAN; callers only ever reference the trigger name.
 */
export type PrefetchTrigger = "embed-tile-rendered" | "feed-loaded" | "expand-opened";

/**
 * Prefetch is OPT-IN per brand. Only brand_ids present in this map prefetch anything;
 * every other brand gets no prefetch AND never loads the heavy prefetch core chunk
 * (the hook bails before dynamically importing it — see use-chunk-prefetch.ts).
 *
 * Each brand lists the full ordered (parent → child) sequence per trigger. Mirrors the
 * existing brand_id-keyed maps in the codebase (e.g. BRAND_OVERLAY_Z_INDEX in
 * root-portal.tsx). Add a brand by adding an entry here — no flow code changes.
 */
type PrefetchPlan = Record<number, Partial<Record<PrefetchTrigger, ChunkName[]>>>;

export const PREFETCH_PLAN: PrefetchPlan = {
  // iHeart (2922): sectioned feed — warm sectionedContent (its swiper content) plus
  // the brand control layer and the sectioned expand view.
  2922: {
    "embed-tile-rendered": [
      "expandView",
      "feedView",
      "playerList",
      "nonSectionedContent",
      "player",
      "feedPlayer",
      "controlLayerIheart",
      "expandSectioned",
    ],
  },
  // Brand 3219: non-sectioned feed. Sequence is the explicit order requested for this
  // brand. The static modules in the conceptual flow (ExpandViewLoader, FeedSkeleton)
  // are NOT listed — they are statically imported and already ship in the embed chunk,
  // so there is no separate chunk to warm.
  // embed-expand-view → feed → non-section-content → player-list → player → feed-player.
  3219: {
    "embed-tile-rendered": ["expandView", "feedView", "nonSectionedContent", "playerList", "player", "feedPlayer"],
  },
  // write for another brands as well
};

/**
 * True if prefetching is configured for this brand. The hook calls this FIRST and
 * bails when false — so unregistered brands never even dynamically import the heavy
 * prefetch core (loaders + scheduler). Light, static, no runtime deps.
 */
export function isPrefetchEnabled(brandId?: number): boolean {
  return brandId != null && PREFETCH_PLAN[brandId] != null;
}

/**
 * Resolve the ordered chunk sequence for a (trigger, brandId). Returns [] for any
 * brand not in PREFETCH_PLAN, or a registered brand with no entry for this trigger.
 */
export function resolvePrefetchSequence(trigger: PrefetchTrigger, brandId?: number): ChunkName[] {
  if (brandId == null) return [];
  return PREFETCH_PLAN[brandId]?.[trigger] ?? [];
}
