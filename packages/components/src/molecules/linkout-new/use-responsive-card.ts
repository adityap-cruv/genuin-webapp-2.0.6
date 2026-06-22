"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

// ── Size + orientation picker ────────────────────────────────────
//
// Width buckets per Figma node 9322:136877
// (https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9322-136877&m=dev):
// xlarge > 600 px, large > 400 px, medium > 200 px, small ≤ 200 px.
// Orientation is purely the frame's aspect ratio.

export type ResponsiveSize = "xlarge" | "large" | "medium" | "small";
export type ResponsiveOrientation = "landscape" | "portrait";

export function pickResponsiveSize(width: number): ResponsiveSize {
  if (width > 600) return "xlarge";
  if (width > 400) return "large";
  if (width > 200) return "medium";
  return "small";
}

export function pickResponsiveOrientation(width: number, height: number): ResponsiveOrientation {
  return height > width ? "portrait" : "landscape";
}

/**
 * Observes a container ref's `offsetWidth` / `offsetHeight` and
 * returns the responsive size bucket + orientation. `offsetWidth`
 * (border-box) is used instead of `contentRect` so the picker's
 * thresholds line up with what the user sees in stat readouts /
 * preset buttons (e.g. 320×100, not 318×98).
 */
export function useResponsiveSize(ref: RefObject<HTMLElement | null>) {
  const [{ size, orientation, w, h }, setState] = useState<{
    size: ResponsiveSize;
    orientation: ResponsiveOrientation;
    w: number;
    h: number;
  }>(() => ({ size: "medium", orientation: "landscape", w: 0, h: 0 }));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setState({
        w,
        h,
        size: pickResponsiveSize(w),
        orientation: pickResponsiveOrientation(w, h),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return { size, orientation, w, h };
}

// ── Overflow cascade ─────────────────────────────────────────────
//
// Per Figma node 9322:136877 — when the details column's rendered
// content would overflow its allotted height, hide pieces in
// priority order (description + chips first, then CTA). Title and
// thumbnail always stay.
//
// Implementation note: hiding is driven by CSS (`data-hide-meta` /
// `data-hide-cta` on the card root + Tailwind `group-data-…:hidden`
// variants on the children) so we can reliably measure with
// content already removed from layout. This is what lets evaluate
// run sequential measurements within a single tick — set attribute
// → reflow → re-measure. ResizeObserver is intentionally absent
// here: observing the details element causes a measurement loop
// because the cascade's own attribute changes resize the element.
// We re-evaluate only when the layout-affecting deps change
// (size / orientation / state / data).
//
// Implementation reads `scrollHeight > clientHeight + 1` after a
// forced reflow on each adjustment. We re-run on every layout-
// affecting input (deps) plus a ResizeObserver on the details
// element itself (catches font / image load reflow).

export interface OverflowCascade {
  hideMeta: boolean;
  hideCta: boolean;
}

export function useOverflowCascade(
  // Element whose `[data-hide-meta]` / `[data-hide-cta]` attribs
  // toggle CSS-driven hiding of the cascade's children. Usually the
  // card root.
  rootRef: RefObject<HTMLElement | null>,
  // Element whose `scrollHeight` vs `clientHeight` we measure to
  // decide overflow. Usually the details column.
  detailsRef: RefObject<HTMLElement | null>,
  // Dependencies that affect the rendered content size. Pass the
  // size / state / orientation tuple so we re-evaluate when the
  // layout changes.
  deps: ReadonlyArray<unknown>
): OverflowCascade {
  const [cascade, setCascade] = useState<OverflowCascade>({
    hideMeta: false,
    hideCta: false,
  });

  // useLayoutEffect so we read scrollHeight after the DOM commits
  // but before the browser paints — avoids a flash of overflowing
  // content on the user's screen. Re-evaluates only when the
  // layout-affecting deps change; we deliberately don't observe
  // the element itself because the cascade's own attribute changes
  // resize it (= measurement loop).
  useLayoutEffect(() => {
    const root = rootRef.current;
    const details = detailsRef.current;
    if (!root || !details) return;

    let nextHideMeta = false;
    let nextHideCta = false;
    // Reset to "show everything" before measuring so the cascade
    // makes a fresh decision based on the natural overflow.
    root.removeAttribute("data-hide-meta");
    root.removeAttribute("data-hide-cta");
    void details.offsetHeight;
    const overflows = () => details.scrollHeight > details.clientHeight + 1;
    if (overflows()) {
      nextHideMeta = true;
      root.setAttribute("data-hide-meta", "");
      void details.offsetHeight;
      if (overflows()) {
        nextHideCta = true;
        root.setAttribute("data-hide-cta", "");
      }
    }

    setCascade((prev) =>
      prev.hideMeta === nextHideMeta && prev.hideCta === nextHideCta
        ? prev
        : { hideMeta: nextHideMeta, hideCta: nextHideCta }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, detailsRef, ...deps]);

  return cascade;
}
