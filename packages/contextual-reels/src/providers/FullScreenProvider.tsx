"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import { useEventBus } from "@cxr/instance/InstanceContext";
import { isWebView } from "@cxr/platform/device";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import { resolveFullScreenRedirectUrl } from "@cxr/providers/fullScreenRedirectConfig";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/fullscreen");

// Vendor-prefixed fullscreen methods are not in the standard TypeScript DOM lib.
// We cast to this interface instead of using `any` or `@ts-ignore`.
interface VendorDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface VendorElement extends Element {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

/** Fullscreen state and controls for the contextual-reels widget. */
export interface FullScreenContextValue {
  isFullScreen: boolean;
  isFullScreenSupported: boolean;
  /**
   * True once a redirect attempt has thrown (e.g. a cross-origin sandboxed
   * iframe blocking top-level navigation). Sticky for the rest of the session
   * — best-effort: a silently ignored navigation (no exception) can't be
   * detected and won't set this.
   */
  redirectFailed: boolean;
  enterFullScreen: () => void;
  exitFullScreen: () => void;
  toggleFullScreen: () => void;
}

const FullScreenContext = createContext<FullScreenContextValue | undefined>(undefined);

/** Props for {@link FullScreenProvider}. */
export interface FullScreenProviderProps {
  children: ReactNode;
}

// Cross-origin parent throws on access — treat as iframe.
const inIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

function getFullscreenElement(): Element | null {
  const doc = document as VendorDocument;
  return (
    doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.mozFullScreenElement ?? doc.msFullscreenElement ?? null
  );
}

function hasFullscreenApi(): boolean {
  const el = document.documentElement as VendorElement;
  return Boolean(
    el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.mozRequestFullScreen ?? el.msRequestFullscreen
  );
}

function requestFS(el: Element): Promise<void> | undefined {
  const vendor = el as VendorElement;
  return (
    vendor.requestFullscreen?.() ??
    vendor.webkitRequestFullscreen?.() ??
    vendor.mozRequestFullScreen?.() ??
    vendor.msRequestFullscreen?.()
  );
}

function exitFS(): Promise<void> | undefined {
  const doc = document as VendorDocument;
  return (
    doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.() ?? doc.mozCancelFullScreen?.() ?? doc.msExitFullscreen?.()
  );
}

/**
 * Provides fullscreen state for the contextual-reels widget. In a webview,
 * fullscreen is unsupported and every enter attempt redirects. Outside an
 * iframe (and not a webview), fullscreen is manual (React state). Inside an
 * iframe, it tries the native Fullscreen API and redirects on unavailability,
 * denial, or rejection.
 *
 * Redirect destination is resolved per-brand via
 * {@link resolveFullScreenRedirectUrl} (reads `brand_id` from
 * {@link useTagDetails}, an ancestor by the time this mounts). Brands with no
 * configured redirect no-op (logged) instead of navigating. Every redirect path
 * (webview, iframe-no-API, iframe-rejected) funnels through the same
 * `redirectToFullScreen`, which opens the destination in a new tab via
 * `window.open` and sets `redirectFailed` when the browser blocks the popup
 * (detected via `window.open`'s `null`/closed return) or throws.
 */
export function FullScreenProvider({ children }: FullScreenProviderProps): ReactNode {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [redirectFailed, setRedirectFailed] = useState(false);
  const bus = useEventBus();
  const { brandId } = useTagDetails();

  const isFullScreenSupported = useMemo(() => !isWebView(), []);

  const redirectToFullScreen = useCallback(() => {
    const url = resolveFullScreenRedirectUrl(brandId);
    if (!url) {
      logger.info("[cxr] fullscreen unsupported — no redirect configured for this brand");
      return;
    }

    // Opens in a new tab regardless of iframe/webview/browser — works
    // uniformly everywhere since it doesn't depend on navigating the current
    // frame. `window.open` returns null (or a window with no real document)
    // when a popup blocker intervenes, which is a synchronously detectable
    // failure signal, unlike top-level navigation.
    try {
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        setRedirectFailed(true);
      }
    } catch {
      setRedirectFailed(true);
    }
  }, [brandId]);

  const enterManualFullScreen = useCallback(() => {
    setIsFullScreen(true);
    bus.emit("fullscreen:enter", {});
  }, [bus]);

  const enterFullScreen = useCallback(async () => {
    if (!isFullScreenSupported) {
      redirectToFullScreen();
      return;
    }

    if (!inIframe()) {
      enterManualFullScreen();
      return;
    }

    if (!hasFullscreenApi()) {
      redirectToFullScreen();
      return;
    }

    try {
      await requestFS(document.documentElement);
      // isFullScreen updates via the fullscreenchange listener below.
    } catch {
      redirectToFullScreen();
    }
  }, [isFullScreenSupported, enterManualFullScreen, redirectToFullScreen]);

  const exitFullScreen = useCallback(async () => {
    const promise = getFullscreenElement() != null ? exitFS() : undefined;
    if (promise != null) {
      try {
        await promise;
        return;
      } catch {
        // fall through to manual exit
      }
    }
    setIsFullScreen(false);
    bus.emit("fullscreen:exit", {});
  }, [bus]);

  // Explicitly call enter/exit to ensure bus events fire
  // (e.g., GenAd.updateView via fullscreen:enter/exit).
  const toggleFullScreen = useCallback(() => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      enterFullScreen();
    }
  }, [isFullScreen, enterFullScreen, exitFullScreen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") exitFullScreen();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [exitFullScreen]);

  // Browser can enter/exit fullscreen outside our control (Esc, nav) — stay in sync.
  useEffect(() => {
    const onFullscreenChange = () => {
      const active = getFullscreenElement() != null;
      setIsFullScreen(active);
      bus.emit(active ? "fullscreen:enter" : "fullscreen:exit", {});
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, [bus]);

  useEffect(() => {
    const unsubExpand = bus.on("video:expand", () => enterFullScreen());
    const unsubCollapse = bus.on("video:collapse", () => exitFullScreen());
    return () => {
      unsubExpand();
      unsubCollapse();
    };
  }, [bus, enterFullScreen, exitFullScreen]);

  const analytics = useAnalytics();

  // Stamps event_record_screen onto every analytics event, not just ones fired here.
  useEffect(() => {
    analytics.setBaseEventContext({ event_record_screen: isFullScreen ? "expand" : "embed" });
  }, [isFullScreen, analytics]);

  // Subscribing to the bus (not each enter/exit path above) covers manual
  // fallbacks and the native fullscreenchange listener in one place.
  useEffect(() => {
    const unsubEnter = bus.on("fullscreen:enter", () => analytics.sendEvent(EVENT.EMBED_MAXIMIZED));
    const unsubExit = bus.on("fullscreen:exit", () => analytics.sendEvent(EVENT.EMBED_MINIMIZED));
    return () => {
      unsubEnter();
      unsubExit();
    };
  }, [bus, analytics]);

  const value = useMemo<FullScreenContextValue>(
    () => ({
      isFullScreen,
      isFullScreenSupported,
      redirectFailed,
      enterFullScreen,
      exitFullScreen,
      toggleFullScreen,
    }),
    [isFullScreen, isFullScreenSupported, redirectFailed, enterFullScreen, exitFullScreen, toggleFullScreen]
  );

  return <FullScreenContext.Provider value={value}>{children}</FullScreenContext.Provider>;
}

/**
 * Hook to access fullscreen state and controls.
 *
 * @throws Error when called outside a {@link FullScreenProvider}.
 */
export function useFullScreen(): FullScreenContextValue {
  const ctx = useContext(FullScreenContext);
  if (!ctx) throw new Error("useFullScreen must be used inside <FullScreenProvider>");
  return ctx;
}
