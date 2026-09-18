"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Marks the element a page scrolls with — the one whose direction drives the auto-hiding header.
 * Put it on the page's OWN scroll container (see `.gen-home-motion`, `.gen-article-page`).
 */
export const PAGE_SCROLLER_ATTRIBUTE = "data-page-scroller";

type HideOnScrollDownOptions = {
  /** Turn the behaviour off entirely (e.g. on desktop, where the bar is not fixed). */
  enabled?: boolean;
  /** Scroll distance from the top before hiding is allowed, in px. */
  hideAfter?: number;
  /** Movement below this (in px) is treated as jitter/momentum noise and ignored. */
  threshold?: number;
};

/**
 * Auto-hiding header state: hides while the reader scrolls DOWN and reveals again on the
 * slightest scroll UP.
 *
 * The scroller is not necessarily the window — pages like Home and the article reader scroll an
 * inner `overflow-auto` container that lives in a different subtree from the header. Scroll
 * events don't bubble, but they DO reach `window` in the CAPTURE phase, so one capturing listener
 * covers every page without the header needing a ref to any of them.
 *
 * Only the element marked with {@link PAGE_SCROLLER_ATTRIBUTE} (or the document itself) counts.
 * Both pages are full of internally-scrolling panels and carousels, and those fire the very same
 * capturing scroll events — letting a news list scroll away the site header was exactly the bug.
 *
 * @returns `true` while the header should be translated out of view.
 */
export function useHideOnScrollDown({
  enabled = true,
  hideAfter = 80,
  threshold = 4,
}: HideOnScrollDownOptions = {}): boolean {
  const [isHidden, setIsHidden] = useState(false);
  const lastTargetRef = useRef<EventTarget | null>(null);
  const lastTopRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setIsHidden(false);
      return;
    }

    const onScroll = (event: Event) => {
      const target = event.target;
      const isDocumentScroll = target === document || target === window;
      const element = target instanceof HTMLElement ? target : null;
      if (!isDocumentScroll && !element?.hasAttribute(PAGE_SCROLLER_ATTRIBUTE)) return;

      const top = isDocumentScroll ? window.scrollY : (element?.scrollTop ?? 0);

      // Near the top the header is always shown — checked BEFORE the re-baseline below, so a
      // jump straight back to the top (the "scroll to top" control) can never leave it hidden.
      if (top <= hideAfter) setIsHidden(false);

      // A different scroller took over (navigation, an overlay opening): re-baseline instead of
      // reading its offset as a huge jump in one direction.
      if (target !== lastTargetRef.current) {
        lastTargetRef.current = target;
        lastTopRef.current = top;
        return;
      }

      const delta = top - lastTopRef.current;
      if (Math.abs(delta) < threshold) return;
      lastTopRef.current = top;

      if (top > hideAfter) setIsHidden(delta > 0);
    };

    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [enabled, hideAfter, threshold]);

  return isHidden;
}
