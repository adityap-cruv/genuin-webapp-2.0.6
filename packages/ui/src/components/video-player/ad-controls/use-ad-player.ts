import { useDocumentVisibilityState } from "@genuin/ui/hooks";
import type OpenPlayerJS from "openplayerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { categorizeAdError, handleAdErrorRecovery } from "./ad-error-utils";

export type AdDataType = {
  adId: string | null;
  url: string | null;
  title: string | null;
  totalAds?: number;
  currentAdIndex?: number;
};

export type VideoPlayerStateRef = {
  firstQuartileFired: boolean;
  midpointFired: boolean;
  thirdQuartileFired: boolean;
  videoWatchedFired: boolean;
  videoStartFired: boolean;
  shouldPlay: boolean;
  isAdErrored?: boolean;
  allAdsCompleted?: boolean;
  videoCompleted?: boolean;
};

// Hook for managing ad player state and event listeners
export function useAdPlayer({
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
}: {
  player: OpenPlayerJS | null;
  muted?: boolean;
  volume?: number;
  playerStateRef: React.MutableRefObject<VideoPlayerStateRef>;
  updateLoadingState: (loading: boolean, isPlaying: boolean) => void;
  onAdStarted?: (adData: AdDataType) => void;
  onAdCompleted?: (adData: AdDataType) => void;
  onAdError?: (error: any) => void;
  onAdClicked?: (adData: AdDataType) => void;
  onAdSkipped?: (adData: AdDataType) => void;
  onAdPause?: (adData: AdDataType) => void;
  onAllAdsCompleted?: () => void;
  playThePlayer?: () => void;
}) {
  const [adIsActive, setAdIsActive] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState<number>(-1);
  const [adTimeCountdown, setAdTimeCountdown] = useState<number | null>(null);

  // Refs for callbacks to avoid dependencies in useCallback
  const onAdStartedRef = useRef(onAdStarted);
  const onAdCompletedRef = useRef(onAdCompleted);
  const onAdErrorRef = useRef(onAdError);
  const onAdClickedRef = useRef(onAdClicked);
  const onAdSkippedRef = useRef(onAdSkipped);
  const onAdPauseRef = useRef(onAdPause);
  const onAllAdsCompletedRef = useRef(onAllAdsCompleted);
  const updateLoadingStateRef = useRef(updateLoadingState);

  // Ref to store IMA AdsManager for volume/mute sync
  const adsManagerRef = useRef<any>(null);

  // Update refs when props change
  useEffect(() => {
    onAdStartedRef.current = onAdStarted;
    onAdCompletedRef.current = onAdCompleted;
    onAdErrorRef.current = onAdError;
    onAdClickedRef.current = onAdClicked;
    onAdSkippedRef.current = onAdSkipped;
    onAdPauseRef.current = onAdPause;
    onAllAdsCompletedRef.current = onAllAdsCompleted;
    updateLoadingStateRef.current = updateLoadingState;
  }, [
    onAdStarted,
    onAdCompleted,
    onAdError,
    onAdClicked,
    onAdSkipped,
    onAdPause,
    onAllAdsCompleted,
    updateLoadingState,
  ]);

  // Sync mute/volume state with IMA AdsManager
  useEffect(() => {
    if (!adsManagerRef.current) return;

    try {
      const targetVolume = muted ? 0 : (volume ?? 100) / 100;
      adsManagerRef.current.setVolume(targetVolume);
    } catch (err) {
      console.warn("Error syncing ad volume:", err);
    }
  }, [muted, volume]);

  // Ad info state for triggering re-renders
  const [adInfo, setAdInfo] = useState<{
    isPlaying: boolean;
    currentIndex: number;
    totalAds: number;
    ctaInfo: {
      url: string | null;
      title: string | null;
      adId: string | null;
    } | null;
    allCompleted: boolean;
  }>({
    isPlaying: false,
    currentIndex: 0,
    totalAds: 0,
    ctaInfo: null,
    allCompleted: false,
  });

  const setupAdEventListeners = useCallback((player: OpenPlayerJS) => {
    if (!player) {
      console.warn("Player not available for event listeners");
      return;
    }

    // Store current video position before ad error occurs
    let contentTimeBeforeAdError = 0;

    player.getElement().addEventListener("playererror", (e: any) => {
      if (e.detail?.type === "Ads") {
        console.log("Ad playback error:", { e });
        // Store the current content time for potential restoration
        const media = player.getMedia();
        if (media && !isNaN(media.currentTime)) {
          contentTimeBeforeAdError = media.currentTime;
        }

        // If ad tag error 303 (no ads available), trigger all ads completed
        if ((e.detail.message as string).includes("303")) {
          e.target.dispatchEvent(new CustomEvent("adsallAdsCompleted"));
        }

        // Categorize and handle the error using centralized utilities
        const errorResult = categorizeAdError(e.detail?.code);

        if (errorResult.isFatal) {
          const adsManager = player.getAd();
          if (adsManager) {
            handleAdErrorRecovery(adsManager, errorResult, playerStateRef);
          }
        }

        // Resume content playback from the correct position
        setTimeout(() => {
          if (media && contentTimeBeforeAdError > 0) {
            media.currentTime = contentTimeBeforeAdError;
          }

          if (playerStateRef.current.shouldPlay) {
            player.play();
          } else {
            player.pause();
          }
        }, 100);
      }
    });

    setTimeout(() => {
      try {
        const playerElement = player.getElement();
        if (!playerElement || !playerElement.addEventListener) {
          console.warn("Player element does not support addEventListener");
          return;
        }

        playerElement.addEventListener("adserror", (e: any) => {
          console.error("AdsLoader error:", e.detail);
          setTimeout(() => {
            if (playerStateRef.current.shouldPlay) {
              player.play();
            }
          }, 50);
        });

        playerElement.addEventListener("adsloaded", () => {
          const adManager = player.getAd();
          if (!adManager) {
            console.error("Ad manager is not available.");
            return;
          }

          const adsManager = adManager.getAdsManager() as any;
          if (!adsManager) {
            console.error("AdsManager is not available.");
            return;
          }

          // Store adsManager reference for mute/volume sync
          adsManagerRef.current = adsManager;

          adsManager.addEventListener(
            (window as any)?.google?.ima?.AdEvent.Type.AD_PROGRESS,
            (e: any) => {
              try {
                const adData = e.getAdData();
                const adDuration = adData?.duration || 0;
                const currentTime = adData?.currentTime || 0;
                const skipOffset =
                  adsManager.getCurrentAd().getSkipTimeOffset() ?? -1;

                // Update ad time countdown
                const remainingTime = Math.max(
                  0,
                  Math.ceil(adDuration - currentTime)
                );

                setAdTimeCountdown(remainingTime);
                // Update skip countdown
                if (skipOffset > 0) {
                  setSkipCountdown(Math.ceil(skipOffset - currentTime));
                }
              } catch (err) {
                console.warn("Error processing AD_PROGRESS event:", err);
              }
            }
          );

          // STARTED event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdEvent.Type.STARTED,
            (e: any) => {
              try {
                setAdIsActive(true);
                updateLoadingStateRef.current(false, true);

                // Pause player media if it's currently playing when ad starts
                // try {
                //   const media = player?.getMedia();
                //   if (media && !media.paused) {
                //     media.pause();
                //     console.log("Player media paused as ad started");
                //   }
                // } catch (mediaPauseErr) {
                //   console.warn(
                //     "Error pausing player media on ad start:",
                //     mediaPauseErr
                //   );
                // }

                const currentAd = e.ad;
                // Get skip offset (time until skip button becomes available)
                // const skipOffset =
                //   currentAd && typeof currentAd.getSkipTimeOffset === "function"
                //     ? currentAd.getSkipTimeOffset()
                //     : -1;

                const totalAds = e.ad?.data?.adPodInfo?.totalAds || 0;
                const currentIndex = e.ad?.data?.adPodInfo?.adPosition || 0;
                const ctaInfo =
                  e.ad?.data?.clickThroughUrl &&
                  e.ad?.data?.title &&
                  e.ad?.data?.adId
                    ? {
                        url: e.ad.data.clickThroughUrl || null,
                        title: e.ad.data.title || null,
                        adId: e.ad.data.adId || null,
                      }
                    : null;

                setAdInfo((prev) => ({
                  ...prev,
                  totalAds,
                  currentIndex,
                  ctaInfo: ctaInfo || prev.ctaInfo,
                  isPlaying: true,
                }));

                onAdStartedRef.current?.({
                  adId: ctaInfo?.adId || null,
                  url: ctaInfo?.url || null,
                  title: ctaInfo?.title || null,
                  currentAdIndex: currentIndex,
                  totalAds,
                });

                // Check if shouldPlay is false and pause if needed
                if (!playerStateRef.current.shouldPlay) {
                  try {
                    adsManager.pause();
                  } catch (pauseErr) {
                    console.warn("Error pausing ad:", pauseErr);
                  }
                }
              } catch (error) {
                console.error("Error in ad started event:", error);
              }
            }
          );

          // SKIPPED event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdEvent.Type.SKIPPED,
            () => {
              setAdInfo((prev) => {
                onAdSkippedRef.current?.({
                  adId: prev.ctaInfo?.adId || null,
                  url: prev.ctaInfo?.url || null,
                  title: prev.ctaInfo?.title || null,
                  currentAdIndex: prev.currentIndex,
                  totalAds: prev.totalAds,
                });
                return prev;
              });

              setAdIsActive(false);
              // As user clicks on ad and ad is loaded in iframe, window will lose focus
              // Bring back focus to the window after ad is skipped
              window.focus();
            }
          );

          // COMPLETE event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdEvent.Type.COMPLETE,
            () => {
              setAdInfo((prev) => {
                onAdCompletedRef.current?.(
                  prev.ctaInfo
                    ? {
                        adId: prev.ctaInfo.adId,
                        url: prev.ctaInfo.url,
                        title: prev.ctaInfo.title,
                      }
                    : { adId: null, url: null, title: null }
                );
                return {
                  ...prev,
                  isPlaying: false,
                  ctaInfo: null,
                };
              });

              setAdIsActive(false);
            }
          );

          // CLICK event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdEvent.Type.CLICK,
            (e: any) => {
              if (e.ad?.data?.clickThroughUrl && e.ad?.data?.title) {
                setAdInfo((prev) => {
                  onAdClickedRef.current?.({
                    url: e.ad?.data?.clickThroughUrl || null,
                    title: e.ad?.data?.title || null,
                    adId: e.ad?.data?.adId || null,
                    currentAdIndex: prev.currentIndex,
                    totalAds: prev.totalAds,
                  });
                  return prev;
                });
              }
            }
          );

          // ALL_ADS_COMPLETED event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            () => {
              console.log("All ads completed");
              onAllAdsCompletedRef.current?.();
              setAdInfo((prev) => ({ ...prev, allCompleted: true }));
              setAdIsActive(false);
            }
          );

          // RESUMED event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdEvent.Type.RESUMED,
            () => {
              setAdInfo((prev) => ({ ...prev, isPlaying: true }));
              // Check if shouldPlay is false and pause if needed
              if (!playerStateRef.current.shouldPlay) {
                try {
                  adsManager.pause();
                  console.log(
                    "Ad paused on resume due to shouldPlay being false"
                  );
                  setAdInfo((prev) => ({ ...prev, isPlaying: false }));
                  return;
                } catch (pauseErr) {
                  console.warn("Error pausing ad on resume:", pauseErr);
                }
              }
            }
          );

          // PAUSED event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdEvent.Type.PAUSED,
            (e: any) => {
              setAdInfo((prev) => {
                const adData = e.ad?.data;
                onAdPauseRef.current?.({
                  adId: adData?.adId || prev.ctaInfo?.adId || null,
                  url: adData?.clickThroughUrl || prev.ctaInfo?.url || null,
                  title: adData?.title || prev.ctaInfo?.title || null,
                  currentAdIndex: prev.currentIndex,
                  totalAds: prev.totalAds,
                });
                return { ...prev, isPlaying: false };
              });
            }
          );

          // AD_ERROR event handler
          adsManager.addEventListener(
            (window as any).google.ima.AdErrorEvent.Type.AD_ERROR,
            (adErrorEvent: any) => {
              const error = adErrorEvent.getError();

              setAdInfo((prev) => ({
                ...prev,
                isPlaying: false,
                ctaInfo: null,
              }));

              setAdIsActive(false);

              // Categorize and handle the error using centralized utilities
              const errorResult = categorizeAdError(error);
              handleAdErrorRecovery(adsManager, errorResult, playerStateRef);

              // Resume content playback
              setTimeout(() => {
                if (playerStateRef.current.shouldPlay) {
                  player.play();
                }
              }, 50);

              onAdErrorRef.current?.(error);
            }
          );
        });
      } catch (error) {
        console.error("Error setting up player event listeners:", error);
      }
    }, 100);
  }, []);

  const handleSkip = useCallback(() => {
    try {
      if (!player || skipCountdown > 0) return;

      const adObj = player.getAd?.();
      const adsManager = adObj?.getAdsManager?.() as any;
      adsManager.skip();
      // Resume playback after skipping
      playThePlayer?.();
    } catch (err) {
      console.warn("Error attempting to skip ad:", err);
    }
  }, [player, skipCountdown, playThePlayer]);
  const isDocumentVisible = useDocumentVisibilityState();

  // Prevent window from losing focus during ad playback
  // This ensures users remain engaged with the ad content and prevents
  // accidental or intentional navigation away from the active advertisement
  useEffect(() => {
    // If document is already visible and adIsActive, focus the window
    if (isDocumentVisible && adIsActive) {
      window.focus();
    }

    function handleBlur() {
      // Only refocus if:
      // 1. An ad is currently active (adIsActive)
      // 2. The document is still visible (user hasn't switched tabs)
      // This prevents interrupting user's intentional tab switches while
      // still keeping focus when users try to click outside the window
      if (adIsActive && isDocumentVisible) {
        window.focus();
      }
    }

    window.addEventListener("blur", handleBlur);

    // Cleanup: Remove event listener when component unmounts or dependencies change
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [isDocumentVisible, adIsActive, player]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setAdInfo({
        isPlaying: false,
        currentIndex: 0,
        totalAds: 0,
        ctaInfo: null,
        allCompleted: false,
      });
    };
  }, []);

  return {
    adIsActive,
    adPlaying: adInfo.isPlaying,
    skipCountdown,
    adTimeCountdown,
    adInfo,
    handleSkip,
    setupAdEventListeners,
  };
}
