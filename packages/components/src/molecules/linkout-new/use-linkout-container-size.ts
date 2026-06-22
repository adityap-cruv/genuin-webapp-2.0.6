"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Live dimensions of the element the returned `ref` is attached to.
 * `0` until the element mounts and the first `ResizeObserver`
 * callback fires.
 */
export interface LinkoutContainerSize {
  /** Attach to the element whose dimensions should drive the ad
   *  size picker. Typically the outermost wrapper of the
   *  `<DynamicLinkouts>` panel. */
  ref: RefObject<HTMLDivElement | null>;
  /** `offsetWidth` / `offsetHeight` of the referenced element. */
  size: { w: number; h: number };
}

/**
 * Track the linkout's own rendered dimensions via `ResizeObserver`.
 *
 * The banner ad picker needs container width/height to decide which
 * IAB size fits — and the linkout must measure *itself*. It can't
 * reuse `effectiveVideoWidth` from `useEmbedConfigs()` because the
 * standalone / responsive linkout cases (e.g. `/websitev5`,
 * `/grid` story harness) have no video player above them, so the
 * embed context returns 0.
 *
 * Returns a ref the caller attaches to whichever element they want
 * measured, plus the current size. SSR-safe: the initial state is
 * `{ w: 0, h: 0 }`, the effect attaches the observer on mount.
 */
export function useLinkoutContainerSize(): LinkoutContainerSize {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

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
