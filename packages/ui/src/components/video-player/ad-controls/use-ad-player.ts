import type OpenPlayerJS from "openplayerjs";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDocumentVisibilityState } from "@genuin/ui/hooks";

import { categorizeAdError, handleAdErrorRecovery } from "./ad-error-utils";

export type AdDataType = {
  adId: string | null;
  url: string | null;
  title: string | null;
  totalAds?: number;
  currentAdIndex?: number;
  adFormat?: string | null;
  advertiserBrandId?: number | null;
  campaignId?: string | null;
  lineItemId?: string | null;
  creativeId?: string | null;
  mediaType?: string | null;
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
  onAdFirstQuartile,
  onAdRenderError,
  onAdRequestFailed,
  onAdImpression,
  onAdRendered,
  onAdResponseReceived,
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
  onAdFirstQuartile?: (adData: AdDataType) => void;
  onAdRenderError?: (error: any) => void;
  onAdRequestFailed?: (error: any) => void;
  onAdImpression?: (adData: AdDataType) => void;
  onAdRendered?: (adData: AdDataType) => void;
  onAdResponseReceived?: () => void;
  onAllAdsCompleted?: () => void;
  playThePlayer?: () => void;
}) {
  const [adIsActive, setAdIsActive] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState<number>(-1);
  const [adTimeCountdown, setAdTimeCountdown] = useState<number | null>(null);

  // Refs for callbacks to avoid dependencies in useCallback
  // We update refs synchronously during render to avoid race conditions
  // on mobile where IMA events fire before useEffect runs
  const onAdStartedRef = useRef(onAdStarted);
  onAdStartedRef.current = onAdStarted;

  const onAdCompletedRef = useRef(onAdCompleted);
  onAdCompletedRef.current = onAdCompleted;

  const onAdErrorRef = useRef(onAdError);
  onAdErrorRef.current = onAdError;

  const onAdClickedRef = useRef(onAdClicked);
  onAdClickedRef.current = onAdClicked;

  const onAdSkippedRef = useRef(onAdSkipped);
  onAdSkippedRef.current = onAdSkipped;

  const onAdPauseRef = useRef(onAdPause);
  onAdPauseRef.current = onAdPause;

  const onAdFirstQuartileRef = useRef(onAdFirstQuartile);
  onAdFirstQuartileRef.current = onAdFirstQuartile;

  const onAdRenderErrorRef = useRef(onAdRenderError);
  onAdRenderErrorRef.current = onAdRenderError;

  const onAdRequestFailedRef = useRef(onAdRequestFailed);
  onAdRequestFailedRef.current = onAdRequestFailed;

  const onAdImpressionRef = useRef(onAdImpression);
  onAdImpressionRef.current = onAdImpression;

  const onAdRenderedRef = useRef(onAdRendered);
  onAdRenderedRef.current = onAdRendered;

  const onAdResponseReceivedRef = useRef(onAdResponseReceived);
  onAdResponseReceivedRef.current = onAdResponseReceived;

  const onAllAdsCompletedRef = useRef(onAllAdsCompleted);
  onAllAdsCompletedRef.current = onAllAdsCompleted;

  const updateLoadingStateRef = useRef(updateLoadingState);
  updateLoadingStateRef.current = updateLoadingState;

  // Ref to store IMA AdsManager for volume/mute sync
  const adsManagerRef = useRef<any>(null);

  console.log("loading state in useAdPlayer:", { adsManagerRef });

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
      creativeId?: string | null;
      advertiserBrandId?: number | null;
      campaignId?: string | null;
      lineItemId?: string | null;
      mediaType?: string | null;
      adFormat?: string | null;
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
    console.log("Setting up ad event listeners on player:", player);
    if (!player) {
      console.warn("Player not available for event listeners");
      return;
    }

    player.getElement().addEventListener("playererror", (e: any) => {
      if (e.detail?.type === "Ads") {
        if (e.detail?.message.includes("303")) {
          onAdRequestFailedRef.current?.(e.detail);
        } else if (
          e.detail?.message.includes("400") ||
          e.detail?.message.includes("401") ||
          e.detail?.message.includes("403") ||
          e.detail?.message.includes("404")
        ) {
          onAdRenderErrorRef.current?.(e.detail);
        } else {
          // this ad error
          onAdErrorRef.current?.(e.detail);
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

        // Resume content playback from the correct position. Catch
        // the AbortError that fires when a src swap interrupts the
        // play promise — registry handles the next play call.
        setTimeout(() => {
          if (playerStateRef.current.shouldPlay) {
            void player.play()?.catch?.(() => {});
          } else {
            player.pause();
          }
        }, 100);
      }
    });

    setTimeout(() => {
      try {
        console.log("Setting up ad event listeners on player element");
        const playerElement = player.getElement();
        if (!playerElement || !playerElement.addEventListener) {
          console.warn("Player element does not support addEventListener");
          return;
        }

        console.log("Setting up ad event listeners on player element:", playerElement);

        playerElement.addEventListener("adserror", (e: any) => {
          console.error("AdsLoader error:", e.detail);
          setTimeout(() => {
            if (playerStateRef.current.shouldPlay) {
              void player.play()?.catch?.(() => {});
            }
          }, 50);
        });

        playerElement.addEventListener("adsloaded", () => {
          console.log("Ads loaded event received");
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

          onAdResponseReceivedRef.current?.();

          // LOADED event handler
          adsManager.addEventListener((window as any)?.google?.ima?.AdEvent.Type.LOADED, (e: any) => {
            setAdInfo((prev) => {
              const updatedCtaInfo = {
                adId: e.ad?.data?.adId || prev.ctaInfo?.adId || null,
                url: e.ad?.data?.clickThroughUrl || prev.ctaInfo?.url || null,
                title: e.ad?.data?.title || prev.ctaInfo?.title || null,
                creativeId: e.ad?.data?.creativeId || prev.ctaInfo?.creativeId || null,
                advertiserBrandId: e.ad?.data?.advertiserBrandId || prev.ctaInfo?.advertiserBrandId || null,
                campaignId: e.ad?.data?.campaignId || prev.ctaInfo?.campaignId || null,
                lineItemId: e.ad?.data?.lineItemId || prev.ctaInfo?.lineItemId || null,
                mediaType: e.ad?.data?.mediaType || e.ad?.data?.contentType || prev.ctaInfo?.mediaType || null,
                adFormat: e.ad?.data?.adFormat || prev.ctaInfo?.adFormat || null,
              };
              onAdRenderedRef.current?.({
                ...updatedCtaInfo,
                currentAdIndex: prev.currentIndex,
                totalAds: prev.totalAds,
              });
              return { ...prev, ctaInfo: updatedCtaInfo };
            });
          });

          // IMPRESSION event handler
          adsManager.addEventListener((window as any)?.google?.ima?.AdEvent.Type.IMPRESSION, () => {
            setAdInfo((prev) => {
              onAdImpressionRef.current?.({
                adId: prev.ctaInfo?.adId || null,
                url: prev.ctaInfo?.url || null,
                title: prev.ctaInfo?.title || null,
                currentAdIndex: prev.currentIndex,
                totalAds: prev.totalAds,
                creativeId: prev.ctaInfo?.creativeId || null,
                advertiserBrandId: prev.ctaInfo?.advertiserBrandId || null,
                campaignId: prev.ctaInfo?.campaignId || null,
                lineItemId: prev.ctaInfo?.lineItemId || null,
                mediaType: prev.ctaInfo?.mediaType || null,
                adFormat: prev.ctaInfo?.adFormat || null,
              });
              return prev;
            });
          });

          // FIRST_QUARTILE event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.FIRST_QUARTILE, () => {
            setAdInfo((prev) => {
              onAdFirstQuartileRef.current?.({
                adId: prev.ctaInfo?.adId || null,
                url: prev.ctaInfo?.url || null,
                title: prev.ctaInfo?.title || null,
                currentAdIndex: prev.currentIndex,
                totalAds: prev.totalAds,
                creativeId: prev.ctaInfo?.creativeId || null,
                advertiserBrandId: prev.ctaInfo?.advertiserBrandId || null,
                campaignId: prev.ctaInfo?.campaignId || null,
                lineItemId: prev.ctaInfo?.lineItemId || null,
                mediaType: prev.ctaInfo?.mediaType || null,
                adFormat: prev.ctaInfo?.adFormat || null,
              });
              return prev;
            });
          });

          adsManager.addEventListener((window as any)?.google?.ima?.AdEvent.Type.AD_PROGRESS, (e: any) => {
            try {
              const adData = e.getAdData();
              const adDuration = adData?.duration || 0;
              const currentTime = adData?.currentTime || 0;
              const skipOffset = adsManager.getCurrentAd().getSkipTimeOffset() ?? -1;

              // Update ad time countdown
              const remainingTime = Math.max(0, Math.ceil(adDuration - currentTime));

              setAdTimeCountdown(remainingTime);
              // Update skip countdown
              if (skipOffset > 0) {
                setSkipCountdown(Math.ceil(skipOffset - currentTime));
              }
            } catch (err) {
              console.warn("Error processing AD_PROGRESS event:", err);
            }
          });

          // STARTED event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.STARTED, (e: any) => {
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

              // const currentAd = e.ad
              // Get skip offset (time until skip button becomes available)
              // const skipOffset =
              //   currentAd && typeof currentAd.getSkipTimeOffset === "function"
              //     ? currentAd.getSkipTimeOffset()
              //     : -1;

              const totalAds = e.ad?.data?.adPodInfo?.totalAds || 0;
              const currentIndex = e.ad?.data?.adPodInfo?.adPosition || 0;
              const ctaInfo =
                e.ad?.data?.clickThroughUrl && e.ad?.data?.title && e.ad?.data?.adId
                  ? {
                      url: e.ad.data.clickThroughUrl || null,
                      title: e.ad.data.title || null,
                      adId: e.ad.data.adId || null,
                      creativeId: e.ad.data.creativeId || null,
                      advertiserBrandId: e.ad.data.advertiserBrandId || null,
                      campaignId: e.ad.data.campaignId || null,
                      lineItemId: e.ad.data.lineItemId || null,
                      mediaType: e.ad.data.mediaType || e.ad.data.contentType || null,
                      adFormat: e.ad.data.adFormat || null,
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
                creativeId: ctaInfo?.creativeId || null,
                advertiserBrandId: ctaInfo?.advertiserBrandId || null,
                campaignId: ctaInfo?.campaignId || null,
                lineItemId: ctaInfo?.lineItemId || null,
                mediaType: ctaInfo?.mediaType || null,
                adFormat: ctaInfo?.adFormat || null,
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
          });

          // SKIPPED event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.SKIPPED, () => {
            setAdInfo((prev) => {
              onAdSkippedRef.current?.({
                adId: prev.ctaInfo?.adId || null,
                url: prev.ctaInfo?.url || null,
                title: prev.ctaInfo?.title || null,
                currentAdIndex: prev.currentIndex,
                totalAds: prev.totalAds,
                creativeId: prev.ctaInfo?.creativeId || null,
                advertiserBrandId: prev.ctaInfo?.advertiserBrandId || null,
                campaignId: prev.ctaInfo?.campaignId || null,
                lineItemId: prev.ctaInfo?.lineItemId || null,
                mediaType: prev.ctaInfo?.mediaType || null,
                adFormat: prev.ctaInfo?.adFormat || null,
              });
              return prev;
            });

            setAdIsActive(false);
            // As user clicks on ad and ad is loaded in iframe, window will lose focus
            // Bring back focus to the window after ad is skipped
            window.focus();
          });

          // COMPLETE event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.COMPLETE, () => {
            setAdInfo((prev) => {
              onAdCompletedRef.current?.(
                prev.ctaInfo
                  ? {
                      adId: prev.ctaInfo.adId,
                      url: prev.ctaInfo.url,
                      title: prev.ctaInfo.title,
                      creativeId: prev.ctaInfo.creativeId || null,
                      advertiserBrandId: prev.ctaInfo.advertiserBrandId || null,
                      campaignId: prev.ctaInfo.campaignId || null,
                      lineItemId: prev.ctaInfo.lineItemId || null,
                      mediaType: prev.ctaInfo.mediaType || null,
                      adFormat: prev.ctaInfo.adFormat || null,
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
          });

          // CLICK event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.CLICK, (e: any) => {
            if (e.ad?.data?.clickThroughUrl && e.ad?.data?.title) {
              setAdInfo((prev) => {
                onAdClickedRef.current?.({
                  url: e.ad?.data?.clickThroughUrl || null,
                  title: e.ad?.data?.title || null,
                  adId: e.ad?.data?.adId || null,
                  currentAdIndex: prev.currentIndex,
                  totalAds: prev.totalAds,
                  creativeId: e.ad?.data?.creativeId || prev.ctaInfo?.creativeId || null,
                  advertiserBrandId: e.ad?.data?.advertiserBrandId || prev.ctaInfo?.advertiserBrandId || null,
                  campaignId: e.ad?.data?.campaignId || prev.ctaInfo?.campaignId || null,
                  lineItemId: e.ad?.data?.lineItemId || prev.ctaInfo?.lineItemId || null,
                  mediaType: e.ad?.data?.mediaType || e.ad?.data?.contentType || prev.ctaInfo?.mediaType || null,
                  adFormat: e.ad?.data?.adFormat || prev.ctaInfo?.adFormat || null,
                });
                return prev;
              });
            }
          });

          // ALL_ADS_COMPLETED event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
            onAllAdsCompletedRef.current?.();
            setAdInfo((prev) => ({ ...prev, allCompleted: true }));
            setAdIsActive(false);
          });

          // RESUMED event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.RESUMED, () => {
            setAdInfo((prev) => ({ ...prev, isPlaying: true }));
            // Check if shouldPlay is false and pause if needed
            if (!playerStateRef.current.shouldPlay) {
              try {
                adsManager.pause();
                setAdInfo((prev) => ({ ...prev, isPlaying: false }));
                return;
              } catch (pauseErr) {
                console.warn("Error pausing ad on resume:", pauseErr);
              }
            }
          });

          // PAUSED event handler
          adsManager.addEventListener((window as any).google.ima.AdEvent.Type.PAUSED, (e: any) => {
            setAdInfo((prev) => {
              const adData = e.ad?.data;
              onAdPauseRef.current?.({
                adId: adData?.adId || prev.ctaInfo?.adId || null,
                url: adData?.clickThroughUrl || prev.ctaInfo?.url || null,
                title: adData?.title || prev.ctaInfo?.title || null,
                currentAdIndex: prev.currentIndex,
                totalAds: prev.totalAds,
                creativeId: adData?.creativeId || prev.ctaInfo?.creativeId || null,
                advertiserBrandId: adData?.advertiserBrandId || prev.ctaInfo?.advertiserBrandId || null,
                campaignId: adData?.campaignId || prev.ctaInfo?.campaignId || null,
                lineItemId: adData?.lineItemId || prev.ctaInfo?.lineItemId || null,
                mediaType: adData?.mediaType || adData?.contentType || prev.ctaInfo?.mediaType || null,
                adFormat: adData?.adFormat || prev.ctaInfo?.adFormat || null,
              });
              return { ...prev, isPlaying: false };
            });
          });

          // AD_ERROR event handler
          adsManager.addEventListener((window as any).google.ima.AdErrorEvent.Type.AD_ERROR, (adErrorEvent: any) => {
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

            // Resume content playback. Catch the AbortError that
            // fires when a src swap interrupts the play promise.
            setTimeout(() => {
              if (playerStateRef.current.shouldPlay) {
                void player.play()?.catch?.(() => {});
              }
            }, 50);

            onAdErrorRef.current?.(error);
          });
        });
      } catch (error) {
        console.error("Error setting up player event listeners:", error);
      }
    }, 10);
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
