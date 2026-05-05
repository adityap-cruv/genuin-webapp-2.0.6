import type OpenPlayerJS from "openplayerjs";
import { memo, useCallback, useEffect, useRef } from "react";

import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";

import { useAdPlayer, type AdDataType, type VideoPlayerStateRef } from "./use-ad-player";

type AdControlsProps = {
  player: OpenPlayerJS | null;
  adUrl?: string;
  muted?: boolean;
  volume?: number;
  playerStateRef: React.MutableRefObject<VideoPlayerStateRef>;
  updateLoadingState: (loading: boolean, isPlaying: boolean) => void;
  isInExpandView?: boolean;
  onSetupReady?: (setupFn: (player: OpenPlayerJS) => void) => void;
  onAdStarted?: (adData: AdDataType) => void;
  onAdCompleted?: (adData: AdDataType) => void;
  onAdError?: (error: any) => void;
  onAdClicked?: (adData: AdDataType) => void;
  onAdSkipped?: (adData: AdDataType) => void;
  onAdPause?: (adData: AdDataType) => void;
  onAdFirstQuartile?: (adData: AdDataType) => void;
  onAdRenderError?: (error: any) => void;
  onAdRequestFailed?: (error: any) => void;
  onAllAdsCompleted?: () => void;
  onAdImpression?: (adData: AdDataType) => void;
  onAdRendered?: (adData: AdDataType) => void;
  onAdResponseReceived?: () => void;
  playThePlayer?: () => void;
};

export const AdControls = memo(function AdControls({
  player,
  muted,
  volume,
  playerStateRef,
  updateLoadingState,
  isInExpandView,
  onSetupReady,
  onAdStarted,
  onAdCompleted,
  onAdError,
  onAdClicked,
  onAdSkipped,
  onAdPause,
  onAdFirstQuartile,
  onAdRenderError,
  onAdRequestFailed,
  onAdImpression,
  onAdRendered,
  onAdResponseReceived,
  onAllAdsCompleted,
  playThePlayer,
}: AdControlsProps) {
  // Use the ad player hook internally
  const { adIsActive, adTimeCountdown, adInfo, setupAdEventListeners } = useAdPlayer({
    player,
    muted,
    volume,
    playerStateRef,
    updateLoadingState,
    onAdStarted,
    onAdFirstQuartile,
    onAdCompleted,
    onAdError,
    onAdRenderError,
    onAdRequestFailed,
    onAdClicked,
    onAdSkipped,
    onAdPause,
    onAllAdsCompleted,
    onAdImpression,
    onAdRendered,
    onAdResponseReceived,
    playThePlayer,
  });

  // Store setupAdEventListeners in a ref to avoid stale closures
  const setupFnRef = useRef(setupAdEventListeners);
  setupFnRef.current = setupAdEventListeners;

  // Provide setup function to parent via callback
  useEffect(() => {
    if (onSetupReady) {
      onSetupReady((player: OpenPlayerJS) => {
        setupFnRef.current(player);
      });
    }
  }, [onSetupReady]);

  const handlePlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      playThePlayer?.();
    },
    [playThePlayer]
  );

  // Don't render UI until ad has started
  if (!adIsActive) {
    return null;
  }

  // const title = adInfo.ctaInfo?.title || null;
  // const adId = adInfo.ctaInfo?.adId || null;
  const currentAdIndex = adInfo.currentIndex;
  const totalAds = adInfo.totalAds;

  // Format time as MM:SS
  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="gencl:absolute gencl:bottom-3 gencl:left-3">
        <p
          className={cn(
            "gencl:py-2 gencl:px-2 gencl:whitespace-nowrap gencl:rounded-full gencl:bg-white gencl:w-min gencl:text-black",
            isInExpandView ? "gencl:text-body-2-medium" : "gencl:text-body-3-medium"
          )}>
          Ad {totalAds > 1 ? `${currentAdIndex} of ${totalAds}` : ""} • {formatTime(adTimeCountdown)}
        </p>
      </div>
      {!adInfo.isPlaying && (
        <div className="swiper-no-swiping gencl:absolute gencl:inset-0 gencl:h-full gencl:w-full gencl:bg-black/30 gencl:z-50 gencl:pointer-events-none">
          <button
            className="gencl:absolute gencl:pointer-events-auto gencl:inset-0 gencl:h-full gencl:w-full gencl:flex gencl:items-center gencl:justify-center"
            onClick={handlePlayClick}>
            <PlayIcon size="lg" theme="fill-dark" className="pointer-events-none" />
          </button>
        </div>
      )}
    </>
  );
});
