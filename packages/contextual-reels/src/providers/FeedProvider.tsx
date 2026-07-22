/**
 * FeedProvider — owns feed data state and load lifecycle.
 *
 * Responsibilities:
 *  1. Create feed generator via createFeedGenerator.
 *  2. Fetch raw reels and apply normaliseFeed.
 *  3. Emit analytics events matching the legacy sequence.
 *  4. Expose useFeed() hook with entries, activeIndex, and the active-slide
 *     derivation (isAdActive/activeReel) consumers used to compute themselves.
 *
 * Mounted below `PlayerProvider` in `FeedTree` (not above, like most other
 * feed-tree providers) specifically so it can read `usePlayer()` for the
 * active-slide derivation.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import { getActiveSlideState } from "@cxr/feed/activeSlideState";
import { normaliseFeed } from "@cxr/feed/feedTransforms";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";
import DUMMY_FEED_RESPONSE from "@cxr/providers/dummyFeed.json";
import { createFeedGenerator, setVisitId } from "@cxr/services/feed";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import { getStaticTagData, isStaticTag } from "@cxr/strategies/staticTagData";
import type { FeedEntry, NormalisedReel, Reel } from "@cxr/types";
import { generateUuid } from "@cxr/userId";

import { useTagDetails } from "./TagDetailsProvider";

// Local-dev toggle: flip true + run `npm run dev` to serve the bundled fixture. The
// `import.meta.env.DEV &&` guard folds to false in every `vite build`, so the fixture
// reference dies and Rollup tree-shakes the ~66 KB JSON out — it can never ship.
const DEV_USE_DUMMY_FEED = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- import.meta.env shape is bundler-defined
const USE_DUMMY_FEED = Boolean((import.meta as any).env?.DEV) && DEV_USE_DUMMY_FEED;

/** Context value exposed via useFeed. */
export interface FeedContextValue {
  /** Normalised feed entries — discriminated union of reel, ad, static-ad. */
  entries: FeedEntry[];
  /** Currently active item index. Driven by Embla via {@link setActiveIndex}. */
  activeIndex: number;
  /** Set the active item index — wired to Embla's `select` event from the feed. */
  setActiveIndex: (index: number) => void;
  /** True while the initial feed fetch is in-flight. */
  isLoading: boolean;
  /** True when the feed fetch completed but returned no entries, or threw an error. */
  feedFailed: boolean;
  /** True when the active slide is an ad, or a fullscreen ad break is on screen over a reel. */
  isAdActive: boolean;
  /** The active reel's data, or undefined when the active slide is a bare ad (or out of range). */
  activeReel: NormalisedReel | undefined;
}

const FeedContext = createContext<FeedContextValue | undefined>(undefined);

interface FeedProviderProps {
  children: ReactNode;
}

/**
 * FeedProvider — loads and normalises the reel feed, exposes it via useFeed.
 *
 * @example
 * ```tsx
 * <FeedProvider>
 *   <Feed ... />
 * </FeedProvider>
 * ```
 */
export function FeedProvider({ children }: FeedProviderProps): ReactNode {
  const { sendEvent, setBaseEventContext, setMandatoryData } = useAnalytics();
  const { tagId } = useTagDetails();
  const { adBreakEnabled, gateOnUnmute, adsDisabled, servedStatically } = useStrategy();
  const { isAdBreakActive } = usePlayer();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedFailed, setFeedFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setFeedFailed(false);

    async function loadFeed(): Promise<void> {
      try {
        // Service-layer Reel has looser optional types than domain Reel; cast at this boundary.
        let reels: Reel[];
        // Fixtures load lazily (per-tag chunk); only a static tag awaits them. A
        // failed/missing lookup resolves undefined so we fall back to the real
        // /feed below rather than failing the feed — "static but no data → hit the
        // API" (matches the useTagLoader fallback). Gated on the flag AND registry
        // membership — same invariant as useTagLoader / genAdSdk, so a
        // flagged-but-unregistered tag never pulls a fixture chunk.
        const isServedStatically = isStaticTag(tagId, servedStatically);
        const staticEntry = isServedStatically ? await getStaticTagData(tagId).catch(() => undefined) : undefined;
        if (staticEntry) {
          // Static AD-only tag: serve the committed feed, skip /feed. Mirror the
          // analytics createFeedGenerator would emit so the funnel is identical to
          // a real single populated batch: BATCH_STARTED, then (after "loading")
          // FEED_API_CALL_COMPLETED. (BATCH_COMPLETED/FEED_COMPLETED/TAG_DISPLAYED
          // only fire on later or empty batches — not a first populated batch.)
          sendEvent(EVENT.BATCH_STARTED);
          // A fresh id is generated per load (the fixture carries no visit_id) so
          // every session is distinct, mirroring a real /feed response. Emitting
          // these satisfies the analytics buffer's mandatory `visit_id` gate.
          // generateUuid (not bare crypto.randomUUID) so an http:// / older-browser
          // embed — where crypto.randomUUID is absent and throws — still serves the
          // static feed instead of falling into the catch and failing the feed.
          const visitId = generateUuid();
          setVisitId(tagId, visitId);
          setBaseEventContext?.({ visit_id: visitId });
          setMandatoryData?.({ visit_id: visitId });
          sendEvent(EVENT.FEED_API_CALL_COMPLETED);
          reels = staticEntry.feed;
        } else if (USE_DUMMY_FEED) {
          // USE_DUMMY_FEED is gated by `import.meta.env.DEV` and folds to false in
          // every build (see the const above) — this branch is local-dev-only and
          // structurally dead in production/test bundles.
          /* v8 ignore next */
          reels = DUMMY_FEED_RESPONSE.data.reels as unknown as Reel[];
        } else {
          // createFeedGenerator is scoped to this effect invocation — no ref
          // needed. Built lazily so a static AD-only tag never constructs it.
          const fetchFeed = createFeedGenerator({
            tagId,
            sendEvent,
            setBaseEventContext,
            setMandatoryData,
          });
          reels = (await fetchFeed()) as unknown as Reel[];
        }

        if (cancelled) return;

        if (!reels.length) {
          setFeedFailed(true);
          return;
        }

        const normalised = normaliseFeed(reels, tagId, adBreakEnabled, gateOnUnmute, adsDisabled);

        setEntries(normalised);
        setActiveIndex(0);
      } catch {
        if (!cancelled) setFeedFailed(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadFeed();

    return () => {
      cancelled = true;
    };
    // sendEvent is stable from useAnalytics;
    // because the feed is only loaded once per tagId mount, not re-normalised on prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId]);

  const { isAdActive, activeReel } = getActiveSlideState(entries, activeIndex, isAdBreakActive);

  const value = useMemo<FeedContextValue>(
    () => ({ entries, activeIndex, setActiveIndex, isLoading, feedFailed, isAdActive, activeReel }),
    [entries, activeIndex, isLoading, feedFailed, isAdActive, activeReel]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

/**
 * Hook accessor for the feed context.
 *
 * @throws Error when called outside a {@link FeedProvider}.
 */
export function useFeed(): FeedContextValue {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error("useFeed must be used inside <FeedProvider>");
  }
  return ctx;
}
