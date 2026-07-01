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

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";

import type { AdProviderKind } from "@cxr/ads/normalizers";
import {
  installGenaiBridge,
  shouldCountFill,
  shouldCountNoFill,
  notifyAdFill,
  notifyAdNoFill,
} from "@cxr/ads/waterfall";
import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/ad-provider");

/** Context value exposed by `useAdWaterfall`. */
export interface AdWaterfallContextValue {
  /** Call when an ad provider successfully fills the slot. */
  onAdSuccess: (provider: AdProviderKind) => void;
  /** Call when the full waterfall fails to fill the slot. */
  onAdFail: () => void;
  /** The numeric embed layout id (see `AD_LAYOUT`). */
  adLayout: AdLayoutId;
  /** True when the layout is an audio-only ad layout (L3 or L4). */
  isAudioOnlyAds: boolean;
}

const AdWaterfallContext = createContext<AdWaterfallContextValue | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
  /**
   * The root tag ID — retained for analytics and external callers.
   * Single-hit waterfall gating now derives from `useStrategy().singleHitWaterfall`
   * rather than a per-tag allowlist.
   */
  tagId: string;
  /** Tag height in px — forwarded to the `Ad Passback` analytics event. */
  tagHeight?: number;
  /** Tag width in px — forwarded to the `Ad Passback` analytics event. */
  tagWidth?: number;
  /**
   * The numeric embed layout id.
   * Defaults to `AD_LAYOUT.Unknown` when the embedding page has not specified a layout.
   */
  adLayout?: AdLayoutId;
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

export function AdProvider({
  children,
  tagHeight,
  tagWidth,
  adLayout = AD_LAYOUT.Unknown,
}: AdProviderProps): ReactNode {
  const { sendEvent } = useAnalytics();
  const bus = useEventBus();
  const { singleHitWaterfall } = useStrategy();

  const fillCountRef = useRef(0);
  const noFillCountRef = useRef(0);
  // Time since page navigation start (reload/entry) — more accurate than Date.now()
  const renderStartRef = useRef<number>(performance.timeOrigin);

  const onAdSuccess = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_provider: AdProviderKind): void => {
      if (!shouldCountFill(singleHitWaterfall, fillCountRef.current)) return;
      fillCountRef.current += 1;
      notifyAdFill();
      const elapsed = Date.now() - renderStartRef.current;
      _logger.debug(`notifyAdFill +${elapsed}ms (${(elapsed / 1000).toFixed(2)}s) from page load`);
    },
    [singleHitWaterfall]
  );

  const onAdFail = useCallback((): void => {
    if (!shouldCountNoFill(singleHitWaterfall, noFillCountRef.current)) return;
    noFillCountRef.current += 1;
    notifyAdNoFill();
    const elapsed = Date.now() - renderStartRef.current;
    _logger.debug(`notifyAdNoFill +${elapsed}ms (${(elapsed / 1000).toFixed(2)}s) from page load`);
    sendEvent("Ad Passback", {
      tag_height: tagHeight,
      tag_width: tagWidth,
    });
  }, [singleHitWaterfall, tagHeight, tagWidth, sendEvent]);

  useEffect(() => {
    return installGenaiBridge(
      bus,
      () => onAdSuccess("video"),
      () => onAdFail()
    );
  }, [bus, onAdSuccess, onAdFail]);

  const isAudioOnlyAds = adLayout === AD_LAYOUT.L3 || adLayout === AD_LAYOUT.L4;

  return (
    <AdWaterfallContext.Provider value={{ onAdSuccess, onAdFail, adLayout, isAudioOnlyAds }}>
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
