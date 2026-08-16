"use client";

import { cn } from "@genuin/ui/lib/utils";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LinkCard, type LinkMetaData } from "@genuin/components/molecules/linkout-new/link-card";

export type ContextualLinkMetaData = LinkMetaData & {
  video_id?: string | null;
};

export interface HoverLinkCardListProps {
  items: readonly ContextualLinkMetaData[];
  activeVideoId?: string | null;
  /** Keep the item matching `activeVideoId` visually expanded and scrolled to the top. */
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
}: HoverLinkCardListProps) {
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
  const prefersReducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0, animationDurationMs);
  const tailSpace = typeof height === "number" ? Math.max(0, height - 80) : 307;
  const isControlledPinned = pinActiveItemToTop && Boolean(activeVideoId);

  const alignItemToTop = useCallback((index: number) => {
    const section = sectionRef.current;
    const item = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${index}"]`);
    if (!section || !item) return;

    const sectionTop = section.getBoundingClientRect().top;
    const itemTop = item.getBoundingClientRect().top;
    const paddingTop = Number.parseFloat(getComputedStyle(section).paddingTop) || 0;
    section.scrollTop += itemTop - sectionTop - paddingTop;
  }, []);

  const scrollItemToTop = useCallback(
    (index: number, animate = true) => {
      const section = sectionRef.current;
      const item = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${index}"]`);
      if (!section || !item) return;

      const sectionTop = section.getBoundingClientRect().top;
      const itemTop = item.getBoundingClientRect().top;
      const paddingTop = Number.parseFloat(getComputedStyle(section).paddingTop) || 0;
      const maxScrollTop = Math.max(0, section.scrollHeight - section.clientHeight);
      const rawTarget = itemTop - sectionTop - paddingTop + section.scrollTop;
      const target = Math.max(0, Math.min(rawTarget, maxScrollTop));

      if (animate && !prefersReducedMotion) {
        section.scrollTo({ top: target, behavior: "smooth" });
        return;
      }

      section.scrollTop = target;
    },
    [prefersReducedMotion]
  );

  const queueScrollToIndex = useCallback(
    (index: number) => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = window.requestAnimationFrame(() => {
          scrollItemToTop(index);
        });
      });
    },
    [scrollItemToTop]
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
    const currentItem = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${activeIndex}"]`);
    const nextItem = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${nextIndex}"]`);
    if (!section || !currentItem || !nextItem) return;

    const distance = nextItem.getBoundingClientRect().top - currentItem.getBoundingClientRect().top;
    if (distance <= 0) return;

    if (prefersReducedMotion || normalizedDuration === 0) {
      isAutoScrollingRef.current = true;
      section.scrollTop += distance;
      setActiveIndex(nextIndex);
      animationFrameRef.current = window.requestAnimationFrame(() => {
        alignItemToTop(nextIndex);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          isAutoScrollingRef.current = false;
        });
      });
      return;
    }

    isAutoScrollingRef.current = true;
    setIsSliding(true);
    const startScrollTop = section.scrollTop;
    const startTime = performance.now();

    const animateScroll = (time: number) => {
      const progress = Math.min(1, (time - startTime) / normalizedDuration);
      const easedProgress = 1 - (1 - progress) ** 3;
      section.scrollTop = startScrollTop + distance * easedProgress;

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateScroll);
        return;
      }

      setActiveIndex(nextIndex);
      setIsSliding(false);
      animationFrameRef.current = window.requestAnimationFrame(() => {
        alignItemToTop(nextIndex);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          isAutoScrollingRef.current = false;
        });
      });
    };

    animationFrameRef.current = window.requestAnimationFrame(animateScroll);
  }, [activeIndex, alignItemToTop, isSliding, normalizedDuration, orderedItems.length, prefersReducedMotion]);

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

  const syncActiveCardWithScroll = useCallback(() => {
    const section = sectionRef.current;
    const cardElements = trackRef.current?.querySelectorAll<HTMLElement>("[data-item-index]");
    if (!section || !cardElements?.length || isAutoScrollingRef.current) return;

    const contentTop =
      section.getBoundingClientRect().top + (Number.parseFloat(getComputedStyle(section).paddingTop) || 0);
    let closestIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardElements.forEach((element) => {
      const distance = Math.abs(element.getBoundingClientRect().top - contentTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = Number(element.dataset.itemIndex);
      }
    });

    setActiveIndex(closestIndex);
  }, [activeIndex]);

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
    [onLinkClick, queueScrollToIndex]
  );

  if (orderedItems.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-label={ariaLabel}
      className={cn(
        "gencl:box-border gencl:overflow-y-auto gencl:rounded-xl gencl:bg-white gencl:p-1",
        showContainerBorder && "gencl:ring-1 gencl:ring-secondary-200 gencl:ring-inset",
        className
      )}
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
        if (isAutoScrollingRef.current || isControlledPinned) return;
        if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = window.setTimeout(syncActiveCardWithScroll, 120);
      }}>
      <div
        ref={trackRef}
        data-slot="hover-link-card-track"
        className="gencl:flex gencl:flex-col"
        style={{
          gap,
          paddingBottom: tailSpace,
        }}>
        {orderedItems.map(({ item, key }, index) => {
          const isActive = activeIndex === index;

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
              data-expanded={isActive ? "true" : "false"}
              onClick={() => selectCard(item, index)}
              onMouseEnter={() => {
                if (pauseOnHover && !isSliding && !isControlledPinned) setActiveIndex(index);
              }}
              onFocusCapture={() => {
                if (!isSliding && !isControlledPinned) setActiveIndex(index);
              }}>
              <LinkCard
                data={item}
                sheetState={isActive ? "expand-view" : "default"}
                density="compact"
                compactThumbnailSize={{ width: 90, height: 90 }}
                showFullTitle
                theme="light"
                ctaText={ctaText}
                ctaLink={item.link}
                onClick={() => selectCard(item, index)}
                onCtaClick={() => selectCard(item, index)}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
