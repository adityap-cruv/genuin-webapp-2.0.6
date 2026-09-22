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

/** Horizontal travel (px) a touch must cover before a swipe commits to the next card. */
const SWIPE_COMMIT_THRESHOLD_PX = 24;
/** Movement large enough to treat a touch as a drag instead of a card click. */
const CARD_CLICK_DRAG_THRESHOLD_PX = 8;
/** A trackpad's momentum can leave large gaps between wheel events; keep it one gesture. */
const WHEEL_GESTURE_GAP_MS = 180;
/** Prevent a delayed momentum event from becoming a second card transition. */
const WHEEL_STEP_COOLDOWN_MS = 240;

// This list keeps its compact rows independently of the SDK sheet's two-line cards.
const LIST_CARD_CSS = `
  [data-slot="hover-link-card-item"][data-expanded="false"] p[role="link"] {
    display: block !important;
    height: 20px;
    font-size: 14px !important;
    line-height: 20px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [data-slot="hover-link-card-item"][data-expanded="false"] > div > span {
    width: 64px !important;
    height: 64px !important;
  }
  [data-slot="hover-link-card-item"][data-expanded="false"] > div > div {
    justify-content: flex-start !important;
  }
  [data-slot="hover-link-card-item"][data-expanded="false"] > div > div > div,
  [data-slot="hover-link-card-item"] [data-slot="link-card-expanded-title"] + div > div {
    gap: 4px !important;
  }
`;

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
  animationDurationMs = 200,
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
  // Below the desktop breakpoint the list is a horizontal card rail (see the `max-lg` classes on
  // the scroller); at and above it, it is the original vertical list.
  const isDesktopViewport = useMediaQuery(MEDIA_QUERIES.DESKTOP, {
    defaultValue: false,
    initializeWithValue: false,
  });
  const isRail = !isDesktopViewport;
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
  const suppressCardClickUntilRef = useRef(0);
  /** Timestamp until which `scroll` events belong to our animation, not the user. */
  const programmaticScrollUntilRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0, animationDurationMs);
  const shouldAnimate = !prefersReducedMotion && normalizedDuration > 0;
  const tailSpace = typeof height === "number" ? Math.max(0, height - 80) : 307;
  const isControlledPinned = pinActiveItemToTop && Boolean(activeVideoId);

  // Off-screen cards can have longer titles. Size the phone viewport to the current
  // card's content, not the tallest item in the flex row, while keeping full titles.
  useEffect(() => {
    const section = sectionRef.current;
    const content = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${activeIndex}"] > div`);
    if (!isMobile || !section || !content) return;

    const updateHeight = () => {
      const styles = getComputedStyle(section);
      const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      section.style.setProperty("--hover-link-rail-height", `${content.getBoundingClientRect().height + padding}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    return () => {
      observer.disconnect();
      section.style.removeProperty("--hover-link-rail-height");
    };
  }, [activeIndex, isMobile, orderedItems]);

  /**
   * One swipe = one card, on touch.
   *
   * CSS scroll snapping cannot express this on its own: `snap-mandatory` only picks the nearest
   * snap point AFTER the browser's fling momentum has run out, so a quick flick still travels
   * several cards, and `scroll-snap-stop: always` is honoured inconsistently across mobile
   * engines. So the rail takes the gesture itself: `touch-action: pan-y` hands horizontal
   * panning (and therefore momentum) to us while leaving vertical page scroll to the browser,
   * the finger drags the rail at most one card either way, and the release commits to exactly
   * one step. Wheel and trackpad users are untouched — they never fire these events and keep
   * the CSS snapping.
   */
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!isRail || !section || !track) return;

    /** Distance between two card starts — the one and only travel a swipe may commit to. */
    const measureStep = () => {
      const first = track.querySelector<HTMLElement>('[data-item-index="0"]');
      const second = track.querySelector<HTMLElement>('[data-item-index="1"]');
      if (first && second) {
        const stride = Math.abs(second.offsetLeft - first.offsetLeft);
        if (stride > 0) return stride;
      }
      return first?.offsetWidth ?? section.clientWidth;
    };

    let startX = 0;
    let startScrollLeft = 0;
    let step = 0;
    let isDragging = false;
    let settleFrame: number | null = null;

    const endDrag = () => {
      isDragging = false;
      if (settleFrame !== null) window.cancelAnimationFrame(settleFrame);
      settleFrame = null;
      // Restore the class-driven snapping for any non-touch scrolling that follows.
      section.style.scrollSnapType = "";
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (settleFrame !== null) window.cancelAnimationFrame(settleFrame);
      settleFrame = null;
      isDragging = true;
      startX = event.touches[0]!.clientX;
      startScrollLeft = section.scrollLeft;
      step = measureStep();
      // Mandatory snapping would re-snap every `scrollLeft` we write while the finger moves.
      section.style.scrollSnapType = "none";
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging) return;
      const deltaX = event.touches[0]!.clientX - startX;
      if (Math.abs(deltaX) >= CARD_CLICK_DRAG_THRESHOLD_PX) {
        suppressCardClickUntilRef.current = Date.now() + 500;
      }
      // Follow the finger, but never past the neighbouring card — the rail cannot run away.
      const travel = Math.max(-step, Math.min(step, -deltaX));
      section.scrollLeft = startScrollLeft + travel;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isDragging) return;
      const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
      if (Math.abs(deltaX) >= CARD_CLICK_DRAG_THRESHOLD_PX) {
        suppressCardClickUntilRef.current = Date.now() + 500;
      }
      const direction = Math.abs(deltaX) >= SWIPE_COMMIT_THRESHOLD_PX ? (deltaX < 0 ? 1 : -1) : 0;
      const maxScrollLeft = Math.max(0, section.scrollWidth - section.clientWidth);
      const target = Math.max(0, Math.min(maxScrollLeft, startScrollLeft + direction * step));
      isDragging = false;
      // Keep snapping off through the settle animation; restoring it first snaps
      // a short drag backwards before the next-card animation even starts.
      const from = section.scrollLeft;
      const startedAt = performance.now();
      const duration = prefersReducedMotion ? 0 : normalizedDuration;
      const settle = (time: number) => {
        const progress = duration === 0 ? 1 : Math.min(1, (time - startedAt) / duration);
        section.scrollLeft = from + (target - from) * (1 - (1 - progress) ** 3);
        if (progress < 1) settleFrame = window.requestAnimationFrame(settle);
        else endDrag();
      };
      settleFrame = window.requestAnimationFrame(settle);
    };

    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("touchmove", handleTouchMove, { passive: true });
    section.addEventListener("touchend", handleTouchEnd, { passive: true });
    section.addEventListener("touchcancel", endDrag, { passive: true });

    return () => {
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchmove", handleTouchMove);
      section.removeEventListener("touchend", handleTouchEnd);
      section.removeEventListener("touchcancel", endDrag);
      endDrag();
    };
  }, [isRail, normalizedDuration, orderedItems.length, prefersReducedMotion]);

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
      const currentScroll = isHorizontal ? section.scrollLeft : section.scrollTop;
      const maxScroll = isHorizontal
        ? Math.max(0, section.scrollWidth - section.clientWidth)
        : Math.max(0, section.scrollHeight - section.clientHeight);
      // Offset coordinates reflect the final layout even while Motion is visually animating the
      // old card positions with transforms. Rect coordinates would include those transforms and
      // make the scroll stop short whenever one card expands while another collapses.
      const rawTarget = isHorizontal ? item.offsetLeft - track.offsetLeft : item.offsetTop - track.offsetTop;
      const target = Math.max(0, Math.min(rawTarget, maxScroll));

      // Mark the upcoming scroll events as programmatic so `onScroll` doesn't treat
      // them as the user scrolling (which would re-sync the active card mid-animation).
      programmaticScrollUntilRef.current = Date.now() + (animate && shouldAnimate ? normalizedDuration + 300 : 100);

      if (animate && shouldAnimate) {
        const startedAt = performance.now();
        const distance = target - currentScroll;
        const animateScroll = (time: number) => {
          const progress = normalizedDuration === 0 ? 1 : Math.min(1, (time - startedAt) / normalizedDuration);
          const easedProgress = 1 - (1 - progress) ** 3;
          const nextScroll = currentScroll + distance * easedProgress;
          if (isHorizontal) section.scrollLeft = nextScroll;
          else section.scrollTop = nextScroll;

          if (progress < 1) {
            animationFrameRef.current = window.requestAnimationFrame(animateScroll);
          } else {
            animationFrameRef.current = null;
          }
        };
        animationFrameRef.current = window.requestAnimationFrame(animateScroll);
        return;
      }

      if (isHorizontal) section.scrollLeft = target;
      else section.scrollTop = target;
    },
    [normalizedDuration, shouldAnimate]
  );

  /**
   * Which card sits at the leading edge for a given expanded card.
   *
   * Step scrolling keeps the PREVIOUS card parked above the expanded one, collapsed: with the
   * expanded card pinned to the edge there was nothing above it, so the list read as one-way and
   * readers never discovered they could step back. The first card is its own leading card, so the
   * list opens exactly as authored — expanded, flush with the top — and only starts travelling
   * from the second step onwards. Free (non-step) scrolling and the phone rail are unchanged.
   */
  const leadingIndexFor = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!stepScroll || !track) return index;
      const isHorizontal = getComputedStyle(track).flexDirection === "row";
      return isHorizontal ? index : Math.max(0, index - 1);
    },
    [stepScroll]
  );

  /** Inverse of `leadingIndexFor`: the card that should be expanded for a given leading card. */
  const expandedIndexForLeading = useCallback(
    (leadingIndex: number) => {
      const track = trackRef.current;
      if (!stepScroll || !track) return leadingIndex;
      const isHorizontal = getComputedStyle(track).flexDirection === "row";
      return isHorizontal ? leadingIndex : Math.min(orderedItems.length - 1, leadingIndex + 1);
    },
    [orderedItems.length, stepScroll]
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
    queueScrollToIndex(leadingIndexFor(matchedIndex));
  }, [activeVideoId, leadingIndexFor, orderedItems, queueScrollToIndex]);

  const startAdvance = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex >= orderedItems.length || isSliding) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const leadingIndex = leadingIndexFor(activeIndex);
    const nextLeadingIndex = leadingIndexFor(nextIndex);
    const currentItem = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${leadingIndex}"]`);
    const nextItem = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${nextLeadingIndex}"]`);
    if (!section || !track || !currentItem || !nextItem) return;

    // First step of a stepped list: the leading card does not change, only the expansion moves
    // down one. Nothing to animate.
    if (nextLeadingIndex === leadingIndex) {
      setActiveIndex(nextIndex);
      return;
    }

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
        alignItemToStart(nextLeadingIndex);
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
        alignItemToStart(nextLeadingIndex);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          isAutoScrollingRef.current = false;
        });
      });
    };

    animationFrameRef.current = window.requestAnimationFrame(animateScroll);
  }, [
    activeIndex,
    alignItemToStart,
    isSliding,
    leadingIndexFor,
    normalizedDuration,
    orderedItems.length,
    prefersReducedMotion,
  ]);

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

      // `closestIndex` is the card at the LEADING edge, which under step scrolling is the
      // collapsed one above the expanded card. Keep the current selection when it already
      // explains that position — at the top of the list both "card 0 expanded" and "card 0
      // collapsed, card 1 expanded" park the same card at the edge.
      const nextActiveIndex =
        leadingIndexFor(activeIndex) === closestIndex ? activeIndex : expandedIndexForLeading(closestIndex);

      setActiveIndex(nextActiveIndex);
      if (notify && nextActiveIndex !== activeIndex) {
        const entry = orderedItems[nextActiveIndex];
        if (entry) onActiveItemChange?.(entry.item, nextActiveIndex);
      }
    },
    [activeIndex, expandedIndexForLeading, leadingIndexFor, orderedItems, onActiveItemChange]
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
      const isNewGesture = gap > WHEEL_GESTURE_GAP_MS || direction !== lastWheelDirectionRef.current;
      lastWheelTsRef.current = ts;
      lastWheelDirectionRef.current = direction;
      if (!isNewGesture) return; // inertia / continuation of the gesture that already stepped
      if (ts - lastStepTsRef.current < WHEEL_STEP_COOLDOWN_MS) return;

      // Base the step on the index we last INTENDED (updated synchronously) — under jank
      // React may not have re-rendered yet and `activeIndex` would be stale.
      const nextIndex = Math.max(0, Math.min(orderedItems.length - 1, intendedIndexRef.current + direction));
      if (nextIndex === intendedIndexRef.current) return;
      lastStepTsRef.current = ts;
      intendedIndexRef.current = nextIndex;
      setIsInteractionPaused(true);
      setActiveIndex(nextIndex);
      queueScrollToIndex(leadingIndexFor(nextIndex));
      const entry = orderedItems[nextIndex];
      if (entry) onActiveItemChange?.(entry.item, nextIndex);
    };

    section.addEventListener("wheel", onWheel, { passive: false });
    return () => section.removeEventListener("wheel", onWheel);
  }, [stepScroll, leadingIndexFor, orderedItems, queueScrollToIndex, onActiveItemChange]);

  const selectCard = useCallback(
    (item: ContextualLinkMetaData, index: number) => {
      // Preserve the top-level page scroll position — clicking a focusable
      // card can cause the browser to scroll the viewport to the element.
      // Remember the current window scroll and restore it after the
      // internal list scroll finishes so the page doesn't jump.
      const pageScrollX = window.scrollX || window.pageXOffset;
      const pageScrollY = window.scrollY || window.pageYOffset;

      setActiveIndex(index);
      queueScrollToIndex(leadingIndexFor(index));

      // Restore page scroll shortly after the list's scroll animation
      // completes. Use normalizedDuration as a guide; add a small buffer.
      const restoreDelay = Math.max(0, normalizedDuration) + 60;
      window.setTimeout(() => window.scrollTo(pageScrollX, pageScrollY), restoreDelay);

      onLinkClick?.(item, index);
    },
    [leadingIndexFor, normalizedDuration, onLinkClick, queueScrollToIndex]
  );

  const activateCardCta = useCallback((clickEvent: React.MouseEvent<HTMLElement>) => {
    if (Date.now() < suppressCardClickUntilRef.current) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
      return;
    }

    const target = clickEvent.target as HTMLElement;
    if (target.closest('[data-slot="link-card-cta"]')) return;

    clickEvent.currentTarget.querySelector<HTMLElement>('[data-slot="link-card-cta"]')?.click();
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
  }, []);

  if (orderedItems.length === 0) return null;

  return (
    <motion.section
      ref={sectionRef}
      layoutScroll
      aria-label={ariaLabel}
      className={cn(
        // The stacked mobile/tablet home layout is a sideways, snapping card rail.
        // `lg` and up retain the original vertical list and scrollbar.
        "gencl:box-border gencl:overflow-x-auto gencl:overflow-y-hidden gencl:snap-x gencl:snap-mandatory",
        "gencl:overscroll-x-contain gencl:max-lg:[scrollbar-width:none]",
        "gencl:max-lg:[&::-webkit-scrollbar]:hidden",
        "gencl:max-lg:h-[var(--hover-link-rail-height,auto)]!",
        "gencl:lg:overflow-x-hidden! gencl:lg:overflow-y-auto! gencl:lg:snap-none! gencl:lg:overscroll-x-auto!",
        "gencl:rounded-xl gencl:bg-white gencl:p-1",
        showContainerBorder && "gencl:ring-1 gencl:ring-secondary-200 gencl:ring-inset",
        className
      )}
      // Horizontal snap is mobile-only; desktop intentionally stays unsnapped because
      // expanding/collapsing cards changes their vertical positions during step scrolling.
      // `pan-y` on the rail: the browser keeps vertical page scrolling, while horizontal panning
      // (and its momentum) belongs to the one-card-per-swipe handler above.
      style={{ width, height, overflowAnchor: "none", touchAction: isRail ? "pan-y" : undefined }}
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
      <style>{LIST_CARD_CSS}</style>
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
              layout={shouldAnimate}
              transition={{
                layout: {
                  duration: shouldAnimate ? normalizedDuration / 1000 : 0,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              key={key}
              data-slot="hover-link-card-item"
              data-item-index={index}
              data-video-id={item.video_id ?? undefined}
              data-expanded={isExpanded ? "true" : "false"}
              className={cn(
                "gencl:w-[calc(100%_-_1.5rem)] gencl:shrink-0 gencl:cursor-pointer gencl:snap-start gencl:lg:w-auto! gencl:lg:[scroll-snap-align:none]",
                "gencl:[&_a]:h-9! gencl:[&_a]:gap-1.5 gencl:[&_a]:pl-2.5 gencl:[&_a]:pr-1.5",
                "gencl:[&_a>span]:text-body-2-semi-bold! gencl:[&_a>svg]:size-5!",
                "gencl:[&_div[role=link]]:h-9! gencl:[&_div[role=link]]:gap-1.5 gencl:[&_div[role=link]]:pl-2.5 gencl:[&_div[role=link]]:pr-1.5",
                "gencl:[&_div[role=link]>span]:text-body-2-semi-bold! gencl:[&_div[role=link]>svg]:size-5!"
              )}
              onClickCapture={activateCardCta}
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
                descriptionClassName="gencl:h-8! gencl:text-body-2-medium! gencl:leading-4!"
                onClick={() => selectCard(item, index)}
                onCtaClick={() => selectCard(item, index)}
              />
            </motion.div>
          );
        })}
        <span aria-hidden className="gencl:w-6 gencl:shrink-0 gencl:lg:hidden" />
      </div>
    </motion.section>
  );
}
