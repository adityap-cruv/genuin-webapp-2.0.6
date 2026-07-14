/**
 * FeedProvider — owns feed data state and load lifecycle.
 *
 * Responsibilities:
 *  1. Create feed generator via createFeedGenerator.
 *  2. Fetch raw reels and apply normaliseFeed.
 *  3. Emit analytics events matching the legacy sequence.
 *  4. Expose useFeed() hook with entries and activeIndex.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { normaliseFeed } from "@cxr/feed/feedTransforms";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import DUMMY_FEED_RESPONSE from "@cxr/providers/dummyFeed.json";
import { createFeedGenerator } from "@cxr/services/feed";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import type { FeedEntry, Reel } from "@cxr/types";

const USE_DUMMY_FEED = false;

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
}

const FeedContext = createContext<FeedContextValue | undefined>(undefined);

interface FeedProviderProps {
  children: ReactNode;
  tagId: string;
}

/**
 * FeedProvider — loads and normalises the reel feed, exposes it via useFeed.
 *
 * @example
 * ```tsx
 * <FeedProvider tagId={tagId}>
 *   <Feed ... />
 * </FeedProvider>
 * ```
 */
export function FeedProvider({ children, tagId }: FeedProviderProps): ReactNode {
  const { sendEvent, setBaseEventContext, setMandatoryData } = useAnalytics();
  const { adBreakEnabled, gateOnUnmute, adsDisabled } = useStrategy();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedFailed, setFeedFailed] = useState(false);

  useEffect(() => {
    // createFeedGenerator is scoped to this effect invocation — no ref needed.
    const fetchFeed = createFeedGenerator({
      tagId,
      sendEvent,
      setBaseEventContext,
      setMandatoryData,
    });
    let cancelled = false;
    setIsLoading(true);
    setFeedFailed(false);

    async function loadFeed(): Promise<void> {
      try {
        // Service-layer Reel has looser optional types than domain Reel; cast at this boundary.
        const reels = USE_DUMMY_FEED
          ? (DUMMY_FEED_RESPONSE.data.reels as unknown as Reel[])
          : ((await fetchFeed()) as unknown as Reel[]);

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

  const value = useMemo<FeedContextValue>(
    () => ({ entries, activeIndex, setActiveIndex, isLoading, feedFailed }),
    [entries, activeIndex, isLoading, feedFailed]
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
