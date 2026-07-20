/**
 * App — TypeScript port of src/App.jsx.
 *
 * Changes from legacy:
 *  - Drops loadHlsSDK cdn.jsdelivr.net path (HLS.js bundled via npm).
 *  - Drops LegacyReels — native Feed is always used.
 *  - Wraps with providers: AnalyticsProvider → StrategyProvider → FeedProvider
 *    → AdProvider → GenAIProvider → PlayerProvider.
 *  - Replaces <Reels> with <Feed>.
 *  - Uses deepMergeOverwrite for customizationDetails.
 *  - show_cta: false override retained.
 */

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { type ReactNode, type RefObject, lazy, useCallback, useEffect, useRef, useState } from "react";

import { EVENT, buildHostParamsDiagnostic } from "@cxr/analytics/analytics";
import { CloseButton } from "@cxr/app/CloseButton";
import { FeedSkeleton } from "@cxr/app/FeedSkeleton";
import { NoContent } from "@cxr/app/NoContent";
import { AD_LAYOUT, type AdLayoutId, adLayoutVariants } from "@cxr/config";
import { useFullscreenClasses } from "@cxr/feed/hooks/useFullscreenClasses";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { EventBusProvider } from "@cxr/instance/coordination/EventBusContext";
import { UserInteractionProvider, useMarkUserInteracted } from "@cxr/instance/coordination/UserInteractionTracker";
import { usePlayerCoordination } from "@cxr/instance/coordination/usePlayerCoordination";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { InstanceProvider } from "@cxr/instance/registry/InstanceContext";
import { useInstanceRegistration } from "@cxr/instance/registry/useInstanceRegistration";
import { AdProvider, useAdWaterfall } from "@cxr/providers/AdProvider";
import { AnalyticsProvider, useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { FeedProvider, useFeed } from "@cxr/providers/FeedProvider";
import { FullScreenProvider, useFullScreen } from "@cxr/providers/FullScreenProvider";
import { GenAIProvider } from "@cxr/providers/GenAIProvider";
import { PlayerProvider, usePlayer } from "@cxr/providers/PlayerProvider";
import type { CxrPublicApiInternal } from "@cxr/publicApi";
import { getTag } from "@cxr/services/api";
import { StrategyProvider, useStrategy } from "@cxr/strategies/StrategyProvider";
import type { TagResponse } from "@cxr/types";
import { isAdVerificationCrawler } from "@cxr/utils/ads";
import { deepMergeOverwrite } from "@cxr/utils/deepMerge";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/app");

const Feed = lazy(() => import("../feed/Feed").then((m) => ({ default: m.Feed })));

/** Props accepted by the TypeScript App component. */
interface AppProps {
  tagId: string;
  rootTagId: string;
  customizationDetails?: Record<string, unknown>;
  adLayout?: AdLayoutId;
  /** Unique opaque identifier for this widget instance. */
  instanceId: string;
  /**
   * Raw `data-giv` attribute for this instance — the per-div initial-volume
   * fallback used when the page-global `GIV` script param is absent. Validated
   * in {@link StrategyProvider}.
   */
  dataGiv?: string | null;
}

/**
 * Root application component for the contextual-reels widget.
 *
 * Bootstraps providers and mounts the native Feed. The legacy Reels component
 * and the `?cxr-engine` feature flag have been removed in Phase 6.
 *
 * @param props  AppProps
 */
export default function App({
  tagId,
  rootTagId,
  customizationDetails,
  adLayout = AD_LAYOUT.Unknown,
  instanceId,
  dataGiv,
}: AppProps): React.JSX.Element | null {
  const [tagDetails, setTagDetails] = useState<TagResponse | undefined>();
  const [apiFailed, setApiFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleApiFailed = useCallback(() => setApiFailed(true), []);

  if (dismissed) return null;

  return (
    <InstanceProvider instanceId={instanceId}>
      <EventBusProvider>
        <UserInteractionProvider>
          <AnalyticsProvider tagId={tagId}>
            <TagLoader
              tagId={tagId}
              rootTagId={rootTagId}
              customizationDetails={customizationDetails}
              adLayout={adLayout}
              onLoaded={setTagDetails}
              onFailed={handleApiFailed}
            />
            <FullScreenProvider brandId={tagDetails?.brand_id}>
              <AppOverlay
                rootTagId={rootTagId}
                overlayRef={overlayRef}
                instanceId={instanceId}
                adLayout={adLayout}
                onDismiss={() => setDismissed(true)}>
                <SafeSuspense>
                  {apiFailed ? (
                    <NoContent message="This content is no longer available" />
                  ) : !tagDetails ? (
                    <FeedSkeleton />
                  ) : (
                    <StrategyProvider tagId={tagId} brandId={tagDetails.brand_id} dataGiv={dataGiv}>
                      <FeedProvider tagId={tagId}>
                        <AdProvider tagId={tagId} adLayout={adLayout}>
                          <GenAIProvider>
                            <PlayerProvider>
                              <AppRegistrar />
                              <MutePassbackGuard />
                              <NativeFeedShim tagDetails={tagDetails} />
                            </PlayerProvider>
                          </GenAIProvider>
                        </AdProvider>
                      </FeedProvider>
                    </StrategyProvider>
                  )}
                </SafeSuspense>
              </AppOverlay>
            </FullScreenProvider>
          </AnalyticsProvider>
        </UserInteractionProvider>
      </EventBusProvider>
    </InstanceProvider>
  );
}

/**
 * Overlay root for one instance. Owns fullscreen class application and the
 * close button for compact audio-only layouts.
 *
 * Must live inside FullScreenProvider + UserInteractionProvider.
 */
function AppOverlay({
  rootTagId,
  overlayRef,
  instanceId,
  adLayout,
  onDismiss,
  children,
}: {
  rootTagId: string;
  overlayRef: RefObject<HTMLDivElement | null>;
  instanceId: string;
  adLayout: AdLayoutId;
  onDismiss: () => void;
  children: ReactNode;
}): React.JSX.Element {
  const { isFullScreen } = useFullScreen();
  useFullscreenClasses({ isFullScreen, overlayRef });
  const cls = `cxr__v1 ${rootTagId}${isFullScreen ? " cxr__fullscreen" : ""}`;
  const markInteracted = useMarkUserInteracted();
  return (
    <div
      ref={overlayRef}
      className={`${cls} gencl:relative gencl:overflow-visible gencl:h-full gencl:w-full`}
      id={`overlay-${instanceId}`}
      // Capture phase so any interaction flips this instance's flag even when a
      // child stops propagation (e.g. the mute button).
      onPointerDownCapture={markInteracted}
      onKeyDownCapture={markInteracted}>
      {/* {!isFullScreen && (adLayout === AD_LAYOUT.L4 || adLayout === AD_LAYOUT.L3) && <CloseButton onClick={onDismiss} />} */}
      {children}
    </div>
  );
}

/**
 * Registers this instance into InstanceRegistry + GlobalPlayerCoordinator,
 * and bridges internal bus events to the window.cxr public API.
 * Must be mounted inside PlayerProvider + EventBusProvider + InstanceProvider.
 */
function AppRegistrar(): null {
  const instanceId = useInstanceId();
  const bus = useEventBus();
  const { isPlaying, setPlaying } = usePlayer();

  const pause = useCallback(() => setPlaying(false), [setPlaying]);

  useInstanceRegistration(pause);
  usePlayerCoordination(pause);

  useEffect(() => {
    const publicApi = (window as Window & { cxr?: CxrPublicApiInternal }).cxr;
    if (!publicApi?._emit) return;
    const emit = publicApi._emit.bind(publicApi);

    const subs = [
      bus.on("player:play", () => emit(instanceId, "play")),
      bus.on("player:pause", () => emit(instanceId, "pause")),
      bus.on("fullscreen:enter", () => emit(instanceId, "fullscreen:enter")),
      bus.on("fullscreen:exit", () => emit(instanceId, "fullscreen:exit")),
      bus.on("ad:fill", () => emit(instanceId, "ad:fill")),
      bus.on("ad:nofill", () => emit(instanceId, "ad:nofill")),
    ];
    return () => {
      subs.forEach((u) => u());
    };
  }, [instanceId, bus]);

  // suppress unused-var lint for isPlaying (used indirectly via pause)
  void isPlaying;

  return null;
}

interface TagLoaderProps {
  tagId: string;
  rootTagId: string;
  customizationDetails?: Record<string, unknown>;
  adLayout: AdLayoutId;
  onLoaded: (tagDetails: TagResponse) => void;
  onFailed: () => void;
}

/**
 * Fetches tag config and fires tag_captured via the analytics buffer.
 * Must live inside AnalyticsProvider to route the event through the buffer.
 */
function TagLoader({ tagId, rootTagId, customizationDetails, adLayout, onLoaded, onFailed }: TagLoaderProps): null {
  const { sendEvent, setBrandId } = useAnalytics();

  useEffect(() => {
    if (!tagId || !rootTagId) return;

    getTag<Record<string, unknown>>(tagId)
      .then((td) => {
        let merged = td;

        if (customizationDetails) {
          merged = deepMergeOverwrite(td, customizationDetails) as Record<string, unknown>;

          // Preserve CTA delay from customizationDetails
          const delay = (customizationDetails["delay"] as number | undefined) ?? 3;
          if (merged["cta"] && typeof merged["cta"] === "object") {
            (merged["cta"] as Record<string, unknown>)["delay"] = delay;
          } else {
            merged["cta"] = { delay };
          }
        }

        // Disable default CTA — must be explicitly configured by the embed
        if (merged["config"] && typeof merged["config"] === "object") {
          (merged["config"] as Record<string, unknown>)["show_cta"] = false;
        }

        onLoaded(merged as TagResponse);

        // Register brand_id before the first event so tag_captured and every
        // subsequent event (including the IAB/infolink ad events) carry it.
        setBrandId((merged as TagResponse).brand_id);

        const tagDimensions = adLayoutVariants.find((v) => v.id === adLayout);
        // tag_id is injected by AnalyticsProvider; only the camelCase `tagId`
        // legacy key and the tag dimensions are event-specific here.
        sendEvent(EVENT.TAG_CAPTURED, {
          tagId,
          tag_height: tagDimensions?.height,
          tag_width: tagDimensions?.width,
          // One-time diagnostic: the raw host-provided loader script params, so
          // we can tell whether unresolved macros (~appb~, ~loclat~, …) are the
          // host sending an unfilled template vs. sending nothing at all.
          ...buildHostParamsDiagnostic(),
        });
      })
      .catch((err) => {
        logger.error("error::", err);
        onFailed();
      });
    // sendEvent and setBrandId are stable (AnalyticsProvider useMemo/useCallback).
    // onLoaded (setTagDetails) and onFailed are stable React state setters — useCallback-wrapped in App.
    // customizationDetails and adLayout intentionally omitted — fetch runs once per tagId/rootTagId mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId, rootTagId]);

  return null;
}

/**
 * For tags with the `mutePassback` strategy: starts a 3-second timer when the
 * first video begins playing (the `player:play` bus event), NOT on mount — so
 * the window measures muted *playback*, not the feed/tag-load gap before any
 * frame is shown. If the user hasn't unmuted before the timer fires, calls
 * `onAdFail` (passback). The timer is armed once (first play only) and cancelled
 * if the user unmutes in time.
 *
 * Must live inside StrategyProvider + PlayerProvider + AdProvider + EventBusProvider.
 * Renders nothing.
 */
function MutePassbackGuard(): null {
  const { mutePassback, mutePassbackDelayMs } = useStrategy();
  const { isMuted } = usePlayer();
  const { onAdFail } = useAdWaterfall();
  const bus = useEventBus();
  const firedRef = useRef(false);
  const armedRef = useRef(false);
  const isMutedRef = useRef(isMuted);
  // Skip passback for ad-verification crawlers (il.advtq present) — they can't
  // unmute, so firing passback against them produces false negatives.
  const bypassPassback = isAdVerificationCrawler();

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!mutePassback || bypassPassback) return;

    let timerId: number | undefined;

    // Arm on the FIRST play only — a later pause/resume must not restart the
    // window or re-fire the passback.
    const unsub = bus.on("player:play", () => {
      if (armedRef.current) return;
      armedRef.current = true;

      timerId = window.setTimeout(() => {
        if (isMutedRef.current && !firedRef.current) {
          firedRef.current = true;
          onAdFail();
        }
      }, mutePassbackDelayMs);
    });

    return () => {
      unsub();
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
    // mutePassback, onAdFail, and bus are stable for a given tag — run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/** Shim that connects FeedProvider data to the native Feed component. */
function NativeFeedShim({ tagDetails }: { tagDetails: TagResponse }): React.JSX.Element {
  const { entries, isLoading, feedFailed } = useFeed();

  if (isLoading) return <FeedSkeleton />;
  if (feedFailed || entries.length === 0) return <NoContent message="No content available" />;

  const variant = tagDetails?.config?.variant ?? "default";

  return (
    <SafeSuspense>
      <Feed entries={entries} tagDetails={tagDetails} variant={variant} />
    </SafeSuspense>
  );
}
