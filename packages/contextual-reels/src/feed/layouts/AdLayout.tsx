/**
 * Ad feed layout component.
 *
 * Single `AdLayout` handles all embed sizes by reading `adLayout` from
 * `useAdWaterfall` and passing it down to `AdControlLayer`, which handles
 * compact-vs-full rendering internally.
 *
 * Phase 2: props use NormalisedAd instead of FeedItem.
 */

import { useCallback, useState } from "react";

import { GenAdSlot } from "@cxr/ads/GenAdSlot";
import { genAdSlotAdProps } from "@cxr/ads/adSlotProps";
import type { AdCtaDetails } from "@cxr/ads/genAdSdk";
import { AdControlLayer } from "@cxr/controls/AdControlLayer";
import { useInactivityAdvance } from "@cxr/feed/hooks/useInactivityAdvance";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { useAdWaterfall } from "@cxr/providers/AdProvider";
import { useFullScreen } from "@cxr/providers/FullScreenProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";
import type { NormalisedAd } from "@cxr/types";

/** Props for {@link AdLayout}. */
export interface AdLayoutProps {
  ad: NormalisedAd;
  isActive: boolean;
  /** Called when the ad fails or completes — parent should advance the carousel. */
  onAutoAdvance?: () => void;
}

/**
 * In-feed ad slot layout — renders GenAdSlot for ad entries across all embed sizes.
 *
 * The `adLayout` from `useAdWaterfall` is forwarded to `AdControlLayer`, which
 * selects compact controls for `mobile-320x50`/`mobile-320x100` or the full
 * tap-overlay + AdControlBar for all other sizes.
 *
 * @param props  ad, isActive, optional onAutoAdvance callback.
 */
export function AdLayout({ ad, isActive, onAutoAdvance }: AdLayoutProps): React.JSX.Element {
  const instanceId = useInstanceId();
  const { isMuted, isPlaying, setMuted, setPlaying } = usePlayer();
  const { onAdSuccess, onAdFail, adLayout } = useAdWaterfall();
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const bus = useEventBus();

  // Tracks whether the per-slot waterfall has settled (fill or no-fill).
  // Resets to false whenever GenAdSlot resets via destroySignal (i.e. on every slide change).
  const [isAdReady, setIsAdReady] = useState(false);
  const [ctaDetails, setCtaDetails] = useState<AdCtaDetails | null>(null);
  const handleAdCTA = useCallback((cta: AdCtaDetails) => setCtaDetails(cta), []);

  // DOM container id of this slot — mirrors the id `useGenAdInstance` derives
  // (`gen-ad-slot-${instanceId}-${id}`). Forwarded to AdControlLayer → ClickOverlay
  // so a non-fullscreen tap emits `ad:unmuteRequest` targeting exactly this slot.
  const containerId = `gen-ad-slot-${instanceId}-${ad.id}`;

  const advance = onAutoAdvance ?? (() => undefined);

  // Mirror old AdsPlaceholder behaviour: advance the carousel AND notify the
  // embedding page (noAdsCallback) whenever the waterfall fails to fill.
  function handleWaterfallFail(): void {
    advance();
    onAdFail();
  }

  function handleFullScreenClick(): void {
    if (!isFullScreen) setMuted(false); // Unmute on fullscreen to avoid silent fullscreen confusion.
    toggleFullScreen();
  }

  // Inactivity advance fires for audio-ad items.
  useInactivityAdvance({
    isActive: isActive && (ad.audioAds ?? false),
    onAdvance: advance,
  });

  function handleAdClick(): void {
    // Mirror LinkoutButton: every ad click fires the SDK-provided CTA signal so
    // a tap anywhere on the ad registers the same click as the explicit CTA button.
    ctaDetails?.onClick();
    if (isFullScreen) {
      setPlaying(!isPlaying);
    } else {
      // Unmute when the user clicks the video. This avoids iOS Safari autoplay
      // restrictions, where audio playback is blocked unless triggered through a
      // direct user interaction.
      //
      // Emit `ad:unmuteRequest` FIRST, synchronously within this click handler.
      // CxrEventBus.emit runs the consumer (useGenAdInstance) inline in this same
      // call stack, so the SDK volume+unmute fires inside the user-gesture window —
      // iOS Safari only honours it there (not from a deferred effect).
      // Only ad overlays carry a containerId; non-ad (video) overlays skip the emit.
      if (containerId) {
        bus.emit("ad:unmuteRequest", { containerId });
      }
      // Then update React/PlayerProvider state (and emit the `mute:unmuted`
      // bus event) so the rest of the app stays consistent.
      setMuted(false);
    }
  }

  return (
    <div data-testid="ad-layout" onClick={handleAdClick} className="gencl:h-full gencl:w-full gencl:relative">
      <GenAdSlot
        id={ad.id}
        instanceId={instanceId}
        isActive={isActive}
        isMuted={isMuted}
        isPlay={isPlaying}
        tagDetails={{}}
        item={{}}
        {...genAdSlotAdProps(ad)}
        isFullScreen={isFullScreen}
        onFullScreenClick={handleFullScreenClick}
        onMuteClick={setMuted}
        onPlayClick={() => setPlaying(!isPlaying)}
        onAdPlay={() => setPlaying(true)}
        onAdPause={() => setPlaying(false)}
        onAdCTA={handleAdCTA}
        destroySignal={isActive ? 0 : 1}
        onWaterfallFail={handleWaterfallFail}
        onAdCompleted={advance}
        onWaterfallSuccess={onAdSuccess}
        onAdLoadedChange={setIsAdReady}
      />
      <AdControlLayer
        adLayout={adLayout}
        isFullScreen={isFullScreen}
        isPlay={isPlaying}
        isMuted={isMuted ?? false}
        isAdReady={isAdReady}
        ctaDetails={ctaDetails}
        onPlayClick={() => setPlaying(!isPlaying)}
        onMuteClick={setMuted}
        onFullScreenClick={handleFullScreenClick}
        containerId={containerId}
      />
    </div>
  );
}
