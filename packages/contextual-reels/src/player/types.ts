/**
 * Shared type definitions for the `src/player` module.
 *
 * No logic lives here — types only.
 */

/**
 * Minimal Vlitejs player handle surface used by hooks.
 * Vlitejs does not publish official @types; this narrows only what CXR uses.
 */
export type PlayerHandle = {
  play(): void;
  pause(): void;
  mute(): void;
  unMute(): void;
  destroy?(): void;
  getCurrentTime(): Promise<number>;
  getDuration(): Promise<number>;
  on(event: string, handler: (e?: unknown) => void): void;
  getInstance?(): HTMLVideoElement | null;
  /** IMA plugin instance, present when ad tag URL provided */
  plugins?: { ima?: { onAdError?: (e: unknown) => void } };
};

/** How the video element fills its container. */
export type VideoMode = "cover" | "contain" | "fill";

/** Tag dimensions supplied by the embedding context. */
export type PlayerDims = { tagHeight?: number; tagWidth?: number };

/** All props accepted by `LightPlayer`. */
export type LightPlayerProps = {
  /** HLS or MP4 source URL */
  content: string;
  /** IMA VAST ad tag URL — omit for ad-free playback */
  ad?: string;
  id: number;
  poster?: string;
  videoId?: string;
  /** Vlitejs config subset (controls loop behaviour) */
  config?: { auto_swipe?: boolean };
  videoMode?: VideoMode;
  isMuted: boolean;
  /** Audible volume 0..1. The element stays unmuted; silence comes from volume 0. */
  volume: number;
  isPlay: boolean;
  /** Hide the seek/progress bar (e.g. while the Octo sheet owns the container). */
  hideScrubber?: boolean;
  /** Whether this reel item has IMA ad support wired */
  supportAds?: boolean;
  tagDetails: Record<string, unknown>;
  videoDetails: Record<string, unknown>;
  dims?: PlayerDims;
  /**
   * Timestamp (from `Date.now()`) of the last user-initiated play click.
   * Passed by the parent (ReelItem) so LightPlayer stays pure.
   * Defaults to 0 (never a recent click) when not provided.
   */
  lastUserPlayAt?: number;
  /** Called every timeupdate tick — parent uses this to track video_watch duration */
  onTimeUpdate?: (currentTime: number, duration: number, id: number) => void;
  /** Called when video ends — parent advances the feed */
  onEnded?: () => void;
  /** Called when player is ready — parent can read player handle */
  onReady?: (player: PlayerHandle) => void;
};
