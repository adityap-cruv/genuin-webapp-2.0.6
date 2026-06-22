"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { detectDevice } from "@cxr/platform/device";

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
}

const FullScreenContext = createContext<FullScreenContextValue | undefined>(undefined);

/** Props for {@link FullScreenProvider}. */
export interface FullScreenProviderProps {
  children: ReactNode;
}

const isIOS = detectDevice().osType === "ios";

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
 *  - iOS: Browser Fullscreen API is not supported; always use manual (React state) fullscreen.
 *  - Non-iOS in iframe: attempt Browser Fullscreen API first; fall back to manual on failure.
 *  - Non-iOS not in iframe: attempt Browser Fullscreen API first; fall back to manual on failure.
 *
 * State is scoped to the React tree — no global body-class mutations,
 * so multiple instances on the same page remain isolated.
 */
export function FullScreenProvider({ children }: FullScreenProviderProps): ReactNode {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const bus = useEventBus();

  const enterFullScreen = useCallback(async () => {
    // iOS does not support the Browser Fullscreen API — use manual fullscreen directly.
    // Browser Fullscreen API only attempted inside an iframe on non-iOS.
    // Non-iframe context and iOS both fall back to manual (React state) fullscreen.
    if (isIOS || !inIframe()) {
      setIsFullScreen(true);
      bus.emit("fullscreen:enter", {});
      return;
    }

    const promise = requestFS(document.documentElement);
    if (promise == null) {
      // Fullscreen API unavailable (e.g. browser policy, missing permission).
      setIsFullScreen(true);
      bus.emit("fullscreen:enter", {});
      return;
    }

    try {
      await promise;
      // State is updated via the fullscreenchange event listener below.
    } catch {
      // Browser denied fullscreen (e.g. not triggered by user gesture, iframe sandbox).
      setIsFullScreen(true);
      bus.emit("fullscreen:enter", {});
    }
  }, [bus]);

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

  return (
    <FullScreenContext.Provider value={{ isFullScreen, enterFullScreen, exitFullScreen, toggleFullScreen }}>
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
