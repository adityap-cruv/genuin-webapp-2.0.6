/** `AdProvider` — owns ad waterfall fill/no-fill state, single-hit deferred passback, and ad layout config. */
"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";

import type { AdProviderKind } from "@cxr/ads/normalizers";
import { installGenaiBridge, notifyAdFill, notifyAdNoFill } from "@cxr/ads/waterfall";
import { EVENT } from "@cxr/analytics/analytics";
import { AD_LAYOUT, type AdLayoutId, adLayoutVariants } from "@cxr/config";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { PixelReporter } from "@cxr/observability/pixel-reporter";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { useFeed } from "@cxr/providers/FeedProvider";
import { useStrategy } from "@cxr/strategies/StrategyProvider";

/** Context value exposed by `useAdWaterfall`. */
export interface AdWaterfallContextValue {
  /** Call when an ad provider fills a slot. `slotId` (`ad.id`) enables per-slot dedup for single-hit. */
  onAdSuccess: (provider: AdProviderKind, slotId?: string) => void;
  /**
   * Call when a standalone ad slot's waterfall fails. Non-single-hit: passback +
   * destroy immediately. Single-hit: deferred — see `firePassbackIfExhausted`.
   */
  onAdFail: (slotId?: string) => void;
  /**
   * Record an ad-break (`video-with-ad`) fill/no-fill. Feeds the single-hit
   * exhaustion tally but never triggers passback directly — the video continues.
   */
  recordAdBreakResult: (slotId: string, filled: boolean) => void;
  /** The numeric embed layout id (see `AD_LAYOUT`). */
  adLayout: AdLayoutId;
  /** True when the layout is an audio-only ad layout (L3 or L4). */
  isAudioOnlyAds: boolean;
}

const AdWaterfallContext = createContext<AdWaterfallContextValue | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
  /** Retained for analytics and external callers. */
  tagId: string;
  /**
   * The numeric embed layout id — also the source of `tag_height`/`tag_width`
   * forwarded to the `Ad Passback` and `Infolinks Impression` events.
   */
  adLayout?: AdLayoutId;
}

/**
 * AdProvider — bootstraps ad waterfall state and exposes `useAdWaterfall`.
 * Single source of truth for ad layout config; use `useAdWaterfall()` rather
 * than reading `tagDetails`/`ConfigProvider` directly.
 */
export function AdProvider({ children, adLayout = AD_LAYOUT.Unknown }: AdProviderProps): ReactNode {
  const { sendEvent, setAdPassback } = useAnalytics();
  const bus = useEventBus();
  const instanceId = useInstanceId();
  const { singleHitWaterfall } = useStrategy();
  const { entries, activeIndex } = useFeed();

  // Tag dimensions for the passback / impression events, derived from the layout.
  const dimensions = adLayoutVariants.find((variant) => variant.id === adLayout);
  const tagHeight = dimensions?.height;
  const tagWidth = dimensions?.width;

  const anyFilledRef = useRef(false);
  const noFillSlotsRef = useRef<Set<string>>(new Set());
  const reachedLastRef = useRef(false);
  const passbackFiredRef = useRef(false);

  // Mirror the feed so the stable callbacks below read live entries/index.
  // adsDisabled feeds already exclude non-opportunities, so every ad/break entry counts.
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  /** Fire the passback event once and tear the widget down. Idempotent. */
  const firePassback = useCallback((): void => {
    if (passbackFiredRef.current) return;
    passbackFiredRef.current = true;
    notifyAdNoFill();
    setAdPassback(); // Mark widget as passback for all subsequent events (passback: 1)
    sendEvent(EVENT.AD_PASSBACK, {
      tag_height: tagHeight,
      tag_width: tagWidth,
    });
    bus.emit("genad:destroy", {});
    getInstanceRegistry().get(instanceId)?.destroy?.();
  }, [tagHeight, tagWidth, sendEvent, setAdPassback, bus, instanceId]);

  /** Single-hit gate: fire only once every ad slot reported, none filled, last index reached. */
  const firePassbackIfExhausted = useCallback((): void => {
    if (passbackFiredRef.current) return;
    if (anyFilledRef.current) return;
    if (!reachedLastRef.current) return;
    const adSlotCount = entriesRef.current.filter(
      (entry) => entry.kind === "ad" || entry.kind === "video-with-ad"
    ).length;
    if (adSlotCount === 0) return;
    if (noFillSlotsRef.current.size < adSlotCount) return;
    firePassback();
  }, [firePassback]);

  /** Fires notifyAdFill once per widget lifetime — same "already filled" flag single-hit uses. */
  const onAdSuccess = useCallback((_provider: AdProviderKind, _slotId?: string): void => {
    if (anyFilledRef.current) return;
    anyFilledRef.current = true;
    notifyAdFill();
  }, []);

  /** Single-hit: tally a slot no-fill and check whether the waterfall is exhausted. */
  const recordSingleHitNoFill = useCallback(
    (slotId?: string): void => {
      if (slotId !== undefined) noFillSlotsRef.current.add(slotId);
      firePassbackIfExhausted();
    },
    [firePassbackIfExhausted]
  );

  const onAdFail = useCallback(
    (slotId?: string): void => {
      if (singleHitWaterfall) {
        recordSingleHitNoFill(slotId);
        return;
      }
      firePassback();
    },
    [singleHitWaterfall, recordSingleHitNoFill, firePassback]
  );

  /** Ad-break result — record-only, never fires passback directly (video keeps playing). */
  const recordAdBreakResult = useCallback(
    (slotId: string, filled: boolean): void => {
      if (!singleHitWaterfall) return;
      if (filled) anyFilledRef.current = true;
      else recordSingleHitNoFill(slotId);
    },
    [singleHitWaterfall, recordSingleHitNoFill]
  );

  useEffect(() => {
    if (entries.length > 0 && activeIndex >= entries.length - 1) {
      reachedLastRef.current = true;
      if (singleHitWaterfall) firePassbackIfExhausted();
    }
  }, [activeIndex, entries.length, singleHitWaterfall, firePassbackIfExhausted]);

  useEffect(() => {
    return installGenaiBridge(
      bus,
      () => onAdSuccess("video"),
      () => onAdFail()
    );
  }, [bus, onAdSuccess, onAdFail]);

  // Bridge PixelReporter's failure signal (render/runtime stages — the stages
  // reachable while this provider is mounted) into the full ad-waterfall
  // passback: analytics event + widget teardown, not just the best-effort
  // window callback PixelReporter fires on its own. Filters by instanceId so
  // a failure reported for a different widget on the same page is ignored.
  useEffect(() => {
    return PixelReporter.getInstance().onFailure((event) => {
      if (event.instanceId !== instanceId) return;
      onAdFail();
    });
  }, [instanceId, onAdFail]);

  // Host-triggered via `window.cxr.infolinksImpression(...)`. Registered here —
  // the only scope with sendEvent + tag dimensions.
  useEffect(() => {
    const fireInfolinksImpression = (): void => {
      sendEvent(EVENT.INFOLINKS_IMPRESSION, {
        tag_height: tagHeight,
        tag_width: tagWidth,
      });
    };
    getInstanceRegistry().register(instanceId, { fireInfolinksImpression });
  }, [instanceId, sendEvent, tagHeight, tagWidth]);

  const isAudioOnlyAds = adLayout === AD_LAYOUT.L3 || adLayout === AD_LAYOUT.L4;

  return (
    <AdWaterfallContext.Provider value={{ onAdSuccess, onAdFail, recordAdBreakResult, adLayout, isAudioOnlyAds }}>
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
