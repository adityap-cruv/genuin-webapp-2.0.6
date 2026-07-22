/** Tuning for {@link computeSlideMountWindow}. */
export interface SlideMountWindowOptions {
  /**
   * Persistent neighbours to mount on each side of the active slide. `0` (default)
   * = strict active-only (plus whatever is scrolling into view). `1` = ±1 preload.
   */
  radius?: number;
  /**
   * Total slide count. Enables loop wraparound for neighbour indices, matching
   * Embla's `loop:true`. Omit to skip wrapping (out-of-range neighbours are then
   * harmless — they never match a real slide index).
   */
  itemCount?: number;
}

/** Wraps `index` into `[0, itemCount)` when `itemCount` is a positive number. */
function wrapIndex(index: number, itemCount?: number): number {
  if (itemCount === undefined || itemCount <= 0) return index;
  return ((index % itemCount) + itemCount) % itemCount;
}

/**
 * Computes which feed-slide indices should mount their real content (player /
 * ad slot); every other index renders a zero-fetch placeholder.
 *
 * The active index is always included so the live player never unmounts even if
 * Embla's `slidesInView()` is transiently empty (e.g. during a `reInit` when an
 * Octo sheet toggles feed swiping). `visibleIndices` is Embla `slidesInView()`:
 *  - at rest (settled), exactly the active slide fills the viewport → `{active}`
 *  - mid-swipe, both the outgoing and incoming slides intersect the viewport
 *
 * With `radius > 0`, `radius` neighbours on each side of the active slide are also
 * mounted (loop-wrapped via `itemCount`). At `radius = 0`, a slide that is
 * off-screen and not being swiped onto screen is never in this set, so hidden
 * neighbours never mount and therefore never fetch.
 *
 * @param activeIndex     The currently selected slide index.
 * @param visibleIndices  Embla `slidesInView()` — indices intersecting the viewport.
 * @param options         Optional `radius` (neighbour preload) and `itemCount` (loop wrap).
 * @returns The set of indices to mount. Never mutates `visibleIndices`.
 */
export function computeSlideMountWindow(
  activeIndex: number,
  visibleIndices: Set<number>,
  options: SlideMountWindowOptions = {}
): Set<number> {
  const { radius = 0, itemCount } = options;
  const result = new Set<number>([activeIndex, ...visibleIndices]);
  for (let offset = 1; offset <= radius; offset += 1) {
    result.add(wrapIndex(activeIndex + offset, itemCount));
    result.add(wrapIndex(activeIndex - offset, itemCount));
  }
  return result;
}
