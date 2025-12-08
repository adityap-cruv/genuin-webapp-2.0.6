"use client";
import OpenPlayerJS from "openplayerjs";
import type { ComponentProps } from "react";
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn, encodeVideoSourceUrl } from "@genuin/ui/lib/utils";
import { useBrowserDetect } from "@genuin/ui/hooks";

const hlsConfigs = {
  // debug: true,
  /**
   * Start with lowest quality level to ensure smooth playback start.
   * ABR will gradually increase quality based on actual bandwidth.
   */
  startLevel: 0,
  /**
   * Disable capLevelToPlayerSize to prevent jumping to high quality based on player dimensions.
   * This ensures startLevel is respected for the first fragment.
   */
  capLevelToPlayerSize: false,
  /**
   * Restrict initial quality - set max to level 1 initially to force low quality start.
   * This can be adjusted dynamically after playback starts.
   */
  maxAutoLevel: 1,
  /**
   * Use worker threads for decoding for better performance.
   */
  enableWorker: true,
  /**
   * Enable Encrypted Media Extensions (EME) if DRM is required.
   */
  emeEnabled: true,
  /**
   * Low latency mode for quicker playback start and adaptation.
   */
  lowLatencyMode: true,
  /**
   * Buffer settings optimized for 2-second fragments.
   */
  maxBufferLength: 10, // Buffer up to 6 fragments (12 seconds).
  maxBufferSize: 40 * 1000 * 1000, // Maximum buffer size in bytes (40MB).
  backBufferLength: 30, // Retain 30 seconds for seamless rewind.
  /**
   * Fragment loading optimization.
   */
  fragLoadingTimeOut: 7000, // Timeout in milliseconds for loading fragments (reduced for faster failure detection).
  startFragPrefetch: true, // Prefetch the next fragment to minimize stutters.
  /**
   * Prevent HLS.js from probing multiple quality levels on startup.
   * This stops unnecessary parallel downloads of the same fragment at different qualities.
   */
  testBandwidth: false, // Disable initial bandwidth test that loads multiple quality levels
  /**
   * Conservative ABR settings to prevent jumping to highest quality immediately.
   */
  abrEwmaDefaultEstimate: 300000, // Lower initial bandwidth estimate (300 kbps) to start conservatively.
  abrBandWidthFactor: 0.8, // More conservative - requires 80% of bandwidth before switching up.
  abrBandWidthUpFactor: 0.5, // Very conservative upscaling - prevents jumping to 1080p immediately.
  abrEwmaFastLive: 3, // Slower adaptation for live content.
  abrEwmaSlowLive: 5, // Even slower for stable quality.
  abrEwmaFastVoD: 3, // Slower adaptation for VOD content.
  abrEwmaSlowVoD: 5, // Gradual quality increases.
  /**
   * Handle live playback smoothly for low-latency streams.
   */
  liveSyncDuration: 2.5, // Keep live playback latency low.
  liveMaxLatencyDuration: 6, // Maximum latency allowed for live streams.
  /**
   * Error recovery and buffer hole handling.
   */
  maxLoadingDelay: 4, // Maximum delay for loading retries (seconds).
  maxBufferHole: 0.5, // Maximum buffer hole tolerance (seconds).
  highBufferWatchdogPeriod: 2, // Period to check for buffer issues (seconds).
};

export type PlayerProps = ComponentProps<"video"> & {
  volume?: number;
  playbackSpeed?: number;
  play?: boolean;
  adUrl?: string; // URL for video ads
  startTime?: number;
  enableLazyLoading?: boolean; // Enable lazy loading optimization (default: false)
  onOpenPlayerReady?: (player: OpenPlayerJS) => void;
  onPlayerLoad?: (player: OpenPlayerJS | null) => void; // Add custom event prop
  onVideoFirstQuartile?: (duration: number, currentTime: number) => void;
  onVideoMidpoint?: (duration: number, currentTime: number) => void;
  onVideoThirdQuartile?: (duration: number, currentTime: number) => void;
  onVideoWatched?: (duration: number, currentTime: number) => void;
  onAdStarted?: (adData: AdDataType) => void; // Callback when ad starts
  onAdCompleted?: (adData: AdDataType) => void; // Callback when ad completes
  onAdError?: (error: any) => void; // Callback when ad errors
  onAdClicked?: (adData: AdDataType) => void; // Callback when ad is clicked
  onAdSkipped?: (adData: AdDataType) => void; // Callback when ad is skipped
  onAllAdsCompleted?: () => void; // Callback when all ads are completed
  onVideoStart?: (
    duration: number,
    currentTime: number,
    latency: number
  ) => void; // Add onVideoStart prop
  onMutedChange?: (muted: boolean) => void;
};

type VideoPlayerStateRef = {
  firstQuartileFired: boolean;
  midpointFired: boolean;
  thirdQuartileFired: boolean;
  videoWatchedFired: boolean;
  videoStartFired: boolean;
  shouldPlay: boolean;
  isAdErrored?: boolean;
};

type AdDataType = {
  adId: string | null;
  url: string | null;
  title: string | null;
  totalAds?: number;
  currentAdIndex?: number;
};

export const VideoPlayer = memo(function VideoPlayer({
  src,
  id,
  poster,
  className,
  style,
  startTime = 0,
  ref,
  playsInline = true,
  volume = 100,
  playbackSpeed = 1,
  play = true,
  loop = false, // loop prop is now destructured
  adUrl,
  enableLazyLoading = false, // Default to false for backward compatibility
  onVideoFirstQuartile,
  onOpenPlayerReady,
  onPlayerLoad, // Destructure new prop
  onVideoMidpoint,
  onVideoThirdQuartile,
  onVideoWatched,
  onVideoStart, // Destructure onVideoStart prop
  onAdStarted,
  onAdCompleted,
  onAdError,
  onAdClicked,
  onAdSkipped,
  onAllAdsCompleted,
  onSeeked,
  onMutedChange,
  ...props
}: PlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => internalVideoRef.current as HTMLVideoElement, [
    internalVideoRef.current,
  ]);
  const videoRef = internalVideoRef;
  const playerRef = useRef<OpenPlayerJS | null>(null);
  const isPlayerInitialized = useRef(false); // Track if player has been initialized
  const [adStarted, setAdStarted] = useState(false);
  const { isSafari } = useBrowserDetect();
  // Using refs for ad tracking (no UI updates needed)
  const adInfoRef = useRef<{
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

  const playerStateRef = useRef<VideoPlayerStateRef>({
    shouldPlay: play,
    firstQuartileFired: false,
    midpointFired: false,
    thirdQuartileFired: false,
    videoWatchedFired: false,
    videoStartFired: false,
    isAdErrored: false,
  });

  useEffect(() => {
    if (typeof volume === "undefined") return;
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Listen for customLoad event and call onCustomLoad
  useEffect(() => {
    if (!videoRef.current || !onPlayerLoad) return;
    const currentVideoElement = videoRef.current; // Capture current value
    const handler = () => onPlayerLoad(playerRef.current);
    currentVideoElement.addEventListener("playerLoad", handler);
    return () => {
      currentVideoElement?.removeEventListener("playerLoad", handler); // Use captured value
    };
  }, [onPlayerLoad]);

  const setupAdPlayerEventListeners = useCallback(
    (player: OpenPlayerJS) => {
      if (!player) {
        console.warn("Player not available for event listeners");
        return;
      }

      // Store current video position before ad error occurs
      let contentTimeBeforeAdError = 0;

      player.getElement().addEventListener("playererror", (e: any) => {
        if (e.detail?.type === "Ads") {
          console.error("OpenPlayerJS Ad Error:", e.detail);

          // Store the current content time for potential restoration
          const media = player.getMedia();
          if (media && !isNaN(media.currentTime)) {
            contentTimeBeforeAdError = media.currentTime;
          }

          // Only mark as errored if it's a fatal error that requires full cleanup
          // For individual ad failures, we'll handle them in the IMA SDK error handler
          const errorCode = e.detail?.code;
          const isFatalError =
            errorCode &&
            (errorCode.toString().includes("VAST") ||
              errorCode.toString().includes("NETWORK") ||
              errorCode.toString().includes("VIDEO"));

          if (isFatalError) {
            playerStateRef.current.isAdErrored = true;

            const adsManager = player.getAd();
            if (adsManager) {
              try {
                adsManager.destroy();
              } catch (error) {
                console.warn("Error destroying ads manager:", error);
              }
            }
          }

          // Resume content playback from the correct position
          setTimeout(() => {
            if (media && contentTimeBeforeAdError > 0) {
              media.currentTime = contentTimeBeforeAdError;
            }

            if (playerStateRef.current.shouldPlay) {
              playThePlayer();
            } else {
              pauseThePlayer();
            }
          }, 100);
        }
      }); // Wait a bit for the player element to be ready
      setTimeout(() => {
        try {
          const playerElement = player.getElement();
          if (!playerElement || !playerElement.addEventListener) {
            console.warn("Player element does not support addEventListener");
            return;
          }

          // Add AdsLoader error listener (for ad request/loading errors)
          playerElement.addEventListener("adserror", (e: any) => {
            console.error("AdsLoader error:", e.detail);
            // AdsLoader errors are typically fatal for the current ad request
            // Resume content playback
            setTimeout(() => {
              if (playerStateRef.current.shouldPlay) {
                playThePlayer();
              }
            }, 50);
          });

          // Add an event listener for when ads are loaded
          playerElement.addEventListener("adsloaded", () => {
            const adManager = player.getAd();
            if (!adManager) {
              console.error("Ad manager is not available.");
              return;
            }

            // Use any type to avoid TypeScript errors with IMA SDK
            const adsManager = adManager.getAdsManager() as any;
            if (!adsManager) {
              console.error("AdsManager is not available.");
              return;
            }

            // Listen for the STARTED event to handle ad playback start
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.STARTED,
              (e: any) => {
                try {
                  setAdStarted(true);

                  // Track ad info in ref (no UI updates)
                  adInfoRef.current.totalAds =
                    e.ad?.data?.adPodInfo?.totalAds || 0;
                  adInfoRef.current.currentIndex =
                    e.ad?.data?.adPodInfo?.adPosition || 0;

                  // Extract ad details
                  if (
                    e.ad?.data?.clickThroughUrl &&
                    e.ad?.data?.title &&
                    e.ad?.data?.adId
                  ) {
                    adInfoRef.current.ctaInfo = {
                      url: e.ad.data.clickThroughUrl || null,
                      title: e.ad.data.title || null,
                      adId: e.ad.data.adId || null,
                    };
                  }

                  // Track that ad is playing
                  adInfoRef.current.isPlaying = true;

                  // Call the onAdStarted callback if provided
                  onAdStarted?.({
                    adId: adInfoRef.current.ctaInfo?.adId || null,
                    url: adInfoRef.current.ctaInfo?.url || null,
                    title: adInfoRef.current.ctaInfo?.title || null,
                    currentAdIndex: adInfoRef.current.currentIndex,
                    totalAds: adInfoRef.current.totalAds,
                  });
                } catch (error) {
                  console.error("Error in ad started event:", error);
                }
              }
            );

            // Listen for the SKIPPED event to handle when the ad is skipped by the user
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.SKIPPED,
              () => {
                onAdSkipped?.({
                  adId: adInfoRef.current.ctaInfo?.adId || null,
                  url: adInfoRef.current.ctaInfo?.url || null,
                  title: adInfoRef.current.ctaInfo?.title || null,
                  currentAdIndex: adInfoRef.current.currentIndex,
                  totalAds: adInfoRef.current.totalAds,
                });
              }
            );

            // Listen for the COMPLETE event to handle when the ad finishes playing
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.COMPLETE,
              () => {
                // Call onAdCompleted with the current CTA info before resetting
                const currentCtaInfo = adInfoRef.current.ctaInfo;
                // if (currentCtaInfo) {
                onAdCompleted?.(
                  currentCtaInfo
                    ? {
                        adId: currentCtaInfo.adId,
                        url: currentCtaInfo.url,
                        title: currentCtaInfo.title,
                      }
                    : { adId: null, url: null, title: null }
                );
                // }

                // Reset the ad playing state and CTA info
                adInfoRef.current.isPlaying = false;
                adInfoRef.current.ctaInfo = null;
              }
            );

            // Listen for ad click events
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.CLICK,
              (e: any) => {
                if (e.ad?.data?.clickThroughUrl && e.ad?.data?.title) {
                  onAdClicked?.({
                    url: e.ad.data.clickThroughUrl,
                    title: e.ad.data.title,
                    adId: e.ad.data.adId,
                    currentAdIndex: adInfoRef.current.currentIndex,
                    totalAds: adInfoRef.current.totalAds,
                  });
                }
              }
            );

            // Listen for when all ads complete
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
              () => {
                onAllAdsCompleted?.();
                adInfoRef.current.allCompleted = true;
              }
            );

            // Listen for ad errors using proper IMA SDK AdErrorEvent
            adsManager.addEventListener(
              (window as any).google.ima.AdErrorEvent.Type.AD_ERROR,
              (adErrorEvent: any) => {
                const error = adErrorEvent.getError();
                console.error("IMA SDK Ad Error:", error);

                // Reset current ad state
                adInfoRef.current.isPlaying = false;
                adInfoRef.current.ctaInfo = null;

                // Determine error handling strategy based on error type
                const errorType = error.getType();
                const errorCode = error.getErrorCode();

                console.log(
                  `Ad Error - Type: ${errorType}, Code: ${errorCode}`
                );

                // For individual ad failures, use discardAdBreak to skip current ad
                // but keep ads manager alive for future ad breaks (mid-roll, post-roll)
                if (
                  errorType ===
                    (window as any).google.ima.AdError.Type.AD_LOAD ||
                  errorType ===
                    (window as any).google.ima.AdError.Type.AD_PLAY ||
                  (errorCode >= 400 && errorCode < 500) // Client-side errors
                ) {
                  console.log(
                    "Discarding current ad break due to individual ad failure"
                  );

                  try {
                    // Get current ad info before discarding
                    const currentAd = adsManager.getCurrentAd?.();
                    if (currentAd) {
                      const universalAdIds =
                        currentAd.getUniversalAdIds?.() || [];
                      console.log(
                        "Discarding ad break with universal ad IDs:",
                        universalAdIds
                      );
                    }

                    // Discard only the current ad break, keeping ads manager for future ads
                    adsManager.discardAdBreak();
                  } catch (discardError) {
                    console.warn("Error discarding ad break:", discardError);
                    // If discard fails, mark as errored but don't destroy ads manager yet
                    playerStateRef.current.isAdErrored = true;
                  }
                } else if (
                  errorType ===
                    (window as any).google.ima.AdError.Type.ADS_MANAGER_LOAD ||
                  (errorCode >= 900 && errorCode < 1000) || // General errors
                  errorCode >= 1000 // Fatal errors
                ) {
                  // Fatal errors require destroying the ads manager
                  console.log("Fatal ad error, destroying ads manager");
                  playerStateRef.current.isAdErrored = true;

                  try {
                    adsManager.destroy();
                  } catch (destroyError) {
                    console.warn(
                      "Error destroying ads manager after fatal error:",
                      destroyError
                    );
                  }
                } else {
                  // For other errors, try to continue without destroying ads manager
                  console.log("Non-fatal ad error, attempting to continue");
                }

                // Resume content playback
                setTimeout(() => {
                  if (playerStateRef.current.shouldPlay) {
                    playThePlayer();
                  }
                }, 50);

                onAdError?.(error);
              }
            );
          });
        } catch (error) {
          console.error("Error setting up player event listeners:", error);
        }
      }, 100); // Wait 100ms for player element to be ready
    },
    [onAdStarted, onAdCompleted, onAdClicked, onAdError]
  );

  const initializePlayer = useCallback(
    async (player: OpenPlayerJS, play?: boolean) => {
      await player.init();
      await player.load();
      playerRef.current = player;

      // Set up ad event listeners if ads are enabled
      if (adUrl) {
        setupAdPlayerEventListeners(player);
      }

      // Dispatch playerLoad event after player is ready
      videoRef.current?.dispatchEvent(new Event("playerLoad"));

      if (play) {
        await player.play().catch((error) => {
          if (error?.name === "NotAllowedError") {
            updatePlayerMutedState(true);
            player
              .play()
              .then(() => {
                // Autoplay started with muted
              })
              .catch((err: any) => {
                console.warn("Could not autoplay video:");
              });
          }
        });
      }

      onOpenPlayerReady?.(player);
    },
    [onOpenPlayerReady, adUrl, setupAdPlayerEventListeners]
  );

  const updatePlayerMutedState = useCallback(
    (muted: boolean) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
        onMutedChange?.(muted);
      }
    },
    [onMutedChange, videoRef]
  );

  const playThePlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    // If ads manager was destroyed due to fatal error, always play main content
    if (playerStateRef.current.isAdErrored) {
      player
        ?.getMedia()
        .play()
        .then(() => {
          console.log("Content resumed after fatal ad error");
        })
        .catch((error) => {
          if (error?.name === "NotAllowedError") {
            updatePlayerMutedState(true);
            player
              ?.getMedia()
              ?.play()
              .catch((err: any) => {
                console.warn("Could not autoplay video:", err);
              });
          }
        });
      return;
    }

    // For normal playback, check if we're currently in an ad or content
    try {
      if (player.isAd()) {
        // Currently playing an ad
        player
          ?.getAd()
          .play()
          .catch((err: any) => {
            console.warn("Could not play ad, falling back to content:", err);
            // If ad play fails, try content instead
            player?.getMedia().play();
          });
      } else {
        // Currently playing content
        player
          ?.getMedia()
          .play()
          .catch((error) => {
            if (error?.name === "NotAllowedError") {
              updatePlayerMutedState(true);
              player
                ?.getMedia()
                ?.play()
                .catch((err: any) => {
                  console.warn("Could not autoplay video:", err);
                });
            }
          });
      }
    } catch (error) {
      // Fallback to content if player state check fails
      console.warn(
        "Error checking player state, falling back to content:",
        error
      );
      player?.getMedia().play();
    }
  }, [updatePlayerMutedState]);

  const pauseThePlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    // If an ad error occurred, just pause the main content
    if (playerStateRef.current.isAdErrored) {
      player?.getMedia().pause();
      return;
    }

    // Pause based on current player state
    try {
      if (player.isAd()) {
        player?.getAd()?.pause(); // Pause ad if playing
      } else {
        player?.getMedia().pause();
      }
    } catch (error) {
      // Fallback to direct pause if specific methods fail
      console.warn("Error pausing player, using fallback:", error);
      player?.getElement().pause();
    }
  }, []);

  // Lazy initialization: Initialize player based on enableLazyLoading prop
  useEffect(() => {
    if (!videoRef.current) return;

    // If player is already initialized, just control play/pause
    if (isPlayerInitialized.current) {
      playerStateRef.current.shouldPlay = play;
      if (play) {
        playThePlayer();
      } else {
        pauseThePlayer();
      }
      return;
    }

    // Conditional initialization based on enableLazyLoading:
    // - If enableLazyLoading is false (default): Initialize immediately on mount
    // - If enableLazyLoading is true: Initialize only when play becomes true
    if (enableLazyLoading && !play) return;

    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: "responsive",
      forceNative: isSafari ? true : !src?.endsWith(".m3u8"), // Safari uses native HLS, others use hls.js
      showLoaderOnInit: false,
      hls: hlsConfigs,
      startTime,
      ads: adUrl
        ? {
            src: adUrl,
            sdkPath: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
          }
        : undefined,
    });

    // Set initial playback speed for the new video
    videoRef.current.playbackRate = playbackSpeed;

    // Mark as initialized before calling initializePlayer
    isPlayerInitialized.current = true;
    playerStateRef.current.shouldPlay = play;

    void initializePlayer(player, play);

    // Reset videoStartFired when player initializes (new video)
    playerStateRef.current.videoStartFired = false;
  }, [
    play,
    src,
    playThePlayer,
    pauseThePlayer,
    enableLazyLoading,
    isSafari,
    playbackSpeed,
    startTime,
    adUrl,
    initializePlayer,
  ]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount or src change
      if (playerRef.current) {
        try {
          // Clean up ads if any
          if (adUrl) {
            const ad = playerRef.current.getAd?.();
            if (ad) {
              const adsManager = ad.getAdsManager?.() as any;
              if (adsManager && typeof adsManager.stop === "function") {
                adsManager.stop();
              }
              if (typeof ad.destroy === "function") {
                ad.destroy();
              }
            }
          }

          // Destroy the player
          if (typeof playerRef.current.destroy === "function") {
            playerRef.current.destroy();
          }
        } catch (error) {
          console.warn("Error cleaning up player:", error);
        }
      }

      playerStateRef.current = {
        firstQuartileFired: false,
        midpointFired: false,
        thirdQuartileFired: false,
        videoWatchedFired: false,
        videoStartFired: false,
        shouldPlay: false,
        isAdErrored: false, // Reset ad error state on cleanup
      };

      // Reset ad tracking
      adInfoRef.current = {
        isPlaying: false,
        currentIndex: 0,
        totalAds: 0,
        ctaInfo: null,
        allCompleted: false,
      };

      changePlayerStateRef(true);

      isPlayerInitialized.current = false;
      playerRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    let startTime: number | null = null;
    const handlePlay = () => {
      startTime = performance.now();
    };

    const handlePlaying = () => {
      if (!playerStateRef.current.videoStartFired) {
        playerStateRef.current.videoStartFired = true;
        const endTime = performance.now();
        onVideoStart?.(
          playerRef.current?.getMedia().duration ?? 0,
          videoElement.currentTime,
          typeof startTime === "number" ? endTime - startTime : 0
        );
      }
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("playing", handlePlaying);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [onVideoStart, src]);

  const changePlayerStateRef = useCallback(
    (isReset: boolean, duration?: number, currentTime?: number) => {
      if (isReset) {
        playerStateRef.current = {
          firstQuartileFired: false,
          midpointFired: false,
          thirdQuartileFired: false,
          videoWatchedFired: false,
          videoStartFired: playerStateRef.current.videoStartFired,
          shouldPlay: playerStateRef.current.shouldPlay,
        };
        return;
      }
      if (duration === undefined || currentTime === undefined) return;
      const firstQuartileTime = duration / 4;
      const midpointTime = duration / 2;
      const thirdQuartileTime = (duration * 3) / 4;
      if (currentTime < 3 && playerStateRef.current.videoWatchedFired) {
        playerStateRef.current.videoWatchedFired = false;
      }
      if (
        currentTime < firstQuartileTime &&
        playerStateRef.current.firstQuartileFired
      ) {
        playerStateRef.current.firstQuartileFired = false;
      }
      if (currentTime < midpointTime && playerStateRef.current.midpointFired) {
        playerStateRef.current.midpointFired = false;
      }
      if (
        currentTime < thirdQuartileTime &&
        playerStateRef.current.thirdQuartileFired
      ) {
        playerStateRef.current.thirdQuartileFired = false;
      }
    },
    [playerStateRef]
  );

  const handleEnded = useCallback(() => {
    changePlayerStateRef(true);
  }, [changePlayerStateRef]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const videlElement = videoRef.current;
      const duration = videoElement.duration;
      if (!videlElement || duration === 0 || !duration || duration === Infinity)
        return;
      const {
        firstQuartileFired,
        midpointFired,
        thirdQuartileFired,
        videoWatchedFired,
      } = playerStateRef.current;

      const { currentTime } = videoElement;

      if (!videoWatchedFired && currentTime >= 3) {
        onVideoWatched?.(duration, currentTime);
        playerStateRef.current.videoWatchedFired = true;
      }

      const firstQuartileTime = duration / 4;
      const midpointTime = duration / 2;
      const thirdQuartileTime = (duration * 3) / 4;

      if (!firstQuartileFired && currentTime >= firstQuartileTime) {
        onVideoFirstQuartile?.(duration, currentTime);
        playerStateRef.current.firstQuartileFired = true;
      }

      if (!midpointFired && currentTime >= midpointTime) {
        onVideoMidpoint?.(duration, currentTime);
        playerStateRef.current.midpointFired = true;
      }

      if (!thirdQuartileFired && currentTime >= thirdQuartileTime) {
        onVideoThirdQuartile?.(duration, currentTime);
        playerStateRef.current.thirdQuartileFired = true;
      }
    };

    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("ended", handleEnded);
      // Clean up the timeupdate event listener
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [
    src,
    onVideoFirstQuartile,
    onVideoMidpoint,
    onVideoThirdQuartile,
    onVideoWatched,
  ]);

  const onVideoSeeked = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      onSeeked?.(event);
      changePlayerStateRef(
        false,
        videoRef.current?.duration,
        videoRef.current?.currentTime
      );
    },
    [playerStateRef, changePlayerStateRef, onSeeked]
  );

  return (
    <video
      id={id}
      className={cn(
        "gencl:h-auto gencl:w-auto gencl:bg-center gencl:bg-no-repeat gencl:object-cover gencl:bg-cover",
        className
      )}
      style={{
        backgroundImage: `url(${poster})`,
        ...style,
      }}
      // poster={poster}
      ref={videoRef}
      preload="none"
      onSeeked={onVideoSeeked}
      src={encodeVideoSourceUrl(src ?? "")}
      playsInline={playsInline}
      loop={loop}
      {...props}
    />
  );
});
