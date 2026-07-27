import type { EmblaCarouselType } from "embla-carousel";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";

/** Timer data tracked per-index for video_watch analytics. */
export type TimerData = { currentTime: number; duration: number };

/** Options for {@link useEmblaFeed}. */
export interface UseFeedNavigationOptions {
  itemCount: number;
  disabled?: boolean;
  onSlideAway: (index: number, timerData: TimerData | undefined) => void;
  onSlideEnter: (index: number) => void;
  onTimeUpdate: (index: number, currentTime: number, duration: number) => void;
}

/** Return value of {@link useEmblaFeed}. */
export interface UseFeedNavigationResult {
  activeIndex: number;
  /** Indices Embla currently considers in-view — updates during scroll animation. */
  visibleIndices: Set<number>;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  /**
   * Advance one slide as a NON-user transition (video ended). Identical to
   * {@link goNext} except the resulting Swipe Next analytics event reports
   * `auto_swipe: true` — mirrors the Web SDK's `auto_swipe` flag.
   */
  autoAdvance: () => void;
  onTimeUpdate: (index: number, currentTime: number, duration: number) => void;
}

/**
 * Tracks feed navigation state driven by an Embla carousel API instance.
 *
 * Accepts a stable ref to the Embla API (from useEmblaCarousel) so that
 * goNext/goPrev/goTo work immediately after the DOM mounts — no async
 * prop propagation race.
 *
 * Subscribes to Embla's `select` event and fires `onSlideAway`/`onSlideEnter`
 * on each slide transition. Timer data accumulated via `onTimeUpdate` is forwarded
 * to `onSlideAway` on departure so analytics have accurate watch-time.
 *
 * @param emblaApiRef  Stable ref to the live Embla API (non-null after viewport mounts).
 * @param options      Item count, analytics callbacks, and optional disabled flag.
 * @returns Navigation actions and reactive activeIndex.
 */
export function useEmblaFeed(
  emblaApiRef: RefObject<EmblaCarouselType | null>,
  options: UseFeedNavigationOptions
): UseFeedNavigationResult {
  const { onSlideAway, onSlideEnter } = options;

  // Read through a ref (matching the onSlideAway/onSlideEnter pattern below) so
  // the analytics value can never enter handleSelect's dependency array and
  // re-run its effect on a context change.
  const analytics = useAnalytics();
  const analyticsRef = useRef(analytics);
  analyticsRef.current = analytics;
  // Set by autoAdvance() just before it scrolls; consumed (and reset) by the
  // next `select` so that transition reports auto_swipe: true.
  const autoAdvanceRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([0]));
  const activeIndexRef = useRef(0);
  const timerTracker = useRef<Record<number, TimerData | undefined>>({});
  const onSlideAwayRef = useRef(onSlideAway);
  const onSlideEnterRef = useRef(onSlideEnter);
  const optionsRef = useRef(options);
  onSlideAwayRef.current = onSlideAway;
  onSlideEnterRef.current = onSlideEnter;
  optionsRef.current = options;

  const handleSelect = useCallback(() => {
    const api = emblaApiRef.current;
    if (!api) return;
    const newIndex = api.selectedScrollSnap();
    const prevIndex = activeIndexRef.current;
    if (prevIndex === newIndex) return;

    onSlideAwayRef.current(prevIndex, timerTracker.current[prevIndex]);
    activeIndexRef.current = newIndex;
    setActiveIndex(newIndex);
    onSlideEnterRef.current(newIndex);

    const autoSwipe = autoAdvanceRef.current;
    autoAdvanceRef.current = false;
    analyticsRef.current.sendEvent(newIndex > prevIndex ? EVENT.SWIPE_NEXT : EVENT.SWIPE_PREVIOUS, {
      auto_swipe: autoSwipe,
    });
  }, [emblaApiRef]);

  const handleSlidesInView = useCallback(() => {
    const api = emblaApiRef.current;
    if (!api) return;
    setVisibleIndices(new Set(api.slidesInView()));
  }, [emblaApiRef]);

  useEffect(() => {
    const api = emblaApiRef.current;
    if (!api) return;
    api.on("select", handleSelect);
    api.on("slidesInView", handleSlidesInView);
    // Seed with current in-view state on mount.
    setVisibleIndices(new Set(api.slidesInView()));
    return () => {
      api.off("select", handleSelect);
      api.off("slidesInView", handleSlidesInView);
    };
  }, [emblaApiRef, handleSelect, handleSlidesInView]);

  // TODO(gap-5): failedAdIds reset on loop-back missing.
  // Old index.jsx reset failedAdIds.current = new Set() inside makeActiveItem when id === 0.
  // Loop mode IS enabled by default (`feedLoopEnabled`, see docs/STRATEGIES.md) — the
  // original note wrongly assumed it was off — so `newIndex === 0` is reachable by
  // wrapping, not just by scrolling back. To close this, track failed ad IDs here and
  // reset them when newIndex === 0. Tags with `feedLoopEnabled: false` cannot wrap and
  // are therefore unaffected.

  const goNext = useCallback(() => {
    emblaApiRef.current?.scrollNext();
  }, [emblaApiRef]);

  const autoAdvance = useCallback(() => {
    autoAdvanceRef.current = true;
    emblaApiRef.current?.scrollNext();
  }, [emblaApiRef]);

  const goPrev = useCallback(() => {
    emblaApiRef.current?.scrollPrev();
  }, [emblaApiRef]);

  const goTo = useCallback(
    (index: number) => {
      emblaApiRef.current?.scrollTo(index);
    },
    [emblaApiRef]
  );

  const handleTimeUpdate = useCallback((index: number, currentTime: number, duration: number) => {
    timerTracker.current[index] = { currentTime, duration };
    optionsRef.current.onTimeUpdate(index, currentTime, duration);
  }, []);

  return {
    activeIndex,
    visibleIndices,
    goNext,
    goPrev,
    goTo,
    autoAdvance,
    onTimeUpdate: handleTimeUpdate,
  };
}

/**
 * Alias for {@link useEmblaFeed} — kept for backward compatibility with existing callers.
 */
export const useFeedNavigation = useEmblaFeed;
