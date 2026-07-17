/**
 * Ad waterfall — consolidated from:
 *   ads/waterfallCallbacks.ts (side-effectful embedding-page notifications)
 *   ads/genaiBridge.ts (GenAI SDK event bridge)
 */
import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/waterfall");

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
