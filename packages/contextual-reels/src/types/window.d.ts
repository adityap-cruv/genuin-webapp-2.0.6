/**
 * Global Window augmentations for third-party SDKs and embed-host callbacks.
 *
 * These declarations make TypeScript aware of properties that the embed host
 * and third-party ad SDKs attach directly to `window`.
 */

import type { BannerConfig, NativeConfig, VideoConfig, AdProviderKind } from "@cxr/ads/normalizers";
import type { OffsitePropertiesConfig } from "@cxr/analytics/analytics";

/** Options passed to `GenAd.init(...)`. */
interface GenAdInitOptions {
  containerId: string;
  muted: boolean;
  /**
   * Initial playback volume (0.0–1.0). The SDK applies and maintains this level
   * for the slot, so the host never has to clamp volume post-play.
   */
  volume?: number;
  banner?: BannerConfig | BannerConfig[];
  native?: NativeConfig | NativeConfig[];
  video?: VideoConfig | VideoConfig[];
  onWaterfallSuccess: (provider: AdProviderKind) => void;
  onWaterfallFail: (provider: string) => void;
  onAdCompleted: () => void;
  onVolumeChange: (data: { volume: number; isMuted: boolean }) => void;
  onStageStart: (data: { stage: string }) => void;
  /** v1.17.0 — fires on every host-controlled or SDK-internal playback state change. */
  onPlaybackStateChange?: (data: { isPaused: boolean; reason?: string }) => void;
  debug: boolean;
}

declare global {
  interface Window {
    /** GenAd in-feed ad SDK. Injected by `loadGenAdSdk`. */
    GenAd?: {
      /**
       * Initialise an ad slot. Returns an instance ID (number) or null on
       * failure. The ID is required for subsequent `destroy` calls.
       */
      init(options: GenAdInitOptions): number | null;
      /** Destroy the ad instance identified by `id`. */
      destroy(id: number): void;
      /** Sync the mute state of a slot without re-initialising. */
      muteByContainer(containerId: string, muted: boolean): void;
      /**
       * Set the playback volume (0.0–1.0) of a slot. Optional — older SDK
       * versions omit it, so callers must guard with a typeof check.
       */
      setVolumeByContainer?(containerId: string, volume: number): void;
      /** Pause all ad instances. */
      pause(): void;
      /** Resume all ad instances. */
      resume(): void;
      /** Pause the ad slot identified by containerId. v1.17.0 */
      pauseByContainer(containerId: string): void;
      /** Resume the ad slot identified by containerId. v1.17.0 */
      resumeByContainer(containerId: string): void;
      /** Notify the ad instance to re-render and adapt to viewport changes (e.g., fullscreen). */
      updateView(instanceId: number): void;
    };

    /**
     * Offsite override configuration set by the embedding page.
     * Merged into analytics payloads before dispatch.
     */
    offsitePropertiesConfig?: OffsitePropertiesConfig;

    /**
     * Callback invoked by the widget when an ad fill is confirmed.
     * Set by the embedding page.
     */
    adFillCallback?: () => void;

    /**
     * Callback invoked by the widget when no ads are available.
     * Set by the embedding page.
     */
    noAdsCallback?: () => void;

    /**
     * Rudderstack analytics SDK (populated after the snippet loads).
     * Typed as `unknown` here to remain compatible with the various local
     * cast patterns used across the codebase. Consumers narrow via
     * `window as Window & { rudderanalytics?: ... }`.
     */
    rudderanalytics?: unknown;

    /** Google IMA event types (populated by the IMA SDK). */
    google?: {
      ima?: {
        AdEvent?: {
          Type?: {
            LOADED: string;
            STARTED: string;
            COMPLETE: string;
          };
        };
      };
    };

    /** Public API exposed by the contextual-reels widget. */
    cxr?: import("../publicApi").CxrPublicApi; // eslint-disable-line @typescript-eslint/consistent-type-imports
  }
}
