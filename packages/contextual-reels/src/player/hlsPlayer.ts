/**
 * Player helper hooks — consolidated from:
 *   player/useAutoplayFallback.ts
 *   player/useImaPlugin.ts
 *
 * Note: the HLS.js lifecycle lives inline in `usePlayerLifecycle.ts`; the former
 * `useHlsSource` hook here was an unused duplicate and has been removed.
 */
import type { RefObject } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import type { PlayerDims, PlayerHandle } from "@cxr/player/types";
import { createLogger } from "@cxr/utils/logger";

// ─── useAutoplayFallback ──────────────────────────────────────────────────────

const _logger = createLogger("cxr/player");

/** Options for `useAutoplayFallback`. */
export interface UseAutoplayFallbackOptions {
  videoEl: RefObject<HTMLVideoElement | null>;
  player: PlayerHandle | null;
}

/** Result of `useAutoplayFallback`. */
export interface UseAutoplayFallbackResult {
  /**
   * Attempts to start playback via both the Vlitejs player handle and the
   * native `<video>` element. Retries with mute on `NotAllowedError`.
   *
   * @param player - The Vlitejs player handle.
   * @param video  - The underlying `<video>` DOM element.
   *
   * @example
   * await tryPlay(currentPlayer, videoEl.current);
   */
  tryPlay: (player: PlayerHandle, video: HTMLVideoElement, desiredMuted?: boolean) => Promise<void>;
}

/**
 * Attempts to start playback, retrying with mute on `NotAllowedError`.
 *
 * Extracted as a module-level pure async function so it can be tested
 * without a React rendering context.
 *
 * @param desiredMuted - The mute state the caller wants. When `false`, an unmuted
 * play is attempted first; only falls back to muted if the browser blocks it.
 * When `true` (or omitted), forces muted before attempting play (legacy behaviour).
 *
 * @example
 * await tryPlay(player, videoEl.current, isMuted);
 */
export async function tryPlay(
  player: PlayerHandle,
  video: HTMLVideoElement,
  desiredMuted = true
): Promise<void> {
  // Synchronous Vlitejs call — starts the internal state machine.
  player.play();

  // Only force-mute up front when the caller wants the player muted. Forcing
  // `video.muted = true` unconditionally here used to silently override an
  // unmuted player state set via `player.unMute()` in onReady.
  if (desiredMuted) {
    video.muted = true;
  }
  video.setAttribute('playsinline', '');

  try {
    await video.play();
  } catch (error: unknown) {
    const err = error as { name?: string };

    if (err?.name === "NotAllowedError") {
      // Browser blocked autoplay — mute and retry.
      video.muted = true;
      player.mute?.();
      try {
        await video.play();
      } catch {
        // Retry failure swallowed silently.
      }
      return;
    }

    if (err?.name === "AbortError") {
      // The browser interrupted playback itself — safe to ignore.
      return;
    }

    _logger.warn("Play failed:", error);
  }
}

/**
 * Returns a stable `tryPlay` callback that handles autoplay policy errors.
 * The callback is the same module-level `tryPlay` function on every render.
 *
 * @example
 * const { tryPlay } = useAutoplayFallback({ videoEl, player });
 * tryPlay(player, video);
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useAutoplayFallback(_opts: UseAutoplayFallbackOptions): UseAutoplayFallbackResult {
  return { tryPlay };
}

// ─── useImaPlugin ─────────────────────────────────────────────────────────────

/** Shape of an IMA ad object's data property as used in CXR. */
interface AdData {
  adId?: unknown;
  dealId?: unknown;
  creativeId?: unknown;
  mediaUrl?: unknown;
  adSystem?: unknown;
  adPodInfo?: unknown;
}

/** Options for `useImaPlugin`. */
export interface UseImaPluginOptions {
  tagDetails: Record<string, unknown>;
  videoDetails: Record<string, unknown>;
  dims?: PlayerDims;
  /** Analytics emit function — typically from `useAnalytics().sendEvent`. */
  sendEvent: (name: string, payload?: Record<string, unknown>) => void;
  /** Called when an IMA error occurs. */
  onAdError?: (error: unknown) => void;
  /** Called after COMPLETE when the item type is 'ad'. */
  onEnded?: () => void;
}

/** Result of `useImaPlugin`. */
export interface UseImaPluginResult {
  /**
   * Wire IMA event listeners to an already-initialised Vlitejs player.
   * Must be called once inside the `onReady` callback.
   *
   * @param player - The Vlitejs player handle.
   *
   * @example
   * attachToPlayer(player);
   */
  attachToPlayer(player: PlayerHandle): void;
}

/**
 * Returns an `attachToPlayer` function that registers all IMA listeners.
 *
 * @example
 * const ima = useImaPlugin({ tagDetails, videoDetails, sendEvent });
 * // inside onReady:
 * ima.attachToPlayer(player);
 */
export function useImaPlugin({
  // tagDetails: _tagDetails,
  videoDetails,
  // dims: _dims,
  sendEvent,
  onAdError,
  onEnded,
}: UseImaPluginOptions): UseImaPluginResult {
  function buildAdEventDetails(adData: AdData): Record<string, unknown> {
    return {
      adId: adData.adId,
      dealId: adData.dealId,
      creativeId: adData.creativeId,
      mediaUrl: adData.mediaUrl,
      adSystem: adData.adSystem,
      adPodInfo: adData.adPodInfo,
    };
  }

  function attachToPlayer(player: PlayerHandle): void {
    // Wire error handler.
    if (player.plugins?.ima) {
      player.plugins.ima.onAdError = onAdError ?? (() => undefined);
    }

    // `adsmanager` fires when the IMA AdsManager is ready.
    player.on("adsmanager", (e?: unknown) => {
      player.play();
      const detail = (
        e as {
          detail?: {
            adsManager?: {
              addEventListener: (type: string, cb: (event: unknown) => void) => void;
            };
          };
        }
      )?.detail;
      const adsManager = detail?.adsManager;
      if (!adsManager) return;

      // Retrieve the IMA AdEvent.Type constants installed by the IMA SDK.
      const imaTypes = (
        window as unknown as {
          google?: { ima?: { AdEvent?: { Type?: Record<string, string> } } };
        }
      )?.google?.ima?.AdEvent?.Type;

      const COMPLETE = imaTypes?.["COMPLETE"] ?? "complete";
      const STARTED = imaTypes?.["STARTED"] ?? "started";
      const LOADED = imaTypes?.["LOADED"] ?? "loaded";

      adsManager.addEventListener(COMPLETE, (adEvent: unknown) => {
        const ad = (adEvent as { getAd?: () => { data: AdData } })?.getAd?.();
        const details = buildAdEventDetails(ad?.data ?? {});
        sendEvent(EVENT.AD_COMPLETE, details);
        if (videoDetails["type"] === "ad") {
          onEnded?.();
        }
      });

      adsManager.addEventListener(STARTED, (adEvent: unknown) => {
        const ad = (adEvent as { getAd?: () => { data: AdData } })?.getAd?.();
        const details = buildAdEventDetails(ad?.data ?? {});
        sendEvent(EVENT.AD_START, details);
      });

      adsManager.addEventListener(LOADED, (adEvent: unknown) => {
        const adData = (adEvent as { getAdData?: () => AdData })?.getAdData?.();
        const details = buildAdEventDetails(adData ?? {});
        sendEvent(EVENT.AD_RESPONSE, details);
      });
    });

    // `adsrequest` fires when the IMA tag URL is requested.
    player.on("adsrequest", (e?: unknown) => {
      const detail = (e as { detail?: { adsRequest?: { adTagUrl?: string } } })?.detail;
      sendEvent(EVENT.AD_REQUEST, { ad_url: detail?.adsRequest?.adTagUrl });
    });
  }

  return { attachToPlayer };
}
