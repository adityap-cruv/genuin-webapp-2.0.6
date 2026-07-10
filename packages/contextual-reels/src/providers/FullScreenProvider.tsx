"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { detectDevice } from "@cxr/platform/device";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";

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

/** Shape of the fullscreen context. */
export interface FullScreenContextValue {
  /** Whether the widget is currently in fullscreen mode. */
  isFullScreen: boolean;
  /** Enters fullscreen mode. */
  enterFullScreen: () => void;
  /** Exits fullscreen mode. */
  exitFullScreen: () => void;
  /** Toggles fullscreen state. */
  toggleFullScreen: () => void;
  /**
   * Whether this embed is in fullscreen-redirect mode: the redirect brand
   * ({@link FULLSCREEN_REDIRECT_BRAND_ID}) running inside an iframe. In this mode
   * there is no fullscreen to expand into, so ad chrome hides the expand and
   * Watch buttons, and a tap on the (unmuted) ad opens its CTA instead.
   */
  isRedirectMode: boolean;
}

const FullScreenContext = createContext<FullScreenContextValue | undefined>(undefined);

/** Props for {@link FullScreenProvider}. */
export interface FullScreenProviderProps {
  children: ReactNode;
  /**
   * Active tag's `brand_id` (from `tagDetails`), once resolved. Gates the
   * fullscreen-failure redirect (see {@link FULLSCREEN_FALLBACK_URL}) — only this
   * brand redirects; every other brand keeps the manual-fullscreen fallback.
   */
  brandId?: number;
}

const isIOS = detectDevice().osType === "ios";

// Only this brand redirects to the fallback URL on fullscreen failure.
const FULLSCREEN_REDIRECT_BRAND_ID = 3252;

// Where users land when native fullscreen is unavailable/denied inside an iframe embed,
// for FULLSCREEN_REDIRECT_BRAND_ID only.
const FULLSCREEN_FALLBACK_URL = "https://infolinks.begenuin.com/home";

// Fixed embed identifier appended to the fallback URL's query string.
const FULLSCREEN_FALLBACK_EMBED_ID = "6a4b8a153b428877f20c9bb5";

// Cross-origin parent throws on access — treat as iframe.
const inIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

// TODO(dev): accept videoId param and set it on the URL once ready
function redirectToFallback(): void {
  const url = new URL(FULLSCREEN_FALLBACK_URL);
  url.searchParams.set("embed_id", FULLSCREEN_FALLBACK_EMBED_ID);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

function getFullscreenElement(): Element | null {
  const doc = document as VendorDocument;
  return (
    doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.mozFullScreenElement ?? doc.msFullscreenElement ?? null
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
 * Provides fullscreen state for the contextual-reels widget.
 *
 * Strategy:
 *  - Not in iframe: always use manual (React state) fullscreen.
 *  - In iframe, iOS: Browser Fullscreen API is not supported; redirect to
 *    {@link FULLSCREEN_FALLBACK_URL} in a new tab, but only for
 *    {@link FULLSCREEN_REDIRECT_BRAND_ID} — other brands use manual fullscreen.
 *  - In iframe, non-iOS: attempt Browser Fullscreen API; on unavailability/denial,
 *    redirect for {@link FULLSCREEN_REDIRECT_BRAND_ID}, else fall back to manual
 *    fullscreen.
 *
 * State is scoped to the React tree — no global body-class mutations,
 * so multiple instances on the same page remain isolated.
 */
export function FullScreenProvider({ children, brandId }: FullScreenProviderProps): ReactNode {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const bus = useEventBus();

  // brandId resolves after tagDetails loads, post-mount — read the latest value
  // from a ref so enterFullScreen (memoized once via useCallback) never closes
  // over a stale undefined.
  const brandIdRef = useRef(brandId);
  brandIdRef.current = brandId;

  // Redirect mode: the redirect brand inside an iframe. Derived from the
  // `brandId` prop (not the ref) so the context value re-computes when it
  // resolves post-mount and consumers (ad chrome) re-render. inIframe() is
  // environment-stable, so this tracks brandId alone.
  const isRedirectMode = brandId === FULLSCREEN_REDIRECT_BRAND_ID && inIframe();

  // Tracks the active video's id (broadcast by LightPlayer via useActiveVideoIdBroadcast)
  // so the fallback redirect can carry it as `video_id`.
  const videoIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    return bus.on("genai:videoId", ({ videoId: id }) => {
      videoIdRef.current = id;
    });
  }, [bus]);

  const enterManualFullScreen = useCallback(() => {
    setIsFullScreen(true);
    bus.emit("fullscreen:enter", {});
  }, [bus]);

  const enterFullScreen = useCallback(async () => {
    // Not embedded in an iframe — always use manual (React state) fullscreen.
    if (!inIframe()) {
      enterManualFullScreen();
      return;
    }

    const shouldRedirect = brandIdRef.current === FULLSCREEN_REDIRECT_BRAND_ID;

    // iOS does not support the Browser Fullscreen API inside an iframe.
    if (isIOS) {
      if (shouldRedirect) {
        redirectToFallback();
      } else {
        enterManualFullScreen();
      }
      return;
    }

    const promise = requestFS(document.documentElement);
    if (promise == null) {
      // Fullscreen API unavailable (e.g. browser policy, missing permission).
      if (shouldRedirect) {
        redirectToFallback();
      } else {
        enterManualFullScreen();
      }
      return;
    }

    try {
      await promise;
      // State is updated via the fullscreenchange event listener below.
    } catch {
      // Browser denied fullscreen (e.g. not triggered by user gesture, iframe sandbox).
      if (shouldRedirect) {
        redirectToFallback();
      } else {
        enterManualFullScreen();
      }
    }
  }, [enterManualFullScreen]);

  const exitFullScreen = useCallback(async () => {
    if (getFullscreenElement() != null) {
      const promise = exitFS();
      if (promise != null) {
        try {
          await promise;
          // State is updated via the fullscreenchange event listener below.
        } catch {
          setIsFullScreen(false);
          bus.emit("fullscreen:exit", {});
        }
        return;
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

  // Sync React state when the browser enters/exits fullscreen natively
  // (e.g., user presses Esc, or the browser collapses fullscreen on navigation).
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

  // Publish the current view (expand vs embed/card) so AnalyticsProvider stamps
  // `event_record_screen` onto EVERY event (video and ad), not just the ones
  // fired here. Key name is what the backend consumes.
  useEffect(() => {
    analytics.setBaseEventContext({ event_record_screen: isFullScreen ? "expand" : "embed" });
  }, [isFullScreen, analytics]);

  // Track expand/collapse under the Web SDK's event names. Subscribing to the
  // bus (rather than instrumenting each enter/exit code path above) covers the
  // manual fallbacks AND the native fullscreenchange listener with one hook.
  useEffect(() => {
    const unsubEnter = bus.on("fullscreen:enter", () => analytics.sendEvent(EVENT.EMBED_MAXIMIZED));
    const unsubExit = bus.on("fullscreen:exit", () => analytics.sendEvent(EVENT.EMBED_MINIMIZED));
    return () => {
      unsubEnter();
      unsubExit();
    };
  }, [bus, analytics]);

  return (
    <FullScreenContext.Provider
      value={{ isFullScreen, enterFullScreen, exitFullScreen, toggleFullScreen, isRedirectMode }}>
      {children}
    </FullScreenContext.Provider>
  );
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
