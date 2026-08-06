/**
 * FeedTree — the provider stack + feed mount gated behind `TagDetailsGate`.
 *
 * Lazy-loaded from `App.tsx` so nothing here (six providers, the fullscreen
 * overlay chrome, the native feed shim) is fetched until the tag resolves.
 * Mounted inside `TagDetailsProvider` + `InstanceProvider` — both are
 * ancestors by the time this loads, so descendants read them via context
 * instead of props.
 *
 *   FeedTree (FullScreenProvider → StrategyProvider → GenAIProvider →
 *             PlayerProvider → FeedProvider → AdProvider)
 *     → NativeFeedShim (fullscreen overlay + close button, instance
 *                        registration/monitoring side-effects, renders the feed)
 *
 * FeedProvider is mounted below PlayerProvider (not above, like the other
 * feed-tree providers) so it can read `usePlayer()` — it derives
 * isAdActive/activeReel from the active entry + isAdBreakActive and exposes
 * both via `useFeed()`, so `Feed` doesn't have to.
 *
 * AdProvider is mounted below FeedProvider (not above) because it reads
 * `useFeed()` — entries + activeIndex feed the single-hit deferred-passback
 * exhaustion check (every ad/video-with-ad slot no-filled + last entry reached).
 *
 * Default-exported so `App.tsx` can `lazy()`-load it.
 */
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { lazy, useCallback, useRef } from "react";

import { CloseButton } from "@cxr/app/CloseButton";
import { FeedSkeleton } from "@cxr/app/FeedSkeleton";
import { NoContent } from "@cxr/app/NoContent";
import { useFeedVisibilityGate } from "@cxr/app/useFeedVisibilityGate";
// import { AD_LAYOUT, isIframe } from "@cxr/config";
import { useEventBus, useInstanceId, useMarkUserInteracted } from "@cxr/instance/InstanceContext";
import { usePlayerCoordination } from "@cxr/instance/coordination/usePlayerCoordination";
import { usePublicApiBridge } from "@cxr/instance/coordination/usePublicApiBridge";
import { useInstanceRegistration } from "@cxr/instance/registry/useInstanceRegistration";
import { useHeavyAdReporter, type HeavyAdRemovalContext } from "@cxr/monitoring/useHeavyAdReporter";
import { useResourceMonitor } from "@cxr/monitoring/useResourceMonitor";
import { AdProvider } from "@cxr/providers/AdProvider";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { FeedProvider, useFeed } from "@cxr/providers/FeedProvider";
import { FullScreenProvider, useFullScreen } from "@cxr/providers/FullScreenProvider";
import { GenAIProvider } from "@cxr/providers/GenAIProvider";
import { PlayerProvider, usePlayer } from "@cxr/providers/PlayerProvider";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import { StrategyProvider } from "@cxr/strategies/StrategyProvider";
import { useMutePassbackGuard } from "@cxr/strategies/useMutePassbackGuard";

const Feed = lazy(() => import("../feed/Feed").then((m) => ({ default: m.Feed })));

export default function FeedTree({
  onDismiss,
  dataGiv,
}: {
  onDismiss: () => void;
  dataGiv: string | null;
}): React.JSX.Element {
  return (
    <FullScreenProvider>
      <StrategyProvider dataGiv={dataGiv}>
        <GenAIProvider>
          <PlayerProvider>
            <FeedProvider>
              <AdProvider>
                <NativeFeedShim onDismiss={onDismiss} />
              </AdProvider>
            </FeedProvider>
          </PlayerProvider>
        </GenAIProvider>
      </StrategyProvider>
    </FullScreenProvider>
  );
}

/**
 * The fullscreen overlay div + close button (compact audio-only layouts,
 * L3/L4 non-fullscreen) + all feed-mount decisions in one place: registers
 * this instance into InstanceRegistry + GlobalPlayerCoordinator, bridges
 * internal bus events to the window.cxr public API, arms the mute-passback
 * guard and the visibility gate, and renders the feed (skeleton while
 * loading or held by the visibility gate, NoContent on failure/empty,
 * otherwise the native Feed).
 *
 * The overlay div itself is the visibility gate's observed element — it
 * renders unconditionally (unlike `body`, which the gate holds), so it gives
 * `useFeedVisibilityGate` a stable target for the whole widget lifetime. See
 * `useFeedVisibilityGate`'s doc comment for the render/passback/teardown state
 * machine.
 *
 * Must be mounted inside StrategyProvider + PlayerProvider + AdProvider +
 * FullScreenProvider + InstanceProvider. Reads `instanceId` from
 * `useInstanceId()` rather than a prop — `InstanceProvider` (mounted in
 * `App`) is already an ancestor here, so there's nothing to thread.
 */
function NativeFeedShim({ onDismiss }: { onDismiss: () => void }): React.JSX.Element {
  const instanceId = useInstanceId();
  const bus = useEventBus();
  const { setPlaying, isMuted } = usePlayer();
  const { entries, isLoading, feedFailed, activeIndex } = useFeed();
  const { tagDetails, adLayout, tagId } = useTagDetails();
  const { isFullScreen } = useFullScreen();
  const markInteracted = useMarkUserInteracted();
  const { sendEvent } = useAnalytics();
  const pause = useCallback(() => setPlaying(false), [setPlaying]);
  const { shouldRender, overlayRef } = useFeedVisibilityGate();

  useMutePassbackGuard();
  useInstanceRegistration();
  usePlayerCoordination(pause);
  usePublicApiBridge(instanceId, bus);

  // Pull-based resource snapshot computed on demand from the Performance timeline. Feeds
  // the "Ad Removed" payload. Passive — useHeavyAdReporter owns the polling schedule.
  //
  // NOTE on ad-scoping: readResourceSnapshot(scopeHost) can scope transferBytes to the ad's
  // iframe host, but that host is not obtainable here — window.GenAd (genAdSdk.ts) does not
  // expose the iframe src/origin it creates for a given containerId; it's opaque third-party
  // SDK internals. Calling getSnapshot() with no scopeHost here means bytes stay page-wide
  // for this wiring — an accepted gap (see resourceMonitor.ts doc comment). Getting a real
  // scopeHost would require a GenAd SDK change (out of scope for this pass).
  const { getSnapshot } = useResourceMonitor();

  // Report ad removal — Chrome's Heavy Ad Intervention (authoritative) OR an inferred
  // budget breach when Chrome's report never arrives (cross-origin iframe, teardown race,
  // non-Chromium). Context is read lazily at removal time via mountedAtRef + entries so
  // the payload reflects the frame's final state.
  const mountedAtRef = useRef(Date.now());
  useHeavyAdReporter({
    sendEvent,
    emit: (event, payload) => bus.emit(event as Parameters<typeof bus.emit>[0], payload),
    getSnapshot,
    getContext: (): HeavyAdRemovalContext => {
      const active = entries[activeIndex];
      return {
        tagId,
        instanceId,
        activeIndex,
        activeReelId: active?.data.id ?? null,
        adLayout,
        adSource: active?.kind ?? null,
        isMuted,
        msSinceMount: Date.now() - mountedAtRef.current,
      };
    },
  });

  const className = [
    "cxr__v1",
    instanceId,
    isFullScreen && "cxr__fullscreen",
    "gencl:relative gencl:overflow-visible gencl:h-full gencl:w-full",
  ]
    .filter(Boolean)
    .join(" ");

  // NOTE: Close button is disabled for now for the infolinks, but the logic below is preserved for future use.
  // const showCloseButton = (!isFullScreen && (adLayout === AD_LAYOUT.L4 || adLayout === AD_LAYOUT.L3)) || !isIframe();
  const showCloseButton = false;

  let body: React.ReactNode;
  if (isLoading || !shouldRender) {
    // !shouldRender: the visibility gate is holding render (unit not yet on
    // screen) — same skeleton as the loading state, nothing requests or plays
    // while hidden.
    body = <FeedSkeleton />;
  } else if (feedFailed || entries.length === 0) {
    body = <NoContent message="No content available" />;
  } else {
    const variant = tagDetails?.config?.variant ?? "default";
    body = <Feed entries={entries} variant={variant} />;
  }

  return (
    <div
      ref={overlayRef}
      className={className}
      id={`overlay-${instanceId}`}
      onPointerDownCapture={markInteracted}
      onKeyDownCapture={markInteracted}>
      {showCloseButton && <CloseButton onClick={onDismiss} />}
      <SafeSuspense>{body}</SafeSuspense>
    </div>
  );
}
