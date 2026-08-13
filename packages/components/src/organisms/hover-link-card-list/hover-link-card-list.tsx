"use client";

import { cn } from "@genuin/ui/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

import { LinkCard, type LinkMetaData } from "@genuin/components/molecules/linkout-new/link-card";

export interface HoverLinkCardListProps {
  items: readonly LinkMetaData[];
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
  onLinkClick?: (item: LinkMetaData, index: number) => void;
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
  className,
  onLinkClick,
}: HoverLinkCardListProps) {
  const fallbackExpandedIndex = Math.min(Math.max(initialExpandedIndex, 0), Math.max(items.length - 1, 0));
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

  const alignItemToTop = useCallback((index: number) => {
    const section = sectionRef.current;
    const item = trackRef.current?.querySelector<HTMLElement>(`[data-item-index="${index}"]`);
    if (!section || !item) return;

    const sectionTop = section.getBoundingClientRect().top;
    const itemTop = item.getBoundingClientRect().top;
    const paddingTop = Number.parseFloat(getComputedStyle(section).paddingTop) || 0;
    section.scrollTop += itemTop - sectionTop - paddingTop;
  }, []);

  const startAdvance = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex >= items.length || isSliding) return;

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
  }, [activeIndex, alignItemToTop, isSliding, items.length, normalizedDuration, prefersReducedMotion]);

  useEffect(() => {
    if (!autoRotate || isInteractionPaused || isSliding || activeIndex >= items.length - 1) return;

    const timer = window.setTimeout(startAdvance, Math.max(0, rotationIntervalMs));
    return () => window.clearTimeout(timer);
  }, [activeIndex, autoRotate, isInteractionPaused, isSliding, items.length, rotationIntervalMs, startAdvance]);

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

    const contentTop = section.getBoundingClientRect().top + (Number.parseFloat(getComputedStyle(section).paddingTop) || 0);
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

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-label={ariaLabel}
      className={cn(
        "gencl:box-border gencl:overflow-y-auto gencl:rounded-xl gencl:bg-white gencl:p-1",
        "gencl:ring-1 gencl:ring-secondary-200 gencl:ring-inset",
        className
      )}
      style={{ width, height, overflowAnchor: "none" }}
      onMouseEnter={() => {
        if (pauseOnHover) setIsInteractionPaused(true);
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsInteractionPaused(false);
        if (!isSliding) syncActiveCardWithScroll();
      }}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsInteractionPaused(false);
          if (!isSliding) syncActiveCardWithScroll();
        }
      }}
      onScroll={() => {
        if (isAutoScrollingRef.current) return;
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
        {items.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={`${item.link}-${index}`}
              data-slot="hover-link-card-item"
              data-item-index={index}
              data-expanded={isActive ? "true" : "false"}
              onMouseEnter={() => {
                if (pauseOnHover && !isSliding) setActiveIndex(index);
              }}
              onFocusCapture={() => {
                if (!isSliding) setActiveIndex(index);
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
                onClick={() => onLinkClick?.(item, index)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
