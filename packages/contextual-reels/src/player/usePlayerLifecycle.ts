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
import { useEffect, useRef, type RefObject } from "react";
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
  /**
   * Called when the browser blocks unmuted autoplay (`NotAllowedError`). Lets the
   * parent reset feed volume to 0 so app state matches the now-muted element.
   */
  onAutoplayBlocked?: () => void;
}

function getVideoType(url: string): string {
  return url.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Initialises Vlitejs (with optional IMA plugin + HLS source), wires all
 * analytics event hooks, and tears down cleanly on unmount.
 *
 * @example
 * usePlayerLifecycle({ videoEl, content, isPlay, volume, sendEvent, ... });
 */
export function usePlayerLifecycle({
  videoEl,
  content,
  ad,
  config,
  isPlay,
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
  onAutoplayBlocked,
}: UsePlayerLifecycleOptions): void {
  const currentPlayerRef = useRef<PlayerHandle | null>(null);
  const isPlayerReady = useRef(false);
  // Ref-wrap so the once-on-mount init effect's closure always calls the latest.
  const onAutoplayBlockedRef = useRef(onAutoplayBlocked);
  onAutoplayBlockedRef.current = onAutoplayBlocked;
  const isPlayRef = useRef(isPlay);
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

  // --- volume (one-way: provider → element) ---
  // PlayerProvider is the single source of truth for the audible level. The
  // element is always unmuted (muted=false); silence is simply volume 0. We only
  // ever WRITE the provider's volume onto the element — never read it back — so
  // there is no two-way sync to keep consistent. The mute icon is driven by
  // `volume === 0` in PlayerProvider.
  useEffect(() => {
    volumeRef.current = volume;
    if (videoEl.current) videoEl.current.volume = volume;
  }, [volume, videoEl]);

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
        // Attempt unmuted play (desiredMuted=false). The element stays unmuted and
        // silence comes from volume 0 — see the volume effect above. If the browser
        // blocks unmuted autoplay, tryPlay notifies onAutoplayBlocked (→ provider
        // drops volume to 0) and falls back to a muted retry.
        tryPlay(currentPlayerRef.current, video, false, () => onAutoplayBlockedRef.current?.()).catch((e) => {
          logger.warn("tryPlay failed", e);
        });
      }
      if (video.readyState < 2) {
        const onCanPlay = () => {
          if (currentPlayerRef.current) {
            tryPlay(currentPlayerRef.current, video, false, () => onAutoplayBlockedRef.current?.()).catch(
              () => undefined
            );
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

    // Guards the async HLS import and Vlitejs onReady against a component that
    // unmounts mid-flight. Switching section tabs quickly unmounts the player
    // before `import("hls.js")` resolves; without this the late callback would
    // build a new Hls, attachMedia, and startLoad(-1) on an orphaned element —
    // an audio stream with no owner. Several fast switches stack such orphans,
    // producing the audio-clash. The flag is read after every await boundary.
    let cancelled = false;

    // --- HLS / direct src setup ---
    const setupHlsContent = () => {
      import("hls.js").then(({ default: HlsClass }) => {
        // Prefer HLS.js wherever it is supported so we can pin the lowest quality
        // and gate segment loading. Native HLS (`canPlayType('…mpegurl')`) is only
        // a fallback for browsers without MSE — notably Safari/iOS. We must NOT
        // take the native path on Chromium: Chrome returns "maybe" for the HLS
        // MIME type yet runs its own adaptive bitrate, which ignores our
        // bandwidth-conservation pinning and climbs to the highest rendition.
        if (cancelled || !HlsClass.isSupported()) {
          if (!cancelled) video.src = content;
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
            // Setting `currentLevel` pins the manual level and disables ABR
            // (hls.autoLevelEnabled becomes false as a derived getter), so the
            // player stays on the lowest rendition.
            hls.currentLevel = lowestIdx;
          }
        });

        // Re-check after the manifest/level work: cleanup may have run while this
        // ran. If so, tear this instance down instead of registering it — cleanup
        // already passed the `hlsInstanceRef` null-check and would otherwise leak.
        if (cancelled) {
          hls.destroy();
          return;
        }

        hlsInstanceRef.current = hls;
        // Unconditional startLoad to break Vlitejs onReady deadlock.
        hls.startLoad(-1);
      });
    };

    const startPlayback = (player: PlayerHandle) => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.startLoad(-1);
      }
      // Attempt unmuted play; silence is governed by volume 0, not by muted.
      tryPlay(player, video, false, () => onAutoplayBlockedRef.current?.()).catch((e) => {
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
          // Vlitejs onReady is async; the player may have unmounted while it
          // initialised (fast tab switch). Destroying here prevents an orphaned
          // player that would otherwise call startPlayback and emit audio with no
          // owner — cleanup has already run and left currentPlayerRef null.
          if (cancelled) {
            try {
              player.pause();
              player.destroy?.();
            } catch (error) {
              logger.warn("Error destroying late-ready player:", error);
            }
            return;
          }

          currentPlayerRef.current = player;
          isPlayerReady.current = true;

          // Vlitejs inits muted for autoplay; once playing, leave the element
          // unmuted and rely on volume for silence. The initial volume is 0, so
          // playback stays silent until the user raises it via the provider.
          player.unMute();
          if (videoEl.current) {
            videoEl.current.volume = volumeRef.current;
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
      cancelled = true;
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
          // detachMedia before destroy so the element stops receiving segments
          // immediately; destroy alone can leave a tick of buffered audio playing.
          hlsInstanceRef.current.detachMedia();
          hlsInstanceRef.current.destroy();
        } catch (error) {
          logger.warn("Error cleaning up HLS instance:", error);
        }
        hlsInstanceRef.current = null;
      }

      // Hard-stop the element directly. If Vlitejs never reached onReady, the
      // player handle above is null and nothing else pauses the <video> — a
      // partially-buffered stream would keep its audio. pause() + emptying the
      // source guarantees silence regardless of how far init progressed.
      if (video) {
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch (error) {
          logger.warn("Error stopping video element:", error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run once on mount
  }, []);
}
