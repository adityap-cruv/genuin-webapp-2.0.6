/**
 * Orchestrates Vlitejs initialisation, IMA plugin registration, HLS coordination,
 * and cleanup for a single `<video>` element.
 *
 * This hook replaces the three `useEffect` blocks in `LightPlayer.jsx` and
 * delegates event-specific logic to the smaller focused hooks:
 *   - `useHlsSource` — HLS.js lifecycle
 *   - `useAutoplayFallback` — NotAllowedError retry
 *   - `useQuartileEvents` — quartile/completion events
 *   - `usePlayStartedEvents` — play/started/interrupted events
 *   - `useImaPlugin` — IMA ad lifecycle events
 */
import type Hls from "hls.js";
import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- vlitejs ships no official types
import Vlitejs from "vlitejs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- vlitejs IMA plugin ships no official types
import VlitejsIma from "vlitejs/plugins/ima.js";

import { EVENT } from "@cxr/analytics/analytics";
import { useAutoplayFallback, useImaPlugin } from "@cxr/player/hlsPlayer";
import { usePlayStartedEvents, useQuartileEvents } from "@cxr/player/playerEvents";
import type { PlayerDims, PlayerHandle } from "@cxr/player/types";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/player");

export interface UsePlayerLifecycleOptions {
  videoEl: RefObject<HTMLVideoElement | null>;
  content: string;
  ad?: string;
  config?: { auto_swipe?: boolean };
  isPlay: boolean;
  isMuted: boolean;
  /** Audible volume 0..1. Applied to the element while it stays unmuted. */
  volume: number;
  tagDetails: Record<string, unknown>;
  videoDetails: Record<string, unknown>;
  dims?: PlayerDims;
  supportAds?: boolean;
  sendEvent: (name: string, payload?: Record<string, unknown>) => void;
  getLastUserPlayAt: () => number;
  onTimeUpdate?: (currentTime: number, duration: number, id: number) => void;
  onEnded?: () => void;
  onReady?: (player: PlayerHandle) => void;
  itemId: number;
  isVideoItem: boolean;
  /** Set to true before programmatic volume changes to suppress the volumechange listener. */
  suppressVolumeChangeRef?: MutableRefObject<boolean>;
}

function getVideoType(url: string): string {
  return url.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Initialises Vlitejs (with optional IMA plugin + HLS source), wires all
 * analytics event hooks, and tears down cleanly on unmount.
 *
 * @example
 * usePlayerLifecycle({ videoEl, content, isPlay, isMuted, sendEvent, ... });
 */
export function usePlayerLifecycle({
  videoEl,
  content,
  ad,
  config,
  isPlay,
  isMuted,
  volume,
  tagDetails,
  videoDetails,
  dims,
  supportAds,
  sendEvent,
  getLastUserPlayAt,
  onTimeUpdate,
  onEnded,
  onReady: onReadyProp,
  itemId,
  isVideoItem,
  suppressVolumeChangeRef,
}: UsePlayerLifecycleOptions): void {
  const currentPlayerRef = useRef<PlayerHandle | null>(null);
  const isPlayerReady = useRef(false);
  const isPlayRef = useRef(isPlay);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const hlsInstanceRef = useRef<Hls | null>(null);

  const { tryPlay } = useAutoplayFallback({ videoEl, player: currentPlayerRef.current });

  const quartile = useQuartileEvents({
    tagDetails,
    videoDetails,
    dims,
    sendEvent,
    onTimeUpdate,
    itemId,
    onEnded,
    isVideoItem,
  });

  const playStarted = usePlayStartedEvents({
    tagDetails,
    videoDetails,
    dims,
    sendEvent,
    getLastUserPlayAt,
    onPlayReset: () => {
      // getCurrentTime call is made inside usePlayStartedEvents; forward to quartile reset
      if (currentPlayerRef.current) {
        currentPlayerRef.current
          .getCurrentTime()
          .then((ct) => quartile.resetForPlay(ct))
          .catch(() => quartile.resetForPlay(undefined));
      }
    },
  });

  const imaPlugin = useImaPlugin({
    tagDetails,
    videoDetails,
    dims,
    sendEvent,
    onEnded,
  });

  // Keep isPlayRef in sync for the onReady closure.
  useEffect(() => {
    isPlayRef.current = isPlay;
  });

  // --- volume / mute ---
  // The element stays unmuted (muted=false) at all times; silence comes from a
  // volume of 0. This keeps the "unmuted but silent" initial state and lets the
  // user raise the level (e.g. to DEFAULT_UNMUTE_VOLUME) without a muted→unmuted
  // transition. The mute icon is driven by `volume === 0` in PlayerProvider.
  useEffect(() => {
    isMutedRef.current = isMuted;
    volumeRef.current = volume;
    const player = currentPlayerRef.current;
    if (!player || !videoEl.current) return;
    if (suppressVolumeChangeRef) suppressVolumeChangeRef.current = true;
    videoEl.current.volume = volume;
    if (suppressVolumeChangeRef) suppressVolumeChangeRef.current = false;
    player.unMute();
  }, [isMuted, volume, videoEl]);

  // --- isPlay changes after ready ---
  useEffect(() => {
    isPlayRef.current = isPlay;

    if (!isPlayerReady.current || !videoEl.current) return;

    const video = videoEl.current;

    if (isPlay) {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.startLoad(-1);
      }
      if (currentPlayerRef.current) {
        tryPlay(currentPlayerRef.current, video, isMutedRef.current).catch((e) => {
          logger.warn("tryPlay failed", e);
        });
      }
      if (video.readyState < 2) {
        const onCanPlay = () => {
          if (currentPlayerRef.current) {
            tryPlay(currentPlayerRef.current, video, isMutedRef.current).catch(() => undefined);
          }
        };
        video.addEventListener("canplay", onCanPlay, { once: true });
      }
    } else {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.stopLoad();
      }
      currentPlayerRef.current?.pause();
      video.pause();
    }
  }, [isPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- initialisation (run once on mount) ---
  useEffect(() => {
    const video = videoEl.current;
    if (!video) return;

    // --- HLS / direct src setup ---
    const setupHlsContent = () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari/iOS) — no library needed.
        video.src = content;
        return;
      }
      import("hls.js").then(({ default: HlsClass }) => {
        if (!HlsClass.isSupported()) {
          video.src = content;
          return;
        }
        if (hlsInstanceRef.current) {
          hlsInstanceRef.current.destroy();
        }

        const hls = new HlsClass({ autoStartLoad: false, startFragPrefetch: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime config property
        (hls as any).maxBufferSize = 1 * 1000 * 100;
        hls.loadSource(content);
        hls.attachMedia(video);

        hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hls.levels
          const levels: Array<{ bitrate: number }> = (hls as any).levels ?? [];
          if (levels.length > 0) {
            const lowestIdx = levels.reduce(
              (lowestI, level, idx, arr) =>
                level.bitrate < (arr[lowestI] as { bitrate: number }).bitrate ? idx : lowestI,
              0
            );
            hls.currentLevel = lowestIdx;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hls.autoLevelEnabled
            (hls as any).autoLevelEnabled = false;
          }
        });

        hlsInstanceRef.current = hls;
        // Unconditional startLoad to break Vlitejs onReady deadlock.
        hls.startLoad(-1);
      });
    };

    const startPlayback = (player: PlayerHandle) => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.startLoad(-1);
      }
      tryPlay(player, video, isMutedRef.current).catch((e) => {
        logger.warn("startPlayback failed", e);
      });
    };

    // --- IMA plugin registration ---
    let plugins: string[] = [];
    if (ad) {
      try {
        plugins = ["ima"];
        Vlitejs.registerPlugin("ima", VlitejsIma, {
          adTagUrl: ad,
          adTimeout: 2000,
          updateImaSettings: (imaSettings: { setLocale(l: string): void; setAutoPlayAdBreaks(b: boolean): void }) => {
            imaSettings.setLocale("en");
            imaSettings.setAutoPlayAdBreaks(true);
          },
          adsRenderingSettings: { enablePreloading: true },
          debug: false,
        });
      } catch (error) {
        logger.error("Error registering IMA plugin:", error);
      }
    }

    // --- Content source ---
    const videoType = getVideoType(content);
    if (videoType === "m3u8") {
      setupHlsContent();
    } else {
      video.src = content;
    }

    // --- Vlitejs instantiation ---
    try {
      new Vlitejs(video, {
        options: {
          controls: false,
          autoplay: false,
          playPause: true,
          progressBar: true,
          time: true,
          volume: false,
          fullscreen: false,
          bigPlay: false,
          playsinline: true,
          loop: config?.auto_swipe === false,
          muted: true,
        },
        plugins,
        onReady: (player: PlayerHandle) => {
          currentPlayerRef.current = player;
          isPlayerReady.current = true;

          // Vlitejs inits muted for autoplay; once playing, leave the element
          // unmuted and rely on volume for silence. The initial volume is 0, so
          // playback stays silent until the user raises it.
          player.unMute();
          if (videoEl.current) {
            if (suppressVolumeChangeRef) suppressVolumeChangeRef.current = true;
            videoEl.current.volume = volumeRef.current;
            if (suppressVolumeChangeRef) suppressVolumeChangeRef.current = false;
          }

          // Notify parent.
          onReadyProp?.(player);

          // Wire analytics hooks.
          quartile.attachToPlayer(player);
          playStarted.attachToPlayer(player);
          if (ad) {
            imaPlugin.attachToPlayer(player);
          }

          // Emit video_loaded for video items.
          if (isVideoItem) {
            sendEvent(EVENT.VIDEO_LOADED);
          }

          // Start or gate playback now that both HLS and Vlitejs are ready.
          if (!supportAds) {
            if (isPlayRef.current) {
              startPlayback(player);
            } else if (hlsInstanceRef.current) {
              hlsInstanceRef.current.stopLoad();
            }
          }
        },
      });
    } catch (error) {
      logger.error("Error initializing player:", error);
    }

    // --- cleanup ---
    return () => {
      isPlayerReady.current = false;

      if (currentPlayerRef.current) {
        try {
          currentPlayerRef.current.pause();
          currentPlayerRef.current.destroy?.();
        } catch (error) {
          logger.warn("Error cleaning up player:", error);
        }
        currentPlayerRef.current = null;
      }

      if (hlsInstanceRef.current) {
        try {
          hlsInstanceRef.current.destroy();
        } catch (error) {
          logger.warn("Error cleaning up HLS instance:", error);
        }
        hlsInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run once on mount
  }, []);
}
