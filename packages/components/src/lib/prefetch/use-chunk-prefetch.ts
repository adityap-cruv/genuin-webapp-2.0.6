import { useEffect } from "react";

import { useBaseContext } from "@genuin/components/context";

// Static imports here are LIGHT ONLY: the registry is plain data + a type-only import
// of ChunkName (erased at build), so it pulls in no runtime chunk-loader code. The
// heavy core (chunk-prefetcher → chunk-loaders, which holds every import() thunk) is
// loaded DYNAMICALLY below, and only for brands that have prefetching configured —
// so unregistered brands never fetch or evaluate the prefetch machinery.
import { isPrefetchEnabled, resolvePrefetchSequence, type PrefetchTrigger } from "./prefetch-registry";

/**
 * Begins prefetching the chunk sequence for `trigger` once the calling component is
 * mounted. Runs from a `useEffect`, so nothing is warmed until the parent has rendered
 * ("prefetch only after the parent is loaded").
 *
 * Brand-gated end to end: if the brand isn't registered in PREFETCH_PLAN we bail before
 * importing the prefetch core, so its chunk is never loaded for that brand. For a
 * registered brand we dynamically import the scheduler and enqueue the resolved
 * sequence (sequential + idle inside the prefetcher).
 *
 * Components only name a TRIGGER, never specific chunks — the brand-aware mapping lives
 * in the registry, so a brand or sequence change never touches component code.
 */
export function useChunkPrefetch(trigger: PrefetchTrigger, enabled = true): void {
  const { brandDetails } = useBaseContext();
  const brandId = brandDetails?.brand_id;

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[PREFETCH] hook effect", {
      trigger,
      enabled,
      brandId,
      brandIdType: typeof brandId,
      isEnabled: isPrefetchEnabled(brandId),
      sequence: resolvePrefetchSequence(trigger, brandId),
    });
    if (!enabled || !isPrefetchEnabled(brandId)) return;
    const sequence = resolvePrefetchSequence(trigger, brandId);
    if (sequence.length === 0) return;

    let cancelled = false;
    // Dynamic import: the prefetch core (scheduler + chunk loaders) only enters the
    // bundle graph for registered brands, and only when a trigger actually fires.
    void import("./chunk-prefetcher")
      .then(({ chunkPrefetcher }) => {
        // eslint-disable-next-line no-console
        console.log("[PREFETCH] core loaded, enqueue", { cancelled, sequence });
        if (!cancelled) chunkPrefetcher.enqueue(sequence);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log("[PREFETCH] core import FAILED", e);
      });
    return () => {
      cancelled = true;
    };
  }, [trigger, brandId, enabled]);
}
