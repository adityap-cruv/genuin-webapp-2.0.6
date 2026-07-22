import { useCallback } from "react";

import { readResourceSnapshot, type ResourceSnapshot } from "@cxr/monitoring/resourceMonitor";

/** Return value of {@link useResourceMonitor}. */
export interface UseResourceMonitorResult {
  /**
   * Stable reader for a fresh resource snapshot (computed on demand from the Performance
   * timeline). Pass `scopeHost` (the ad iframe's host) to scope byte accounting to the ad;
   * omit it for a page-wide fallback. Pass to `@cxr/monitoring/useHeavyAdReporter` so the
   * "Ad Removed" event (and its inferred-breach fallback) can read live snapshots.
   */
  getSnapshot: (scopeHost?: string) => ResourceSnapshot | null;
}

/**
 * Expose a pull-based resource snapshot for the current widget instance.
 *
 * Reads the three Chrome Heavy-Ad-Intervention dimensions (transfer bytes, peak/total
 * main-thread CPU) from the browser Performance timeline on demand. **Passive and
 * pull-only** — no interval of its own, no threshold alerting; the interval/lifecycle
 * polling lives in `useHeavyAdReporter`, which calls `getSnapshot` on its own schedule.
 *
 * @example
 * const { getSnapshot } = useResourceMonitor();
 * useHeavyAdReporter({ getSnapshot, ... });
 */
export function useResourceMonitor(): UseResourceMonitorResult {
  const getSnapshot = useCallback((scopeHost?: string): ResourceSnapshot | null => readResourceSnapshot(scopeHost), []);
  return { getSnapshot };
}
