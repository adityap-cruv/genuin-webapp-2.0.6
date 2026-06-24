/**
 * `AdProvider` — owns the ad waterfall fill/no-fill state and ad layout config for the widget.
 *
 * Responsibilities:
 *  1. Track fill and no-fill counts via refs.
 *  2. Gate notifications through `shouldCountFill` / `shouldCountNoFill`.
 *  3. Notify the embedding page via `notifyAdFill` / `notifyAdNoFill`.
 *  4. Emit the `Ad Passback` analytics event on no-fill.
 *  5. Install the GenAI bridge on mount and clean up on unmount.
 *  6. Expose `useAdWaterfall()` hook to child components.
 *  7. Own `adLayout` and derived `isAudioOnlyAds` — single source of truth for layout config.
 */
"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import type { AdProviderKind } from "@cxr/ads/normalizers";
import {
  installGenaiBridge,
  shouldCountFill,
  shouldCountNoFill,
  notifyAdFill,
  notifyAdNoFill,
} from "@cxr/ads/waterfall";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";

/** Context value exposed by `useAdWaterfall`. */
export interface AdWaterfallContextValue {
  /** Call when an ad provider successfully fills the slot. */
  onAdSuccess: (provider: AdProviderKind) => void;
  /** Call when the full waterfall fails to fill the slot. */
  onAdFail: () => void;
  /** The embed layout variant string (e.g. `'mobile-320x50'`). */
  adLayout: string;
  /** True when the layout is an audio-only ad layout (`mobile-320x50` or `mobile-320x100`). */
  isAudioOnlyAds: boolean;
  /** True while a fullscreen ad break has its ad/cover on screen. */
  isAdBreakActive: boolean;
  setAdBreakActive: (active: boolean) => void;
}

const AdWaterfallContext = createContext<AdWaterfallContextValue | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
  /**
   * The root tag ID — used to gate single-hit tag behaviour.
   * If the `ConfigProvider` is not yet available, pass this as a prop.
   */
  tagId: string;
  /** Tag height in px — forwarded to the `Ad Passback` analytics event. */
  tagHeight?: number;
  /** Tag width in px — forwarded to the `Ad Passback` analytics event. */
  tagWidth?: number;
  /**
   * The embed layout variant string.
   * Defaults to `'unknown'` when the embedding page has not specified a layout.
   */
  adLayout?: string;
}

/**
 * AdProvider — bootstraps ad waterfall state and exposes `useAdWaterfall`.
 *
 * This is the single source of truth for ad layout configuration.
 * Components that need the layout variant should call `useAdWaterfall()` rather
 * than reading from `tagDetails` or `ConfigProvider`.
 *
 * @example
 * ```tsx
 * <AdProvider tagId={tagId} adLayout={adLayout}>
 *   <ReelItem ... />
 * </AdProvider>
 * ```
 */
export function AdProvider({ children, tagId, tagHeight, tagWidth, adLayout = "unknown" }: AdProviderProps): ReactNode {
  const { sendEvent } = useAnalytics();
  const bus = useEventBus();

  const fillCountRef = useRef(0);
  const noFillCountRef = useRef(0);
  // Time since page navigation start (reload/entry) — more accurate than Date.now()
  const renderStartRef = useRef<number>(performance.timeOrigin);

  const onAdSuccess = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_provider: AdProviderKind): void => {
      if (!shouldCountFill(tagId, fillCountRef.current)) return;
      fillCountRef.current += 1;
      notifyAdFill();
      const elapsed = Date.now() - renderStartRef.current;
      console.log("notifyAdFill", `+${elapsed}ms (${(elapsed / 1000).toFixed(2)}s) from page load`);
    },
    [tagId]
  );

  const onAdFail = useCallback((): void => {
    if (!shouldCountNoFill(tagId, noFillCountRef.current)) return;
    noFillCountRef.current += 1;
    notifyAdNoFill();
    const elapsed = Date.now() - renderStartRef.current;
    console.log("notifyAdNoFill", `+${elapsed}ms (${(elapsed / 1000).toFixed(2)}s) from page load`);
    sendEvent(EVENT.AD_PASSBACK, {
      tag_height: tagHeight,
      tag_width: tagWidth,
    });
  }, [tagId, tagHeight, tagWidth, sendEvent]);

  useEffect(() => {
    return installGenaiBridge(
      bus,
      () => onAdSuccess("video"),
      () => onAdFail()
    );
  }, [bus, onAdSuccess, onAdFail]);

  const isAudioOnlyAds = adLayout === "mobile-320x50" || adLayout === "mobile-320x100";

  // Set by the reel whose fullscreen ad break is on screen; hides widget chrome.
  const [isAdBreakActive, setAdBreakActive] = useState(false);

  return (
    <AdWaterfallContext.Provider
      value={{ onAdSuccess, onAdFail, adLayout, isAudioOnlyAds, isAdBreakActive, setAdBreakActive }}>
      {children}
    </AdWaterfallContext.Provider>
  );
}

/**
 * Hook accessor for the ad waterfall context.
 *
 * @throws Error when called outside an {@link AdProvider}.
 *
 * @example
 * ```tsx
 * const { onAdSuccess, onAdFail } = useAdWaterfall();
 * ```
 */
export function useAdWaterfall(): AdWaterfallContextValue {
  const ctx = useContext(AdWaterfallContext);
  if (!ctx) {
    throw new Error("useAdWaterfall must be used inside <AdProvider>");
  }
  return ctx;
}

/** Returns `undefined` when no {@link AdProvider} is in scope instead of throwing error or "". */
export function useOptionalAdWaterfall(): AdWaterfallContextValue | undefined {
  return useContext(AdWaterfallContext);
}
