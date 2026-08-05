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
// Types come from "hls.js" (the light build ships no .d.ts and its runtime API
// is a strict subset). The runtime dynamic import below uses "hls.js/light" —
// ~34% smaller: it drops alt-audio tracks, subtitles, EME/DRM, and low-latency,
// none of which CXR uses. CXR only needs isSupported(), the buffer-limited
// constructor, loadSource/attachMedia/startLoad/stopLoad/destroy, MANIFEST_PARSED
// and level pinning — all present in the light build.
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
  // `String.split` always returns a non-empty array, so `.pop()` is never
  // undefined and the `?? ""` default is unreachable — kept as a defensive guard.
  /* v8 ignore next */
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
  // True once startLoad(-1) has been issued for the current hls instance. Both
  // the manifest-parsed handler (active slide at mount) and startPlayback
  // (Vlitejs onReady) can independently decide to kick off loading; without this
  // guard both call startLoad(-1) for the same fresh instance and hls.js issues
  // two requests for the first fragment — doubling the initial segment's bytes.
  const hlsLoadStartedRef = useRef(false);
  // Detaches the MANIFEST_PARSED handler; stored as a closure since the hls.js Events
  // enum is only in scope inside the dynamic-import callback, not at the cleanup return.
  const detachHlsManifestHandlerRef = useRef<(() => void) | null>(null);
  // Analytics-hook detachers, called in cleanup before the player is destroyed.
  const detachPlayerEventsRef = useRef<Array<() => void>>([]);

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
  // PlayerProvider is the single source of truth for the audible level; silence
  // is volume 0 and the mute icon is driven by `volume === 0`. We only ever
  // WRITE the provider's volume onto the element — never read it back.
  //
  // Also mirror it onto `.muted`. On most platforms `.volume = 0` alone is
  // already silent, but iOS Safari ignores programmatic `.volume` writes
  // entirely (the element always reports `1` regardless of what's assigned —
  // volume is under physical/hardware control there). Without `.muted` too, a
  // muted slide plays fully audible on iOS the moment autoplay is unmuted-
  // allowed (e.g. once an earlier slide's user gesture unlocked the page) —
  // the icon shows muted (it reads the provider's volume) while the element is
  // actually heard. `.muted` is authoritative everywhere, so setting it
  // alongside volume fixes iOS and is a no-op change in behaviour elsewhere.
  useEffect(() => {
    volumeRef.current = volume;
    if (videoEl.current) {
      videoEl.current.volume = volume;
      videoEl.current.muted = volume === 0;
    }
  }, [volume, videoEl]);

  // --- isPlay changes after ready ---
  useEffect(() => {
    isPlayRef.current = isPlay;

    // Toggle segment loading above the readiness guard: swipe-in can flip isPlay
    // before onReady, and the load must (re)start regardless or the slide sits
    // with no segment fetch.
    if (hlsInstanceRef.current) {
      if (isPlay) {
        hlsInstanceRef.current.startLoad(-1);
        hlsLoadStartedRef.current = true;
      } else {
        hlsInstanceRef.current.stopLoad();
      }
    }

    if (!isPlayerReady.current || !videoEl.current) return;

    const video = videoEl.current;

    if (isPlay) {
      // Reflect the CURRENT mute intent (volume===0), not a hardcoded unmuted
      // attempt — the volume effect above already keeps `.muted` in sync for
      // the steady state, but `tryPlay` also force-applies `.muted` up front
      // (see hlsPlayer.ts), which matters on iOS: `.volume` writes are ignored
      // there, so an unconditional unmuted play() would be genuinely audible
      // even while the provider (and the mute icon) says muted.
      if (currentPlayerRef.current) {
        const desiredMuted = volumeRef.current === 0;
        tryPlay(currentPlayerRef.current, video, desiredMuted, () => onAutoplayBlockedRef.current?.()).catch((e) => {
          logger.warn("tryPlay failed", e);
        });
      }
      if (video.readyState < 2) {
        const onCanPlay = () => {
          if (currentPlayerRef.current) {
            const desiredMuted = volumeRef.current === 0;
            tryPlay(currentPlayerRef.current, video, desiredMuted, () => onAutoplayBlockedRef.current?.()).catch(
              () => undefined
            );
          }
        };
        video.addEventListener("canplay", onCanPlay, { once: true });
        // { once: true } only self-removes AFTER firing. If isPlay flips back or the
        // slide unmounts before `canplay`, the listener lingers and would fire a
        // stale tryPlay on a paused/torn-down element — so remove it in cleanup.
        return () => video.removeEventListener("canplay", onCanPlay);
      }
    } else {
      // HLS stopLoad already handled above, before the readiness guard.
      currentPlayerRef.current?.pause();
      video.pause();
    }
    return undefined;
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
      import("hls.js/light").then(({ default: HlsClass }) => {
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
        // The init effect runs once on mount and `setupHlsContent` resolves a
        // single `import("hls.js")`, so `hlsInstanceRef.current` is always null
        // here — this destroy guard only fires on a re-setup race that the
        // run-once architecture prevents. Kept as a defensive teardown.
        /* v8 ignore next 3 */
        if (hlsInstanceRef.current) {
          hlsInstanceRef.current.destroy();
        }

        // Buffer limits MUST be constructor config — hls.js reads `hls.config.*`
        // per tick, so assigning `hls.maxBufferSize` after construction is a no-op
        // (it sets a stray instance property, not the config the buffer controller
        // reads). maxBufferLength is the binding knob: cap look-ahead to a few
        // seconds so a slide buffers only what's needed, not the whole video —
        // which was pulling ~25 MB per active reel and blowing the HAI budget.
        //
        // maxBufferLength lowered 6→4 and maxBufferSize 2 MB→1 MB: the reel plays
        // in a 100 px-tall banner, so less look-ahead is imperceptible but shaves
        // bytes off the un-interacted HAI window. capLevelToPlayerSize bounds the
        // chosen rendition to the actual player pixels — a defensive ceiling that
        // backs up the explicit lowest-level pin in onManifestParsed (if the pin
        // ever fails to apply, ABR still can't climb past what 320×100 needs).
        const hls = new HlsClass({
          autoStartLoad: false,
          startFragPrefetch: false,
          maxBufferLength: 4,
          maxBufferSize: 1 * 1000 * 1000,
          maxMaxBufferLength: 8,
          capLevelToPlayerSize: true,
        });
        hls.loadSource(content);
        hls.attachMedia(video);

        // Named so cleanup can `.off()` it (destroy() frees it anyway — symmetry).
        const onManifestParsed = (): void => {
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
        };
        hls.on(HlsClass.Events.MANIFEST_PARSED, onManifestParsed);

        // Fatal-error recovery. hls.js delegates fatal errors to the app: without
        // this handler a transient network/media failure stalls the reel forever
        // (spinner, no playback, no recovery). Network → resume loading; media →
        // recover once (a second media fatal means recovery didn't help, so tear
        // down rather than loop); anything else is unrecoverable → destroy.
        let mediaRecoveryAttempted = false;
        const onHlsError = (_event: unknown, data: { fatal?: boolean; type?: string }): void => {
          if (!data.fatal) return;
          if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
            logger.warn("HLS fatal network error — restarting load", data);
            hls.startLoad();
          } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR && !mediaRecoveryAttempted) {
            logger.warn("HLS fatal media error — attempting recovery", data);
            mediaRecoveryAttempted = true;
            hls.recoverMediaError();
          } else {
            logger.error("HLS unrecoverable error — destroying instance", data);
            hls.destroy();
          }
        };
        hls.on(HlsClass.Events.ERROR, onHlsError);

        detachHlsManifestHandlerRef.current = () => {
          hls.off(HlsClass.Events.MANIFEST_PARSED, onManifestParsed);
          hls.off(HlsClass.Events.ERROR, onHlsError);
        };

        // Re-check after the manifest/level work: cleanup may have run while this
        // ran. If so, tear this instance down instead of registering it — cleanup
        // already passed the `hlsInstanceRef` null-check and would otherwise leak.
        // Everything from the `cancelled` check above through here runs
        // synchronously (no await boundary), so `cancelled` cannot flip in
        // between — this re-check only guards a future refactor that adds an
        // await before this point. Kept as a defensive teardown.
        /* v8 ignore next 4 */
        if (cancelled) {
          hls.destroy();
          return;
        }

        hlsInstanceRef.current = hls;
        // Only the active slide eager-loads at mount. Every mounted slide used to
        // `startLoad(-1)` here to force Vlitejs `onReady`, then inactive slides
        // were stopped again right after — but the initial segments were already
        // in flight, so N mounted slides each pulled their first fragments into
        // the HAI budget (measured: ~6 videos' worth). An inactive slide instead
        // defers its load until it becomes active: the `isPlay` effect calls
        // `startLoad(-1)` on activation (above the readiness guard), which also
        // lets its deferred `onReady` fire. The active slide still loads instantly.
        if (isPlayRef.current) {
          hls.startLoad(-1);
          hlsLoadStartedRef.current = true;
        }
      });
    };

    const startPlayback = (player: PlayerHandle) => {
      // Guard against a second startLoad(-1): the manifest-parsed handler above
      // already starts loading for an active slide at mount, and Vlitejs onReady
      // resolves independently (separate async init) — without this check both
      // paths fire startLoad(-1) for the same fresh instance, and hls.js issues
      // two requests for the first fragment (measured: segment 0 fetched twice
      // every run, ~500 KB of pure waste toward the HAI budget).
      // Structurally, this body cannot execute under the current effect
      // architecture: `hlsInstanceRef.current` and `hlsLoadStartedRef.current`
      // are always populated together, synchronously, inside the manifest-parsed
      // `.then()` above (no await boundary between them) — and `startPlayback`
      // is itself only reachable from onReady when `isPlayRef.current` is true,
      // which is the same condition that `.then()` callback already checked. Kept
      // as a defensive guard in case a future refactor decouples the two writes.
      /* v8 ignore next 4 */
      if (hlsInstanceRef.current && !hlsLoadStartedRef.current) {
        hlsInstanceRef.current.startLoad(-1);
        hlsLoadStartedRef.current = true;
      }
      // Reflect the current mute intent — see the isPlay effect's comment for
      // why this can't be hardcoded to an unmuted attempt (iOS ignores
      // `.volume` writes, so an unconditional unmuted play() is genuinely
      // audible there even while the provider says muted).
      tryPlay(player, video, volumeRef.current === 0, () => onAutoplayBlockedRef.current?.()).catch((e) => {
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
          // Never preload the creative media. IMA requests the VAST on
          // player-ready regardless, but preloading the (heavy) media file pulls
          // it into the *un-interacted* frame — and a 30 s audio spot is ~1.2 MB,
          // enough on its own to breach Chrome's 4 MB Heavy Ad Intervention limit
          // for the active reel. HAI stops applying once the user interacts, so
          // fetching the creative lazily at ad-play time (post-interaction) keeps
          // it out of the budget entirely. The tradeoff is no prefetch head-start;
          // `adTimeout` still bounds the play-time fetch, degrading to no-fill
          // rather than a HAI kill of the whole ad frame if it is slow.
          adsRenderingSettings: { enablePreloading: false },
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

          // Wire analytics hooks; keep their detachers for cleanup.
          detachPlayerEventsRef.current = [quartile.attachToPlayer(player), playStarted.attachToPlayer(player)];
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

      // Detach analytics listeners before destroy so none linger on a reused <video>.
      for (const detach of detachPlayerEventsRef.current) {
        try {
          detach();
        } catch (error) {
          logger.warn("Error detaching player event listeners:", error);
        }
      }
      detachPlayerEventsRef.current = [];

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
          detachHlsManifestHandlerRef.current?.();
          // detachMedia before destroy so the element stops receiving segments
          // immediately; destroy alone can leave a tick of buffered audio playing.
          hlsInstanceRef.current.detachMedia();
          hlsInstanceRef.current.destroy();
        } catch (error) {
          logger.warn("Error cleaning up HLS instance:", error);
        }
        hlsInstanceRef.current = null;
        detachHlsManifestHandlerRef.current = null;
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
