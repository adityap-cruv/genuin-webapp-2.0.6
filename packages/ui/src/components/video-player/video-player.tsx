import OpenPlayerJS from "openplayerjs";
import type { ComponentProps } from "react";
import { memo, useCallback, useEffect, useRef } from "react";

import { cn } from "@genuin/ui/lib/utils";

const hlsConfigs = {
  // debug: true,
  /**
   * Let the player decide the best quality level dynamically.
   */
  startLevel: 1,
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
  // /**
  //  * Buffer settings tuned for 1-second fragments.
  //  */
  // maxBufferLength: 6, // Buffer up to 6 seconds (can be adjusted based on use case).
  // maxBufferSize: 20 * 1000 * 1000, // Maximum buffer size in bytes (e.g., 20MB).
  // backBufferLength: 15, // Retain up to 15 seconds of back-buffer for seamless rewinding.
  /**
   * Adjust buffer settings for 2-second fragments.
   */
  maxBufferLength: 10, // Buffer up to 6 fragments (12 seconds).
  maxBufferSize: 40 * 1000 * 1000, // Maximum buffer size in bytes (e.g., 40MB).
  backBufferLength: 30, // Retain 30 seconds for seamless rewind.
  /**
   * Optimize for quicker fragment loading and adaptation.
   */
  fragLoadingTimeOut: 10000, // Timeout in milliseconds for loading fragments.
  startFragPrefetch: true, // Prefetch the next fragment to minimize stutters.
  /**
   * Ensure codec compatibility for adaptive VP9 playback.
   */
  overrideCodec: (codec: string) => codec.includes("vp09"),
  /**
   * Optimize bitrate switching by limiting to player size.
   */
  capLevelToPlayerSize: true,
  /**
   * Handle live playback smoothly for low-latency streams.
   */
  liveSyncDuration: 2.5, // Keep live playback latency low.
  liveMaxLatencyDuration: 6, // Maximum latency allowed for live streams.
  /**
   * Fallback handling for errors during playback.
   */
  // recoverDecodingError: true, // Recover from decoding errors dynamically.
  // recoverFragLoadError: true, // Attempt to reload fragments on failure.
};

export type PlayerProps = ComponentProps<"video"> & {
  volume?: number;
  playbackSpeed?: number;
  play?: boolean;
  onOpenPlayerReady?: (player: OpenPlayerJS) => void;
  onPlayerLoad?: (player: OpenPlayerJS | null) => void; // Add custom event prop
  onVideoFirstQuartile?: () => void;
  onVideoMidpoint?: () => void;
  onVideoThirdQuartile?: () => void;
  onVideoWatched?: () => void;
  onVideoStart?: () => void; // Add onVideoStart prop
};

type VideoPlayerStateRef = {
  firstQuartileFired: boolean;
  midpointFired: boolean;
  thirdQuartileFired: boolean;
  videoWatchedFired: boolean;
};

export const VideoPlayer = memo(function VideoPlayer({
  src,
  poster,
  className,
  style,
  onOpenPlayerReady,
  onPlayerLoad, // Destructure new prop
  playsInline = true,
  volume = 100,
  playbackSpeed = 1,
  play = true,
  loop = false, // loop prop is now destructured
  onVideoFirstQuartile,
  onVideoMidpoint,
  onVideoThirdQuartile,
  onVideoWatched,
  onVideoStart, // Destructure onVideoStart prop
  ...props
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<OpenPlayerJS | null>(null);
  const playRef = useRef(play);
  const videoStartRef = useRef(false);

  const playerStateRef = useRef<
    VideoPlayerStateRef & { videoStartFired: boolean }
  >({
    firstQuartileFired: false,
    midpointFired: false,
    thirdQuartileFired: false,
    videoWatchedFired: false,
    videoStartFired: false,
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

  const initializePlayer = useCallback(
    async (player: OpenPlayerJS, play?: boolean) => {
      await player.init();
      await player.load();
      playerRef.current = player;
      // Dispatch playerLoad event after player is ready
      videoRef.current?.dispatchEvent(new Event("playerLoad"));
      if (play) {
        await player.play().catch((error) => {
          console.log("error in player", error);
        });
      }
      onOpenPlayerReady?.(player);
    },

    [onOpenPlayerReady]
  );

  useEffect(() => {
    const player = playerRef.current;
    playRef.current = play;
    if (play) {
      player?.play();
    } else {
      player?.pause();
    }
  }, [play]);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: "responsive",
      forceNative: true,
      showLoaderOnInit: true,
      hls: hlsConfigs,
    });

    // if (videoRef.current) {
    //   videoRef.current.load();
    // }

    // Set initial playback speed for the new video
    videoRef.current.playbackRate = playbackSpeed;

    void initializePlayer(player, play);

    return () => {
      playerStateRef.current = {
        firstQuartileFired: false,
        midpointFired: false,
        thirdQuartileFired: false,
        videoWatchedFired: false,
        videoStartFired: false,
      };
    };
  }, [src]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      if (!playerStateRef.current.videoStartFired) {
        playerStateRef.current.videoStartFired = true;
        onVideoStart?.();
      }
    };

    const handleEnded = () => {
      playerStateRef.current.videoStartFired = false;
      playerStateRef.current.firstQuartileFired = false;
      playerStateRef.current.midpointFired = false;
      playerStateRef.current.thirdQuartileFired = false;
      playerStateRef.current.videoWatchedFired = false;
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [onVideoStart]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      playerStateRef.current.firstQuartileFired = false;
      playerStateRef.current.midpointFired = false;
      playerStateRef.current.thirdQuartileFired = false;
      playerStateRef.current.videoWatchedFired = false;
    };

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
        onVideoWatched?.();
        playerStateRef.current.videoWatchedFired = true;
      }

      const firstQuartileTime = duration / 4;
      const midpointTime = duration / 2;
      const thirdQuartileTime = (duration * 3) / 4;

      if (!firstQuartileFired && currentTime >= firstQuartileTime) {
        onVideoFirstQuartile?.();
        playerStateRef.current.firstQuartileFired = true;
      }

      if (!midpointFired && currentTime >= midpointTime) {
        onVideoMidpoint?.();
        playerStateRef.current.midpointFired = true;
      }

      if (!thirdQuartileFired && currentTime >= thirdQuartileTime) {
        onVideoThirdQuartile?.();
        playerStateRef.current.thirdQuartileFired = true;
      }
    };

    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [
    src,
    onVideoFirstQuartile,
    onVideoMidpoint,
    onVideoThirdQuartile,
    onVideoWatched,
  ]);

  return (
    <video
      className={cn(
        "gencl:h-full gencl:w-full gencl:bg-cover gencl:bg-center gencl:bg-no-repeat gencl:object-cover",
        className
      )}
      style={{ backgroundImage: `url(${poster})`, ...style }}
      poster={poster}
      ref={videoRef}
      src={src}
      playsInline={playsInline}
      loop={loop}
      {...props}
    />
  );
});
