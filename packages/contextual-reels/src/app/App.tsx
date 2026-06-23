/**
 * App — TypeScript port of src/App.jsx.
 *
 * Changes from legacy:
 *  - Drops loadHlsSDK cdn.jsdelivr.net path (HLS.js bundled via npm).
 *  - Drops LegacyReels — native Feed is always used.
 *  - Wraps with providers: AnalyticsProvider → ConfigProvider → FeedProvider
 *    → AdProvider → GenAIProvider → PlayerProvider.
 *  - Replaces <Reels> with <Feed>.
 *  - Uses deepMergeOverwrite for customizationDetails.
 *  - show_cta: false override retained.
 */

import {
  type ReactNode,
  type RefObject,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { sendEventLogFromGlobals } from "@cxr/analytics/analytics";
import { CloseButton } from "@cxr/app/CloseButton";
import { FeedSkeleton } from "@cxr/app/FeedSkeleton";
import { NoContent } from "@cxr/app/NoContent";
import { isMutePassbackEnabled } from "@cxr/config";
import { useFullscreenClasses } from "@cxr/feed/hooks/useFullscreenClasses";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { EventBusProvider } from "@cxr/instance/coordination/EventBusContext";
import {
  UserInteractionProvider,
  useMarkUserInteracted,
} from "@cxr/instance/coordination/UserInteractionTracker";
import { usePlayerCoordination } from "@cxr/instance/coordination/usePlayerCoordination";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { InstanceProvider } from "@cxr/instance/registry/InstanceContext";
import { useInstanceRegistration } from "@cxr/instance/registry/useInstanceRegistration";
import { getDeviceDetailsSnapshot } from "@cxr/platform/device";
import { windowLink } from "@cxr/platform/topWindow";
import { AdProvider, useAdWaterfall } from "@cxr/providers/AdProvider";
import { AnalyticsProvider } from "@cxr/providers/AnalyticsProvider";
import { ConfigProvider } from "@cxr/providers/ConfigProvider";
import { FeedProvider, useFeed } from "@cxr/providers/FeedProvider";
import { FullScreenProvider, useFullScreen } from "@cxr/providers/FullScreenProvider";
import { GenAIProvider } from "@cxr/providers/GenAIProvider";
import { PlayerProvider, usePlayer } from "@cxr/providers/PlayerProvider";
import type { CxrPublicApiInternal } from "@cxr/publicApi";
import { getTag } from "@cxr/services/api";
import type { TagResponse } from "@cxr/types";
import { userId } from "@cxr/userId";
import { deepMergeOverwrite } from "@cxr/utils/deepMerge";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/app");

const Feed = lazy(() => import("../feed/Feed").then((m) => ({ default: m.Feed })));

/**
 * Parses the tag dimensions encoded in an `adLayout` string without touching the DOM.
 *
 * The embed layout variant (e.g. `'mobile-320x100'`, `'desktop-300x250'`) carries the
 * slot size as a `WIDTHxHEIGHT` suffix. Returns `undefined` for layouts that do not
 * encode a size (e.g. `'unknown'`).
 */
function parseTagDimensions(adLayout: string): { width: number; height: number } | undefined {
  const match = /(\d+)x(\d+)/.exec(adLayout);
  if (!match) return undefined;
  return { width: Number(match[1]), height: Number(match[2]) };
}

/** Props accepted by the TypeScript App component. */
interface AppProps {
  tagId: string;
  rootTagId: string;
  customizationDetails?: Record<string, unknown>;
  adLayout?: string;
  /** Unique opaque identifier for this widget instance. */
  instanceId: string;
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
  adLayout = "unknown",
  instanceId,
}: AppProps): React.JSX.Element | null {
  const [tagDetails, setTagDetails] = useState<TagResponse | undefined>();
  const [apiFailed, setApiFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fetch tag configuration on mount
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

        setTagDetails(merged as TagResponse);
        const tagDimensions = parseTagDimensions(adLayout);
        sendEventLogFromGlobals(
          {
            eventName: "tag_captured",
            eventDetails: {
              tagId,
              tag_height: tagDimensions?.height,
              tag_width: tagDimensions?.width,
            },
            tagDetails: td,
          },
          { userId, windowLink, deviceDetails: getDeviceDetailsSnapshot() }
        );
      })
      .catch((err) => {
        logger.error("error::", err);
        setApiFailed(true);
      });
  }, [tagId, rootTagId, customizationDetails, adLayout]);

  if (dismissed) return null;

  return (
    <InstanceProvider instanceId={instanceId}>
      <EventBusProvider>
        <UserInteractionProvider>
          <AnalyticsProvider tagId={tagId}>
            <FullScreenProvider>
              <FullScreenClassApplier rootTagId={rootTagId} overlayRef={overlayRef}>
                {(cls, isFullScreen) => (
                  <AppOverlay cls={cls} overlayRef={overlayRef} instanceId={instanceId}>
                    {!isFullScreen &&
                      (adLayout === "mobile-320x100" || adLayout === "mobile-320x50") && (
                        <CloseButton onClick={() => setDismissed(true)} />
                      )}
                    <Suspense>
                      {apiFailed ? (
                        <NoContent message="This content is no longer available" />
                      ) : !tagDetails ? (
                        <FeedSkeleton />
                      ) : (
                        <ConfigProvider tagDetails={tagDetails} rootTagId={rootTagId} tagId={tagId}>
                          <FeedProvider tagId={tagId}>
                            <AdProvider tagId={tagId} adLayout={adLayout}>
                              <GenAIProvider tagId={tagId}>
                                <PlayerProvider>
                                  <AppRegistrar />
                                  <MutePassbackGuard tagId={tagId} />
                                  <NativeFeedShim tagDetails={tagDetails} />
                                </PlayerProvider>
                              </GenAIProvider>
                            </AdProvider>
                          </FeedProvider>
                        </ConfigProvider>
                      )}
                    </Suspense>
                  </AppOverlay>
                )}
              </FullScreenClassApplier>
            </FullScreenProvider>
          </AnalyticsProvider>
        </UserInteractionProvider>
      </EventBusProvider>
    </InstanceProvider>
  );
}

/**
 * Overlay root for one instance. Lives inside {@link UserInteractionProvider}
 * so it can flip *this instance's* interaction flag via `useMarkUserInteracted`.
 */
function AppOverlay({
  cls,
  overlayRef,
  instanceId,
  children,
}: {
  cls: string;
  overlayRef: RefObject<HTMLDivElement | null>;
  instanceId: string;
  children: ReactNode;
}): React.JSX.Element {
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
      {children}
    </div>
  );
}

/** Reads fullscreen state, applies cxr__fullscreen class, and syncs 'expand' on the overlay. */
function FullScreenClassApplier({
  rootTagId,
  overlayRef,
  children,
}: {
  rootTagId: string;
  overlayRef: RefObject<HTMLDivElement | null>;
  children: (cls: string, isFullScreen: boolean) => React.JSX.Element;
}): React.JSX.Element {
  const { isFullScreen } = useFullScreen();
  useFullscreenClasses({ isFullScreen, overlayRef });
  const cls = `cxr__v1 ${rootTagId}${isFullScreen ? " cxr__fullscreen" : ""}`;
  return children(cls, isFullScreen);
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

/**
 * For tags in MUTE_PASSBACK_TAG_IDS: starts a 3-second timer on mount.
 * If the user hasn't unmuted before the timer fires, calls `onAdFail` (passback).
 * Timer is cancelled if the user unmutes in time.
 */
function MutePassbackGuard({ tagId }: { tagId: string }): null {
  const { isMuted } = usePlayer();
  const { onAdFail } = useAdWaterfall();
  const firedRef = useRef(false);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!isMutePassbackEnabled(tagId)) return;

    const id = window.setTimeout(() => {
      if (isMutedRef.current && !firedRef.current) {
        firedRef.current = true;
        onAdFail();
      }
    }, 3000);

    return () => window.clearTimeout(id);
    // Run once on mount — tagId and onAdFail are stable.
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
    <Suspense>
      <Feed entries={entries} tagDetails={tagDetails} variant={variant} />
    </Suspense>
  );
}
