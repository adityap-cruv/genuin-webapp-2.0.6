"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks a cell's live `(offsetWidth, offsetHeight)` via ResizeObserver.
 * The video bridge needs the width as a number to drive the embed
 * scenario picker (`effectiveVideoWidth`). The linkout bridge measures
 * itself internally, so the height return is currently consumed only
 * for debug overlays — kept on the surface so future bridges can read
 * both dimensions without touching the hook.
 */
export function useCellSize<T extends HTMLElement = HTMLDivElement>(): {
  ref: React.RefObject<T | null>;
  size: { w: number; h: number };
} {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
