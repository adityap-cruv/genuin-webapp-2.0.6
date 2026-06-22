import { useEffect, type RefObject } from "react";

interface UseFullscreenClassesOptions {
  /** Whether the widget is currently in fullscreen mode. */
  isFullScreen: boolean;
  /** Direct ref to the overlay element — no document.querySelector needed. */
  overlayRef: RefObject<HTMLElement | null>;
}

/**
 * Synchronise overlay CSS classes with fullscreen state.
 * Uses a direct ref instead of a CSS selector so it works inside shadow DOM.
 */
export function useFullscreenClasses(options: UseFullscreenClassesOptions): void {
  const { isFullScreen, overlayRef } = options;

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (isFullScreen) {
      overlay.classList.add("expand");
    } else {
      overlay.classList.remove("expand");
    }
  }, [isFullScreen, overlayRef]);
}
