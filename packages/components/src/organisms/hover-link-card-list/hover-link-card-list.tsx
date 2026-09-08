"use client";

import { cn } from "@genuin/ui/lib/utils";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { MEDIA_QUERIES } from "@genuin/components/hooks/use-devide-detect-media-query";
import { LinkCard, type LinkMetaData } from "@genuin/components/molecules/linkout-new/link-card";

export type ContextualLinkMetaData = LinkMetaData & {
  /**
   * Stable identifier for this item. Optional so existing callers keep working;
   * consumers that need one (e.g. broadcasting an `item:select` on an
   * `EventSurface`) should fall back to `link`, which is naturally unique.
   */
  id?: string;
  video_id?: string | null;
};

export interface HoverLinkCardListProps {
  items: readonly ContextualLinkMetaData[];
  activeVideoId?: string | null;
  /** Keep the item matching `activeVideoId` visually expanded and scrolled to the leading edge. */
  pinActiveItemToTop?: boolean;
  showContainerBorder?: boolean;
  width?: number | string;
  height?: number | string;
  gap?: number;
  ctaText?: string;
  initialExpandedIndex?: number;
  autoRotate?: boolean;
  pauseOnHover?: boolean;
  rotationIntervalMs?: number;
  animationDurationMs?: number;
  ariaLabel?: string;
  className?: string;
  onLinkClick?: (item: ContextualLinkMetaData, index: number) => void;
  /**
   * Fired when the USER changes the expanded card by scrolling the list (the card that
   * lands at the leading edge becomes the expanded one). Not fired for programmatic scrolls
   * (`activeVideoId` changes, auto-rotate, click) — use it to make the video follow the
   * list, e.g. `onActiveItemChange={(item) => playVideo(item.video_id)}`.
   */
  onActiveItemChange?: (item: ContextualLinkMetaData, index: number) => void;
  /**
   * Step scrolling: each wheel/trackpad gesture moves exactly ONE card (the next card
   * scrolls to the leading edge and expands) instead of free scrolling; touch scrolling expands
   * the nearest card. Fires `onActiveItemChange` for every step. @default false
   */
  stepScroll?: boolean;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

/**
 * Vertical link-card list that reuses the existing LinkCard states:
 * compact cards render `default`; the hovered or keyboard-focused card
 * renders `expand-view` with its description. The viewport advances down the
 * forward-only feed on a timer and pauses while the user interacts with it.
 * Existing items remain scrollable above; appended `items` enter below.
 */
export function HoverLinkCardList({
  items,
  activeVideoId,
  pinActiveItemToTop = false,
  width = 332,
  height = 387,
  gap = 8,
  ctaText = "Read More",
  initialExpandedIndex = 0,
  autoRotate = true,
  pauseOnHover = true,
  rotationIntervalMs = 3000,
  animationDurationMs = 500,
  ariaLabel = "Related links",
  showContainerBorder = true,
  className,
  onLinkClick,
  onActiveItemChange,
  stepScroll = false,
}: HoverLinkCardListProps) {
  // Default to the mobile presentation for SSR, then resolve the viewport before paint. This
  // keeps the server/client markup stable without making phones briefly render compact cards.
  const isMobile = useMediaQuery(MEDIA_QUERIES.MOBILE, {
    defaultValue: true,
    initializeWithValue: false,
  });
  const orderedItems = useMemo(() => {
    const entries = items.map((item, sourceIndex) => ({
      item,
      sourceIndex,
      key: `${item.video_id ?? item.link}-${sourceIndex}`,
    }));
    return entries;
  }, [items]);

  const fallbackExpandedIndex = Math.min(Math.max(initialExpandedIndex, 0), Math.max(orderedItems.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(fallbackExpandedIndex);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef(false);
  /** Timestamp until which `scroll` events are ours (smooth `scrollTo`), not the user's. */
  const programmaticScrollUntilRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0, animationDurationMs);
  const tailSpace = typeof height === "number" ? Math.max(0, height - 80) : 307;
  const isControlledPinned = pinActiveItemToTop && Boolean(activeVideoId);

  const alignItemToStart = useCallback((index: number) => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const item = track?.querySelector<HTMLElement>(`[data-item-index="${index}"]`);
    if (!section || !track || !item) return;

    const isHorizontal = getComputedStyle(track).flexDirection === "row";
    const sectionRect = section.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const sectionStyle = getComputedStyle(section);

    if (isHorizontal) {
      const paddingLeft = Number.parseFloat(sectionStyle.paddingLeft) || 0;
      section.scrollLeft += itemRect.left - sectionRect.left - paddingLeft;
      return;
    }

    const paddingTop = Number.parseFloat(sectionStyle.paddingTop) || 0;
    section.scrollTop += itemRect.top - sectionRect.top - paddingTop;
  }, []);

  const scrollItemToStart = useCallback(
    (index: number, animate = true) => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const item = track?.querySelector<HTMLElement>(`[data-item-index="${index}"]`);
      if (!section || !track || !item) return;

      const isHorizontal = getComputedStyle(track).flexDirection === "row";
      const sectionRect = section.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const sectionStyle = getComputedStyle(section);
      const sectionStart = isHorizontal ? sectionRect.left : sectionRect.top;
      const itemStart = isHorizontal ? itemRect.left : itemRect.top;
      const paddingStart = Number.parseFloat(isHorizontal ? sectionStyle.paddingLeft : sectionStyle.paddingTop) || 0;
      const currentScroll = isHorizontal ? section.scrollLeft : section.scrollTop;
      const maxScroll = isHorizontal
        ? Math.max(0, section.scrollWidth - section.clientWidth)
        : Math.max(0, section.scrollHeight - section.clientHeight);
      const rawTarget = itemStart - sectionStart - paddingStart + currentScroll;
      const target = Math.max(0, Math.min(rawTarget, maxScroll));

      // Mark the upcoming scroll events as programmatic so `onScroll` doesn't treat
      // them as the user scrolling (which would re-sync the active card mid-animation).
      programmaticScrollUntilRef.current = Date.now() + (animate && !prefersReducedMotion ? 800 : 100);

      if (animate && !prefersReducedMotion) {
        section.scrollTo(isHorizontal ? { left: target, behavior: "smooth" } : { top: target, behavior: "smooth" });
        return;
      }

      if (isHorizontal) section.scrollLeft = target;
      else section.scrollTop = target;
    },
    [prefersReducedMotion]
  );

  const queueScrollToIndex = useCallback(
    (index: number) => {
      // Arm the guard NOW: the expanding/collapsing cards reflow the list before the
      // rAF-deferred scroll runs, and that reflow already emits `scroll` events.
      programmaticScrollUntilRef.current = Math.max(programmaticScrollUntilRef.current, Date.now() + 1000);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = window.requestAnimationFrame(() => {
          scrollItemToStart(index);
        });
      });
    },
    [scrollItemToStart]
  );

  useEffect(() => {
    if (!activeVideoId) return;

    const matchedIndex = orderedItems.findIndex(({ item }) => item.video_id === activeVideoId);
    if (matchedIndex < 0) return;

    setActiveIndex(matchedIndex);
    queueScrollToIndex(matchedIndex);
  }, [activeVideoId, orderedItems, queueScrollToIndex]);

  const startAdvance = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex >= orderedItems.length || isSliding) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const currentItem = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${activeIndex}"]`);
    const nextItem = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${nextIndex}"]`);
    if (!section || !track || !currentItem || !nextItem) return;

    const isHorizontal = getComputedStyle(track).flexDirection === "row";
    const currentRect = currentItem.getBoundingClientRect();
    const nextRect = nextItem.getBoundingClientRect();
    const distance = isHorizontal ? nextRect.left - currentRect.left : nextRect.top - currentRect.top;
    if (distance <= 0) return;

    if (prefersReducedMotion || normalizedDuration === 0) {
      isAutoScrollingRef.current = true;
      if (isHorizontal) section.scrollLeft += distance;
      else section.scrollTop += distance;
      setActiveIndex(nextIndex);
      animationFrameRef.current = window.requestAnimationFrame(() => {
        alignItemToStart(nextIndex);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          isAutoScrollingRef.current = false;
        });
      });
      return;
    }

    isAutoScrollingRef.current = true;
    setIsSliding(true);
    const startScroll = isHorizontal ? section.scrollLeft : section.scrollTop;
    const startTime = performance.now();

    const animateScroll = (time: number) => {
      const progress = Math.min(1, (time - startTime) / normalizedDuration);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextScroll = startScroll + distance * easedProgress;
      if (isHorizontal) section.scrollLeft = nextScroll;
      else section.scrollTop = nextScroll;

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateScroll);
        return;
      }

      setActiveIndex(nextIndex);
      setIsSliding(false);
      animationFrameRef.current = window.requestAnimationFrame(() => {
        alignItemToStart(nextIndex);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          isAutoScrollingRef.current = false;
        });
      });
    };

    animationFrameRef.current = window.requestAnimationFrame(animateScroll);
  }, [activeIndex, alignItemToStart, isSliding, normalizedDuration, orderedItems.length, prefersReducedMotion]);

  useEffect(() => {
    if (!autoRotate || isInteractionPaused || isSliding || activeIndex >= orderedItems.length - 1) return;

    const timer = window.setTimeout(startAdvance, Math.max(0, rotationIntervalMs));
    return () => window.clearTimeout(timer);
  }, [activeIndex, autoRotate, isInteractionPaused, isSliding, orderedItems.length, rotationIntervalMs, startAdvance]);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
    },
    []
  );

  const syncActiveCardWithScroll = useCallback(
    (notify = false) => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const cardElements = track?.querySelectorAll<HTMLElement>("[data-item-index]");
      if (!section || !track || !cardElements?.length || isAutoScrollingRef.current) return;

      const isHorizontal = getComputedStyle(track).flexDirection === "row";
      const sectionRect = section.getBoundingClientRect();
      const sectionStyle = getComputedStyle(section);
      const contentStart = isHorizontal
        ? sectionRect.left + (Number.parseFloat(sectionStyle.paddingLeft) || 0)
        : sectionRect.top + (Number.parseFloat(sectionStyle.paddingTop) || 0);
      let closestIndex = activeIndex;
      let closestDistance = Number.POSITIVE_INFINITY;

      cardElements.forEach((element) => {
        const elementRect = element.getBoundingClientRect();
        const distance = Math.abs((isHorizontal ? elementRect.left : elementRect.top) - contentStart);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = Number(element.dataset.itemIndex);
        }
      });

      setActiveIndex(closestIndex);
      if (notify && closestIndex !== activeIndex) {
        const entry = orderedItems[closestIndex];
        if (entry) onActiveItemChange?.(entry.item, closestIndex);
      }
    },
    [activeIndex, orderedItems, onActiveItemChange]
  );

  // Step scrolling — one card per wheel gesture. Registered natively (non-passive) so the
  // default free scroll can be prevented.
  //
  // Gesture detection uses the events' own `timeStamp`s (when the OS generated them), NOT
  // the time we process them: on a busy main thread (many videos, animations) events are
  // delivered late and bunched, and a wall-clock cooldown then either splits one gesture
  // into several steps or swallows a real one ("random" jumps / stuck). A gesture ends when
  // there is a quiet gap between events, or the direction reverses.
  const intendedIndexRef = useRef(activeIndex);
  useEffect(() => {
    intendedIndexRef.current = activeIndex;
  }, [activeIndex]);
  const lastWheelTsRef = useRef(-Infinity);
  const lastWheelDirectionRef = useRef(0);
  const lastStepTsRef = useRef(-Infinity);
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!stepScroll || !section || !track) return;

    const GESTURE_GAP_MS = 50; // quiet time (between events) that ends a gesture
    const MIN_STEP_INTERVAL_MS = 100; // never two steps closer than this (event time)
    const MIN_DELTA = 4; // ignore sub-pixel jitter only — the FIRST real event steps immediately

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const isHorizontal = getComputedStyle(track).flexDirection === "row";
      const primaryDelta =
        isHorizontal && Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(primaryDelta) < MIN_DELTA) return;
      const ts = event.timeStamp;
      const direction = primaryDelta > 0 ? 1 : -1;
      const gap = ts - lastWheelTsRef.current;
      const isNewGesture = gap > GESTURE_GAP_MS || direction !== lastWheelDirectionRef.current;
      lastWheelTsRef.current = ts;
      lastWheelDirectionRef.current = direction;
      if (!isNewGesture) return; // inertia / continuation of the gesture that already stepped
      if (ts - lastStepTsRef.current < MIN_STEP_INTERVAL_MS) return;

      // Base the step on the index we last INTENDED (updated synchronously) — under jank
      // React may not have re-rendered yet and `activeIndex` would be stale.
      const nextIndex = Math.max(0, Math.min(orderedItems.length - 1, intendedIndexRef.current + direction));
      if (nextIndex === intendedIndexRef.current) return;
      lastStepTsRef.current = ts;
      intendedIndexRef.current = nextIndex;
      setIsInteractionPaused(true);
      setActiveIndex(nextIndex);
      queueScrollToIndex(nextIndex);
      const entry = orderedItems[nextIndex];
      if (entry) onActiveItemChange?.(entry.item, nextIndex);
    };

    section.addEventListener("wheel", onWheel, { passive: false });
    return () => section.removeEventListener("wheel", onWheel);
  }, [stepScroll, orderedItems, queueScrollToIndex, onActiveItemChange]);

  const selectCard = useCallback(
    (item: ContextualLinkMetaData, index: number) => {
      // Preserve the top-level page scroll position — clicking a focusable
      // card can cause the browser to scroll the viewport to the element.
      // Remember the current window scroll and restore it after the
      // internal list scroll finishes so the page doesn't jump.
      const pageScrollX = window.scrollX || window.pageXOffset;
      const pageScrollY = window.scrollY || window.pageYOffset;

      setActiveIndex(index);
      queueScrollToIndex(index);

      // Restore page scroll shortly after the list's scroll animation
      // completes. Use normalizedDuration as a guide; add a small buffer.
      const restoreDelay = Math.max(0, normalizedDuration) + 60;
      window.setTimeout(() => window.scrollTo(pageScrollX, pageScrollY), restoreDelay);

      onLinkClick?.(item, index);
    },
    [normalizedDuration, onLinkClick, queueScrollToIndex]
  );

  if (orderedItems.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-label={ariaLabel}
      className={cn(
        // The stacked mobile/tablet home layout is a sideways, snapping card rail.
        // `lg` and up retain the original vertical list and scrollbar.
        "gencl:box-border gencl:overflow-x-auto gencl:overflow-y-hidden gencl:snap-x gencl:snap-mandatory",
        "gencl:overscroll-x-contain gencl:max-lg:[scrollbar-width:none]",
        "gencl:max-lg:[&::-webkit-scrollbar]:hidden",
        "gencl:max-lg:h-fit!",
        "gencl:lg:overflow-x-hidden! gencl:lg:overflow-y-auto! gencl:lg:snap-none! gencl:lg:overscroll-x-auto!",
        "gencl:rounded-xl gencl:bg-white gencl:p-1",
        showContainerBorder && "gencl:ring-1 gencl:ring-secondary-200 gencl:ring-inset",
        className
      )}
      // Horizontal snap is mobile-only; desktop intentionally stays unsnapped because
      // expanding/collapsing cards changes their vertical positions during step scrolling.
      style={{ width, height, overflowAnchor: "none" }}
      onMouseEnter={() => {
        if (pauseOnHover) setIsInteractionPaused(true);
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsInteractionPaused(false);
        if (!isSliding && !isControlledPinned) syncActiveCardWithScroll();
      }}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsInteractionPaused(false);
          if (!isSliding && !isControlledPinned) syncActiveCardWithScroll();
        }
      }}
      onScroll={() => {
        // Ignore our own scrolls (auto-rotate, pin-to-active, click); a real user scroll
        // expands the card that lands at the leading edge and reports it to the parent.
        if (isAutoScrollingRef.current || Date.now() < programmaticScrollUntilRef.current) return;
        if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = window.setTimeout(() => syncActiveCardWithScroll(true), 120);
      }}>
      <div
        ref={trackRef}
        data-slot="hover-link-card-track"
        className="gencl:flex gencl:flex-row gencl:max-lg:pb-0! gencl:lg:flex-col!"
        style={{
          gap,
          paddingBottom: tailSpace,
        }}>
        {orderedItems.map(({ item, key }, index) => {
          const isActive = activeIndex === index;
          // Phones keep every card at the same rich size while the user swipes. Wider viewports
          // retain the existing active-expanded/rest-compact behaviour.
          const isExpanded = isMobile || isActive;

          return (
            <motion.div
              layout={false}
              transition={{
                layout: {
                  duration: normalizedDuration / 1000,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              key={key}
              data-slot="hover-link-card-item"
              data-item-index={index}
              data-video-id={item.video_id ?? undefined}
              data-expanded={isExpanded ? "true" : "false"}
              className="gencl:w-[calc(100%_-_1.5rem)] gencl:shrink-0 gencl:snap-start gencl:lg:w-auto! gencl:lg:[scroll-snap-align:none]"
              onClick={() => selectCard(item, index)}
              onMouseEnter={() => {
                if (pauseOnHover && !isSliding && !isControlledPinned) setActiveIndex(index);
              }}
              onFocusCapture={() => {
                if (!isSliding && !isControlledPinned) setActiveIndex(index);
              }}>
              <LinkCard
                data={item}
                sheetState={isExpanded ? "expand-view" : "default"}
                density="compact"
                compactThumbnailSize={{ width: 90, height: 90 }}
                showFullTitle
                expandedTitleMinHeight={isMobile ? 40 : undefined}
                theme="light"
                ctaText={ctaText}
                ctaLink={item.link}
                onClick={() => selectCard(item, index)}
                onCtaClick={() => selectCard(item, index)}
              />
            </motion.div>
          );
        })}
        <span aria-hidden className="gencl:w-6 gencl:shrink-0 gencl:lg:hidden" />
      </div>
    </section>
  );
}
