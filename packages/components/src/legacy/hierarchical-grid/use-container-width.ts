"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks the host element's content-box width via ResizeObserver.
 * Seeded with `defaultWidth` so the first render lands on a valid
 * breakpoint before the observer fires — eliminates the blank first
 * paint and keeps SSR output deterministic.
 *
 * Reads `contentBoxSize` rather than `offsetWidth` so hosts that
 * apply padding / border to the grid root report the inner width,
 * matching the size the slots actually fill.
 *
 * See HIERARCHICAL_GRID_PLAN.md § 6.
 */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>(
  defaultWidth = 0
): { ref: React.RefObject<T | null>; width: number } {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      // `contentBoxSize` is an array (one per fragment); for normal
      // block-level elements there's exactly one. `inlineSize` is
      // the writing-mode-aware width.
      const inline = entry.contentBoxSize?.[0]?.inlineSize;
      // Fall back to `contentRect.width` for older browsers (Safari
      // pre-15.4) that don't expose `contentBoxSize`.
      const next = inline ?? entry.contentRect.width;
      setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
