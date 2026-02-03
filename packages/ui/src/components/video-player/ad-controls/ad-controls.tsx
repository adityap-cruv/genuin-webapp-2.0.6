import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import type OpenPlayerJS from "openplayerjs";
import { memo, useEffect, useRef } from "react";
import {
  useAdPlayer,
  type AdDataType,
  type VideoPlayerStateRef,
} from "./use-ad-player";
import { useBrowserDetect, useDeviceDetection } from "@genuin/ui/hooks";

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
  onAllAdsCompleted?: () => void;
  playThePlayer?: () => void;
};

export const AdControls = memo(function AdControls({
  player,
  adUrl,
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
  onAllAdsCompleted,
  playThePlayer,
}: AdControlsProps) {
  // Use the ad player hook internally
  const {
    adIsActive,
    // adPlaying,
    // skipCountdown,
    adTimeCountdown,
    adInfo,
    // handleSkip,
    setupAdEventListeners,
  } = useAdPlayer({
    player,
    muted,
    volume,
    playerStateRef,
    updateLoadingState,
    onAdStarted,
    onAdCompleted,
    onAdError,
    onAdClicked,
    onAdSkipped,
    onAdPause,
    onAllAdsCompleted,
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

  // Don't render UI until ad has started
  if (!adIsActive) {
    return null;
  }

  const url = adInfo.ctaInfo?.url || null;
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
            isInExpandView
              ? "gencl:text-body-2-medium"
              : "gencl:text-body-3-medium"
          )}
        >
          Ad {totalAds > 1 ? `${currentAdIndex} of ${totalAds}` : ""} •{" "}
          {formatTime(adTimeCountdown)}
        </p>
      </div>
      {/* <div className="gencl:absolute gencl:pointer-events-none gencl:bottom-3 gencl:w-full gencl:space-y-2 gencl:px-3 gencl:z-50 gencl:gap-3"> */}
      {/* {url && (
          <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-2 gencl:bg-white gencl:p-2 gencl:rounded-lg gencl:pointer-events-auto">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="gencl:flex gencl:items-center gencl:gap-1 gencl:text-body-1-bold"
              >
                <LinkIcon variant="dark" />
                <p>Learn More</p>
              </a>
            )}
            {title && (
              <a
                className="gencl:text-body-1-bold gencl:text-white gencl:line-clamp-1"
                href={url ?? "#"}
                target="_blank"
                onClick={() => {
                  // Analytics.track(Analytics.EventNames.AdCtaClicked, {
                  //   video_id: getId(id),
                  //   cta_url: url,
                  //   ad_id: adId,
                  //   click_position: "cta_button",
                  //   cta_name: title,
                  // });
                }}
                rel="noreferrer"
              >
                {title}
              </a>
            )}
            <a
              className="gencl:bg-white gencl:p-2 gencl:text-body-1-bold gencl:rounded-lg gencl:z-50"
              href={url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Analytics.track(Analytics.EventNames.AdCtaClicked, {
                //   video_id: getId(id),
                //   ad_id: adId,
                //   cta_url: url,
                //   click_position: "cta_button",
                //   cta_name: "Learn More",
                // });
              }}
            >
              Learn More
            </a>
          </div>
        )} */}
      {/* <div className="gencl:flex gencl:justify-between gencl:w-full gencl:items-center">
          <p
            className={cn(
              "gencl:py-2 gencl:px-2 gencl:whitespace-nowrap gencl:rounded-full gencl:bg-white gencl:w-min gencl:text-black",
              isInExpandView
                ? "gencl:text-body-2-medium"
                : "gencl:text-body-3-medium"
            )}
          >
            Ad {totalAds > 1 ? `${currentAdIndex} of ${totalAds}` : ""} •{" "}
            {formatTime(adTimeCountdown)}
          </p>
          <div></div> */}
      {/* <button
            type="button"
            aria-label="Skip ad"
            onClick={handleSkip}
            // disabled={skipCountdown <= 0}
            className={cn(
              "gencl:flex gencl:items-center gencl:bg-red gencl:gap-1 gencl:rounded-3xl gencl:pointer-events-auto",
              isInExpandView
                ? "gencl:px-3 gencl:py-2"
                : "gencl:size-6 gencl:p-1 gencl:justify-center"
            )}
          >
            {isInExpandView && (
              <>
                <p className="gencl:text-body-2-medium gencl:text-white">
                  {skipCountdown > 0 &&
                    `You can skip this ad in ${skipCountdown}`}
                  {skipCountdown <= 0 && "Skip"}
                </p>
                <SkipAdIcon size="sm" />
              </>
            )}
            {!isInExpandView && (
              <>
                {skipCountdown > 0 && (
                  <p className="gencl:text-body-3-medium gencl:text-white">
                    {skipCountdown}
                  </p>
                )}
                {skipCountdown <= 0 && <SkipAdIcon size="xs" />}
              </>
            )}
          </button> */}
      {/* </div> */}
      {/* </div> */}
      {!adInfo.isPlaying && (
        <div className="swiper-no-swiping gencl:absolute gencl:inset-0 gencl:h-full gencl:w-full gencl:bg-black/30 gencl:z-50 gencl:pointer-events-none">
          <button
            className="gencl:absolute gencl:pointer-events-auto gencl:inset-0 gencl:h-full gencl:w-full gencl:flex gencl:items-center gencl:justify-center"
            onClick={(e) => {
              e.stopPropagation();
              playThePlayer?.();
            }}
          >
            <PlayIcon
              size="lg"
              theme="fill-dark"
              className="pointer-events-none"
            />
          </button>
        </div>
      )}
    </>
  );
});
