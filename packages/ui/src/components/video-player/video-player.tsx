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
  lazy,
  Suspense,
} from "react";

import { cn, encodeVideoSourceUrl } from "@genuin/ui/lib/utils";
import { useBrowserDetect } from "@genuin/ui/hooks";
import { Loader } from "@genuin/ui/loader";
import type {
  AdDataType,
  VideoPlayerStateRef,
} from "./ad-controls/use-ad-player";
import { AdControls } from "./ad-controls";

// Lazy load AdControls component to reduce initial bundle size
// const AdControls = lazy(() =>
//   import("./ad-controls/index.js").then((module) => ({
//     default: module.AdControls,
//   })),
// );

const SAMPLE_AD_TAGS = {
  SINGLE_REDIRECT_LINEAR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirectlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_REDIRECT_ERROR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_REDIRECT_BROKEN:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&nofb=1&correlator=",
  SINGLE_VERTICAL_INLINE:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_vertical_ad_samples&sz=360x640&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_VPAID_LINEAR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinearvpaid2js&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_VPAID_NON_LINEAR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dnonlinearvpaid2js&ciu_szs=728x90%2C300x250&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  VMAP_PRE_ROLL:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=",
  VMAP_PRE_ROLL_BUMPER:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=",
  MID_ROLE_WITH_2_SKIPPABLE:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_skip_ad_samples&sz=640x480&cust_params=sample_ar%3Dmidskiponly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  ALL_SINGLES:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  STANDARD_POD_5_WITH_10_SEC:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostlongpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  ALL_WITH_ALL_BUMPERS:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  POST_ROLL_ONLY:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=",
  SKIPPABLE_INLINE:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
} as const;

// Lazy load AdControls component to reduce initial bundle size
// const AdControls = lazy(() =>
//   import("./ad-controls/ad-controls").then((module) => ({
//     default: module.AdControls,
//   }))
// );

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
  muted?: boolean; // Mute state for video and ads
  playbackSpeed?: number;
  play?: boolean;
  adUrl?: string; // URL for video ads
  startTime?: number;
  enableLazyLoading?: boolean; // Enable lazy loading optimization (default: false)
  isInExpandView?: boolean;
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
  onAdPause?: (adData: AdDataType) => void; // Callback when ad is paused
  onAllAdsCompleted?: () => void; // Callback when all ads are completed
  onVideoStart?: (
    duration: number,
    currentTime: number,
    latency: number,
  ) => void; // Add onVideoStart prop
  onMutedChange?: (muted: boolean) => void;
  onVideoLoadStart?: (isPlaying: boolean) => void; // Callback when video loading starts
  onVideoLoadEnd?: (isPlaying: boolean) => void; // Callback when video loading ends
  onEnded?: (obje: { target: HTMLVideoElement | null }) => void; // Callback when video ends
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
  muted,
  playbackSpeed = 1,
  play = true,
  loop = false, // loop prop is now destructured
  adUrl,
  enableLazyLoading = false, // Default to false for backward compatibility
  isInExpandView,
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
  onAdPause,
  onAllAdsCompleted,
  onSeeked,
  onMutedChange,
  onVideoLoadStart,
  onVideoLoadEnd,
  onEnded,
  ...props
}: PlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => internalVideoRef.current as HTMLVideoElement, [
    internalVideoRef.current,
  ]);
  // adUrl = undefined;
  const videoRef = internalVideoRef;
  const playerRef = useRef<OpenPlayerJS | null>(null);
  const isPlayerInitialized = useRef(false); // Track if player has been initialized
  const [isLoading, setIsLoading] = useState(false);
  const [isPosterVisible, setIsPosterVisible] = useState(true);
  // const [allAdsCompleted, setAllAdsCompleted] = useState(adUrl ? false : true);
  const setupAdEventListenersRef = useRef<
    ((player: OpenPlayerJS) => void) | null
  >(null);

  const { isSafari } = useBrowserDetect();

  const playerStateRef = useRef<VideoPlayerStateRef>({
    shouldPlay: play,
    firstQuartileFired: false,
    midpointFired: false,
    thirdQuartileFired: false,
    videoWatchedFired: false,
    videoStartFired: false,
    isAdErrored: false,
    // Flag to track if all ads have completed, if adUrl is provided
    allAdsCompleted: adUrl ? false : true,
    videoCompleted: false,
  });

  // Centralized loading state handler that triggers callbacks
  const updateLoadingState = useCallback(
    (loading: boolean, isPlaying: boolean) => {
      setIsLoading((prevLoading) => {
        // Only trigger callbacks when state actually changes
        if (prevLoading !== loading) {
          if (loading) {
            onVideoLoadStart?.(isPlaying);
          } else {
            onVideoLoadEnd?.(isPlaying);
          }
        }
        return loading;
      });
    },
    [onVideoLoadStart, onVideoLoadEnd],
  );

  useEffect(() => {
    if (typeof volume === "undefined") return;
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (typeof muted === "undefined") return;
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

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

  const initializePlayer = useCallback(
    async (player: OpenPlayerJS, play?: boolean) => {
      await player.init();
      await player.load();

      playerRef.current = player;

      // Set playback speed and volume after player is initialized
      const media = player.getMedia();
      if (media) {
        if (playbackSpeed) {
          media.playbackRate = playbackSpeed;
        }
      }

      // Set up ad event listeners if ads are enabled
      if (adUrl && setupAdEventListenersRef.current) {
        setupAdEventListenersRef.current(player);
      }

      // Dispatch playerLoad event after player is ready
      videoRef.current?.dispatchEvent(new Event("playerLoad"));

      if (play) {
        // Attempt to autoplay immediately, handling ads and content
        try {
          if (player.isAd()) {
            await player.getAd().play();
          } else {
            await player.getMedia().play();
          }
        } catch (error) {
          if ((error as any)?.name !== "NotAllowedError") {
            updatePlayerMutedState(true);
          }
          console.warn("Autoplay failed on initialization:", { error });
          await player.play();
        }
      }

      onOpenPlayerReady?.(player);
    },
    [onOpenPlayerReady, adUrl, playbackSpeed],
  );

  const updatePlayerMutedState = useCallback(
    (muted: boolean) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
        onMutedChange?.(muted);
      }
    },
    [onMutedChange],
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
        error,
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

  useEffect(() => {
    return () => {
      playerStateRef.current = {
        firstQuartileFired: false,
        midpointFired: false,
        thirdQuartileFired: false,
        videoWatchedFired: false,
        videoStartFired: false,
        shouldPlay: false,
        isAdErrored: false, // Reset ad error state on cleanup
      };

      changePlayerStateRef(true);

      setIsPosterVisible(true);
      isPlayerInitialized.current = false;
      playerRef.current = null;
    };
  }, [src]);

  // Lazy initialization: Initialize player based on enableLazyLoading prop
  useEffect(() => {
    if (!videoRef.current) return;

    // If player is already initialized, just control play/pause
    if (isPlayerInitialized.current) {
      playerStateRef.current.shouldPlay = play;
      if (play) {
        if (!playerRef.current?.getMedia().loaded) {
          updateLoadingState(true, true);
        }
        playThePlayer();
      } else {
        updateLoadingState(false, false);
        pauseThePlayer();
      }
      return;
    }

    // Conditional initialization based on enableLazyLoading:
    // - If enableLazyLoading is false (default): Initialize immediately on mount
    // - If enableLazyLoading is true: Initialize only when play becomes true
    if (enableLazyLoading && !play) return;

    // OpenPlayerJS is patched to disable IMA's native UI; no runtime prototype patching required.

    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: "responsive",
      forceNative: isSafari ? true : !src?.endsWith(".m3u8"), // Safari uses native HLS, others use hls.js
      showLoaderOnInit: false,
      hls: hlsConfigs,
      startTime,
      startVolume: volume / 100,
      ads: adUrl
        ? {
            src: adUrl,
            // debug: true,
            // sdkPath: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
            enablePreloading: false,
            customClick: isInExpandView
              ? {
                  enabled: true,
                  label: "Learn More",
                }
              : undefined,
          }
        : undefined,
    });

    // Mark as initialized before calling initializePlayer
    isPlayerInitialized.current = true;
    playerStateRef.current.shouldPlay = play;

    // Set loading state if play is requested during initialization
    if (play) {
      updateLoadingState(true, true);
    }

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
    updateLoadingState,
  ]);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    const handleMuteAndPlay = () => {
      updatePlayerMutedState(true);
      playThePlayer();
    };

    videoElement.addEventListener("muteAndPlay", handleMuteAndPlay);

    return () => {
      videoElement.removeEventListener("muteAndPlay", handleMuteAndPlay);
    };
  }, [updatePlayerMutedState, playThePlayer]);

  // A function to check and call onEnded if both ads and video are completed
  const tryCallingEnd = useCallback(() => {
    const allAdsCompleted = playerStateRef.current.allAdsCompleted;
    const videoCompleted = playerStateRef.current.videoCompleted;
    console.log("tryCallingEnd: ", {
      allAdsCompleted,
      videoCompleted,
    });

    // only call onEnded if both ads and video are completed
    if (allAdsCompleted && videoCompleted) {
      if (adUrl) {
        playerRef.current?.loadAd(adUrl).then((e) => {
          // console.log("Ad reloaded after video ended");
        });
        playerStateRef.current.allAdsCompleted = false;
      }
      playerStateRef.current.videoCompleted = false;
      if (videoRef.current) videoRef.current.currentTime = 0;
      onEnded?.({ target: videoRef.current });
      changePlayerStateRef(true);
    }
  }, [onEnded]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    let startTime: number = -1;
    const handlePlay = () => {
      startTime = performance.now();
    };

    const handlePlaying = () => {
      // Clear loading state when video actually starts playing
      updateLoadingState(false, true);
      setIsPosterVisible(false);

      // Check if shouldPlay is false and pause if needed
      if (!playerStateRef.current.shouldPlay) {
        const player = playerRef.current;
        if (player) {
          try {
            pauseThePlayer();
          } catch (pauseErr) {
            console.warn("Error pausing video:", pauseErr);
          }
        }
        return;
      }

      if (!playerStateRef.current.videoStartFired) {
        playerStateRef.current.videoStartFired = true;
        const endTime = performance.now();
        const latency: number = endTime - startTime;
        onVideoStart?.(
          playerRef.current?.getMedia().duration ?? 0,
          videoElement.currentTime,
          typeof startTime === "number" && startTime !== -1
            ? Math.floor(latency)
            : 0,
        );
      }
    };

    const handleAllAdsCompleted = () => {
      playerStateRef.current.allAdsCompleted = true;
      onAllAdsCompleted?.();
      tryCallingEnd();
    };

    const handleEnded = (e: any) => {
      playerStateRef.current.videoCompleted = true;
      tryCallingEnd();
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("playing", handlePlaying);
    // Added listener for all ads completed
    videoElement.addEventListener("adsallAdsCompleted", handleAllAdsCompleted);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener(
        "adsallAdsCompleted",
        handleAllAdsCompleted,
      );
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [onVideoStart, src, updateLoadingState, pauseThePlayer, tryCallingEnd]);

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
          allAdsCompleted: adUrl ? false : true,
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
    [playerStateRef],
  );

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

    // videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      // videoElement.removeEventListener("ended", handleEnded);
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
        videoRef.current?.currentTime,
      );
    },
    [playerStateRef, changePlayerStateRef, onSeeked],
  );

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full">
      <video
        id={id}
        className={cn(
          "gencl:h-auto gencl:w-auto gencl:bg-center gencl:bg-no-repeat gencl:object-cover",
          className,
        )}
        style={style}
        // poster={poster}
        ref={videoRef}
        loop={loop}
        playsInline={playsInline}
        preload="none"
        onSeeked={onVideoSeeked}
        src={encodeVideoSourceUrl(src ?? "")}
        // onEnded={handleEnded}
        {...props}
      />
      {/**
       * This dynamic poster implementation allows us to lazy load poster in whereas vidoe element's poster doesn't allow us to do that.
       */}
      {poster && isPosterVisible && (
        <VideoPoster src={poster} className={className} />
      )}
      {isLoading && (
        <div
          role="status"
          aria-label="Loading video"
          className="gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center gencl:pointer-events-none"
        >
          <div className="gencl:rounded-full gencl:bg-black/40 gencl:p-3 gencl:backdrop-blur-sm">
            <Loader size="md" aria-hidden="true" />
          </div>
        </div>
      )}
      {adUrl && (
        <AdControls
          player={playerRef.current}
          adUrl={adUrl}
          muted={muted}
          volume={volume}
          playerStateRef={playerStateRef}
          updateLoadingState={updateLoadingState}
          isInExpandView={isInExpandView}
          onSetupReady={(fn) => {
            setupAdEventListenersRef.current = fn;
          }}
          onAdStarted={onAdStarted}
          onAdCompleted={onAdCompleted}
          onAdError={onAdError}
          onAdClicked={onAdClicked}
          onAdSkipped={onAdSkipped}
          onAdPause={onAdPause}
          playThePlayer={playThePlayer}
        />
      )}
    </div>
  );
});

type VideoPosterProps = {
  src: string;
  className?: string;
};

export const VideoPoster = memo(function VideoPoster({
  src,
  className,
}: VideoPosterProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <img
      src={src}
      loading="lazy"
      className={cn(
        "gencl:absolute gencl:inset-0 gencl:h-full gencl:w-full gencl:object-cover gencl:pointer-events-none",
        className,
      )}
      style={{
        // To manage blink in safari I have added this transform properties.
        transform: "translate3d(0, 0, 0)",
        WebkitTransform: "translate3d(0, 0, 0)",
        // backfaceVisibility: "hidden",
      }}
      onError={() => setVisible(false)}
    />
  );
});
