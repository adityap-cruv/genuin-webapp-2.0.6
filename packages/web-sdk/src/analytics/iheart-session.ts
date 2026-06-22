/**
 * iHeart streaming session/track lifecycle engine.
 *
 * iHeart models a viewing session as a **Stream** (once per session) containing many
 * **Tracks** (one per clip). Every streaming event shares a single `station.sessionId`,
 * and several required fields are stateful — they can only be derived by tracking events
 * over time, not from a single Genuin analytics payload:
 *
 *  - `station.sessionId`     — generated once at stream start, reused until stream end
 *  - `streamIsMute`          — toggled by Muted/Unmuted events (stream starts muted = 1)
 *  - `streamFeedPosition`    — current clip index (1-based)
 *  - `streamFeedTotal`       — total clips in the feed
 *  - `station.listenTime`    — wall-clock seconds accumulated since the last stream start
 *  - `station.startPosition` — playhead position when the current clip began
 *
 * It also tracks the open **track** (current clip + whether a track_start has been emitted
 * without a matching track_end) so the orchestrator can synthesize clip boundaries.
 *
 * This class is pure state — it raises no events. The bridge reads {@link snapshot} to
 * build payloads and drives transitions.
 */

/** Derived state read by the event builders. */
export interface SessionSnapshot {
  sessionId: string;
  /** Per-track id — fresh each `openTrack`; identifies one clip play (`station.subSessionId`). */
  subSessionId: string;
  /** Whether the stream is muted (starts true; toggled by Muted/Unmuted). */
  streamIsMute: boolean;
  streamFeedPosition: number;
  streamFeedTotal: number;
  /** Seconds since the current stream started (wall time). */
  listenTime: number;
  /** Playhead position (seconds) when the current clip began. */
  startPosition: number;
  /** Epoch-ms timestamp when the current stream/track load began (`station.playbackStartTime`). */
  playbackStartTime: number;
  /** Epoch-ms timestamp when the stream init began (constant per session; `station.streamInitTime`). */
  streamInitTime: number;
  /** Whether a stream is currently open. */
  isActive: boolean;
  /** Clip id of the currently open track, or null. */
  currentClipId: string | null;
  /** Whether a track_start has been emitted without a matching track_end. */
  isTrackOpen: boolean;
}

/** Monotonic clock injected for testability (defaults to performance.now). */
type Clock = () => number;

/** Wall-clock (epoch ms) injected for testability (defaults to Date.now). */
type WallClock = () => number;

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID.
  return `gn-${Math.abs(hashString(String(performance.now())))}-${performance.now().toString(36)}`;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function clampPosition(value: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }
  return Math.floor(value);
}

export class IHeartSession {
  private sessionId = "";
  private subSessionId = "";
  private mute = true; // Stream starts muted per spec.
  private feedPosition = 1;
  private feedTotal = 1;
  private startPosition = 0;
  private streamStartedAt: number | null = null;
  private loadStartedAt = 0;
  private streamInitAt = 0;
  private currentClipId: string | null = null;
  private trackOpen = false;
  private readonly clock: Clock;
  private readonly wallClock: WallClock;

  constructor(clock: Clock = () => performance.now(), wallClock: WallClock = () => Date.now()) {
    this.clock = clock;
    this.wallClock = wallClock;
  }

  /** Whether a stream is currently open. */
  get isActive(): boolean {
    return this.streamStartedAt !== null;
  }

  /** Whether a track_start was emitted without a matching track_end. */
  get isTrackOpen(): boolean {
    return this.trackOpen;
  }

  /** Clip id of the currently open track, or null. */
  get clipId(): string | null {
    return this.currentClipId;
  }

  /**
   * Opens a new viewing session. Generates a fresh `sessionId` and resets accumulators.
   * Idempotent within an active session: re-calling while active keeps the same id.
   */
  startStream(): void {
    if (this.isActive) {
      return;
    }
    this.sessionId = generateSessionId();
    this.streamStartedAt = this.clock();
    this.loadStartedAt = this.wallClock();
    // Captured once at stream start and never reset — matches prod where streamInitTime stays
    // constant across the session while playbackStartTime advances per track.
    this.streamInitAt = this.loadStartedAt;
  }

  /** Closes the current session. Subsequent snapshots report inactive. */
  endStream(): void {
    this.streamStartedAt = null;
    this.currentClipId = null;
    this.trackOpen = false;
  }

  /** Marks a clip's track as open — updates position and playhead origin. */
  openTrack(clipId: string | null, feedPosition?: number, startPosition = 0): void {
    this.currentClipId = clipId;
    this.trackOpen = true;
    // Fresh per track — `subSessionId` identifies this single clip play within the stream
    // session (`sessionId` stays constant across the session).
    this.subSessionId = generateSessionId();
    this.loadStartedAt = this.wallClock();
    if (typeof feedPosition === "number") {
      this.feedPosition = clampPosition(feedPosition);
    }
    this.startPosition = Math.max(0, startPosition);
  }

  /** Marks the current clip's track as closed (after a track_end is emitted). */
  closeTrack(): void {
    this.trackOpen = false;
  }

  /** Updates mute state from Muted/Unmuted events. */
  setMute(isMuted: boolean): void {
    this.mute = isMuted;
  }

  /** Updates the total clip count in the feed. */
  setFeedTotal(total: number): void {
    this.feedTotal = clampPosition(total);
  }

  /** Updates the current feed position (e.g. on swipe). */
  setFeedPosition(position: number): void {
    this.feedPosition = clampPosition(position);
  }

  /** Seconds elapsed since the stream started (0 when no active stream). */
  private listenTime(): number {
    if (this.streamStartedAt === null) {
      return 0;
    }
    return Math.max(0, Math.round((this.clock() - this.streamStartedAt) / 1000));
  }

  /** Current derived state for payload construction. */
  snapshot(): SessionSnapshot {
    return {
      sessionId: this.sessionId,
      subSessionId: this.subSessionId,
      streamIsMute: this.mute,
      streamFeedPosition: this.feedPosition,
      streamFeedTotal: this.feedTotal,
      listenTime: this.listenTime(),
      startPosition: this.startPosition,
      playbackStartTime: this.loadStartedAt,
      streamInitTime: this.streamInitAt,
      isActive: this.isActive,
      currentClipId: this.currentClipId,
      isTrackOpen: this.trackOpen,
    };
  }
}
