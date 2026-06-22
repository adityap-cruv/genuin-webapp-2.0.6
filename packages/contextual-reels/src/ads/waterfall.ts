/**
 * Ad waterfall — consolidated from:
 *   ads/waterfall.ts (pure gating functions)
 *   ads/waterfallCallbacks.ts (side-effectful embedding-page notifications)
 *   ads/genaiBridge.ts (GenAI SDK event bridge)
 */
import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/waterfall");

/**
 * Tag IDs that should only trigger the fill/no-fill callback once per page
 * load, regardless of how many ad slots are on the page.
 */
export const SINGLE_HIT_TAG_IDS: ReadonlySet<string> = new Set([
  "69b298e3d6a6ad57e7b9a464",
  "69b298f4d6a6ad57e7b9a499",
  // 300x600
  "69b298e3d6a6ad57e7b9a464",
  // 300x250
  "69b298f4d6a6ad57e7b9a499",
  // 320x100
  "6a032e34054c8fcb08582510",
  // 320x50
  "6a032de445fa9f171bd291cb",
]);

/**
 * Returns `true` if the fill event should be counted (and thus forwarded).
 *
 * Single-hit tags suppress all fills after the first.
 *
 * @param tagId           The tag identifier.
 * @param currentFillCount Number of fills already counted this session.
 *
 * @example
 * ```ts
 * if (shouldCountFill(tagId, fillCount.current)) {
 *   fillCount.current += 1;
 *   notifyAdFill();
 * }
 * ```
 */
export function shouldCountFill(tagId: string, currentFillCount: number): boolean {
  if (SINGLE_HIT_TAG_IDS.has(tagId) && currentFillCount >= 1) return false;
  return true;
}

/**
 * Returns `true` if the no-fill event should be counted (and thus forwarded).
 *
 * Single-hit tags suppress all no-fills after the first.
 *
 * @param tagId               The tag identifier.
 * @param currentNoFillCount  Number of no-fills already counted this session.
 *
 * @example
 * ```ts
 * if (shouldCountNoFill(tagId, noFillCount.current)) {
 *   noFillCount.current += 1;
 *   notifyAdNoFill();
 * }
 * ```
 */
export function shouldCountNoFill(tagId: string, currentNoFillCount: number): boolean {
  if (SINGLE_HIT_TAG_IDS.has(tagId) && currentNoFillCount >= 1) return false;
  return true;
}

// ─── Waterfall callbacks ──────────────────────────────────────────────────────

/**
 * Notify the embedding page that an ad filled successfully.
 *
 * Posts `{ type: 'adFillCallback' }` to the parent frame (when in an iframe)
 * and invokes `window.adFillCallback()` when present.
 *
 * Callback errors are caught and logged — they must never propagate.
 */
export function notifyAdFill(): void {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "adFillCallback" }, "*");
  }

  const cb = (window as Window & { adFillCallback?: () => void }).adFillCallback;
  try {
    if (typeof cb === "function") {
      cb();
    }
  } catch (error) {
    _logger.error("Error while calling window.adFillCallback:", error);
  }
}

/**
 * Notify the embedding page that the ad waterfall found no ads to fill.
 *
 * Posts `{ type: 'noAdsCallback' }` to the parent frame (when in an iframe)
 * and invokes `window.noAdsCallback()` when present.
 *
 * Callback errors are caught and logged — they must never propagate.
 */
export function notifyAdNoFill(): void {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "noAdsCallback" }, "*");
  }

  const cb = (window as Window & { noAdsCallback?: () => void }).noAdsCallback;
  try {
    if (typeof cb === "function") {
      cb();
    }
  } catch (error) {
    _logger.error("Error while calling window.noAdsCallback:", error);
  }
}

// ─── GenAI bridge ─────────────────────────────────────────────────────────────

/**
 * Install per-instance bus listeners for the GenAI SDK ad events.
 *
 * The GenAI SDK dispatches `genai:onFill` and `genai:onNoFill` on `window`,
 * but `GenAIProvider` bridges those window events onto the per-instance
 * {@link CxrEventBus}. This function subscribes to the bus so that only the
 * correct widget instance reacts to each event.
 *
 * Returns a cleanup function that unsubscribes both listeners. Call it from the
 * React `useEffect` cleanup, or when the widget unmounts.
 *
 * @param bus       The per-instance event bus (from `useEventBus()`).
 * @param onFill    Called when the GenAI SDK reports an ad fill.
 * @param onNoFill  Called when the GenAI SDK reports no ad fill.
 * @returns Cleanup function that removes both bus subscriptions.
 */
export function installGenaiBridge(bus: CxrEventBus, onFill: () => void, onNoFill: () => void): () => void {
  const unsubFill = bus.on("genai:onFill", () => onFill());
  const unsubNoFill = bus.on("genai:onNoFill", () => onNoFill());

  return () => {
    unsubFill();
    unsubNoFill();
  };
}
