/**
 * Tests for the audio-audibility diagnostic sampler.
 *
 * The sampler exists to localize the iOS WKWebView "volume up, but no sound"
 * report to a layer: web (muted/blocked/no-audio-track) vs native
 * (`AVAudioSession` silencing a correctly-unmuted element). See
 * `docs/AUDIO_DIAGNOSTIC_PLAN.md`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { sampleAudioDiagnostic, findAudioElement } from "@cxr/ads/audioDiagnostic";

/**
 * A `<video>`-shaped stub. Defaults model the real on-device audio element:
 * an `audioTracks` list of 1 (populated on current iOS) and NO
 * `webkitAudioDecodedByteCount` (absent on current iOS — verified via Safari Web
 * Inspector). Tests that need the legacy counter opt in explicitly.
 */
function createMedia(
  overrides: Partial<HTMLMediaElement> & {
    webkitAudioDecodedByteCount?: number;
    audioTracks?: { length: number } | undefined;
  } = {}
): HTMLMediaElement {
  const el = document.createElement("video");
  Object.defineProperty(el, "muted", { value: false, writable: true, configurable: true });
  Object.defineProperty(el, "volume", { value: 0.2, writable: true, configurable: true });
  Object.defineProperty(el, "paused", { value: false, writable: true, configurable: true });
  Object.defineProperty(el, "readyState", { value: 4, writable: true, configurable: true });
  Object.defineProperty(el, "currentTime", { value: 0, writable: true, configurable: true });
  Object.defineProperty(el, "audioTracks", { value: { length: 1 }, writable: true, configurable: true });
  for (const [key, value] of Object.entries(overrides)) {
    Object.defineProperty(el, key, { value, writable: true, configurable: true });
  }
  return el;
}

describe("ads/audioDiagnostic — sampleAudioDiagnostic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /**
   * Advances past the sample delay and asserts a snapshot was produced.
   * `sampleAudioDiagnostic` resolves `null` on any internal failure (it must never
   * throw into a publisher page), so the non-null assertion here is itself part of
   * what these tests verify.
   */
  async function settle<T>(promise: Promise<T | null>, delayMs = 800): Promise<T> {
    await vi.advanceTimersByTimeAsync(delayMs);
    const snapshot = await promise;
    expect(snapshot).not.toBeNull();
    return snapshot as T;
  }

  it("reports audio_decoding and time_advancing true when both counters climb", async () => {
    // The conclusive field case: WebKit IS decoding audio and advancing the
    // element while unmuted at a real volume — so any silence the user hears is
    // below the web layer (native audio session), not ours.
    const el = createMedia({ webkitAudioDecodedByteCount: 1000 });
    const promise = sampleAudioDiagnostic(el, {});

    (el as HTMLMediaElement & { webkitAudioDecodedByteCount: number }).webkitAudioDecodedByteCount = 5000;
    (el as { currentTime: number }).currentTime = 0.7;

    const snapshot = await settle(promise);

    expect(snapshot.audio_decoding).toBe(true);
    expect(snapshot.time_advancing).toBe(true);
    expect(snapshot.audio_decoded_bytes).toBe(5000);
    expect(snapshot.element_muted).toBe(false);
    expect(snapshot.element_volume).toBe(0.2);
    expect(snapshot.has_audio_track).toBe(true);
  });

  it("reports audio_decoding false when the decode counter is flat", async () => {
    // Decoder stalled / no audio track in the creative — this bucket is OURS.
    const el = createMedia({ webkitAudioDecodedByteCount: 0 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.audio_decoding).toBe(false);
    expect(snapshot.audio_decoded_bytes).toBe(0);
  });

  it("reports audio_decoding false when the counter exists but stays flat", async () => {
    // Legacy WebKit path: counter present, no growth => not decoding.
    const el = createMedia({ webkitAudioDecodedByteCount: 2048 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.audio_decoding).toBe(false);
    expect(snapshot.audio_decoded_bytes).toBe(2048);
  });

  it("reports time_advancing false when currentTime does not move", async () => {
    const el = createMedia({ webkitAudioDecodedByteCount: 1000, currentTime: 2 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.time_advancing).toBe(false);
  });

  it("reports bytes null and audio_decoding false when the counter is absent", async () => {
    // Current iOS: `webkitAudioDecodedByteCount` does not exist. Absent must read
    // as "unknown" (null), never 0 — 0 would look like a decode failure. And
    // audio_decoding must not be treated as evidence either way.
    const el = createMedia();
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.audio_decoded_bytes).toBeNull();
    expect(snapshot.audio_decoding).toBe(false);
    // …but the track IS detectable via audioTracks, which is the point.
    expect(snapshot.has_audio_track).toBe(true);
    expect(snapshot.audio_track_source).toBe("audioTracks");
  });

  it("detects the audio track from audioTracks on current iOS (no byte counter)", async () => {
    // The exact on-device shape: audioTracks.length 1, counter undefined.
    const el = createMedia({ audioTracks: { length: 1 } });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(true);
    expect(snapshot.audio_track_source).toBe("audioTracks");
  });

  it("reports has_audio_track false for a genuinely silent creative", async () => {
    // audioTracks present but empty — this is the bucket that would be OUR bug.
    // readyState is explicit: an empty list only means "no audio" once metadata
    // has loaded, and that precondition is what makes this the "ours" verdict.
    const el = createMedia({ audioTracks: { length: 0 }, readyState: 4 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(false);
    expect(snapshot.audio_track_source).toBe("audioTracks");
  });

  it("reports awaitingMetadata — not a silent creative — when tracks are empty pre-metadata", async () => {
    // The false-accusation guard: on a slow network the 800ms sample can land
    // before metadata, where audioTracks is legitimately empty on a creative
    // that DOES carry audio. Reporting `audioTracks` here would read as "the
    // creative has no audio track" (our bug) per the decision table, blaming
    // the creative for a network-timing artifact.
    const el = createMedia({ audioTracks: { length: 0 }, readyState: 0 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(false);
    expect(snapshot.audio_track_source).toBe("awaitingMetadata");
  });

  it("trusts a non-empty audioTracks list even before metadata loads", async () => {
    // A populated list is positive evidence whenever it appears — only the
    // EMPTY case is ambiguous, so readyState must not suppress a real track.
    const el = createMedia({ audioTracks: { length: 1 }, readyState: 0 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(true);
    expect(snapshot.audio_track_source).toBe("audioTracks");
  });

  it("treats HAVE_METADATA as sufficient — the track list is populated by then", async () => {
    // Boundary: readyState 1 is exactly where audioTracks becomes meaningful.
    const el = createMedia({ audioTracks: { length: 0 }, readyState: 1 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.audio_track_source).toBe("audioTracks");
  });

  it("keeps the audioTracks verdict when readyState is unreadable", async () => {
    // Backward-compatibility guard: `undefined >= 1` is false, so a naive
    // comparison would reroute EVERY verdict to awaitingMetadata on a host that
    // doesn't expose readyState — silently emptying the "ours" bucket. Only a
    // known-numeric pre-metadata value may downgrade.
    const el = createMedia({ audioTracks: { length: 0 }, readyState: undefined as unknown as number });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.audio_track_source).toBe("audioTracks");
  });

  it("falls back to the decode counter where audioTracks is unavailable", async () => {
    const el = createMedia({ audioTracks: undefined, webkitAudioDecodedByteCount: 4096 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(true);
    expect(snapshot.audio_track_source).toBe("decodedBytes");
  });

  it("falls back to webkitHasAudio on older WebKit builds", async () => {
    // Last resort where neither audioTracks nor the byte counter exists.
    const el = createMedia({ audioTracks: undefined });
    Object.defineProperty(el, "webkitHasAudio", { value: true, configurable: true });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(true);
    expect(snapshot.audio_track_source).toBe("webkitHasAudio");
  });

  it("honours a false webkitHasAudio", async () => {
    const el = createMedia({ audioTracks: undefined });
    Object.defineProperty(el, "webkitHasAudio", { value: false, configurable: true });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(false);
    expect(snapshot.audio_track_source).toBe("webkitHasAudio");
  });

  it("reports audio_track_source unknown when no signal exists at all", async () => {
    // Neither audioTracks nor the counter — a `false` here must be readable as
    // "couldn't tell", not "creative is silent".
    const el = createMedia({ audioTracks: undefined });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(false);
    expect(snapshot.audio_track_source).toBe("unknown");
  });

  it("quantifies playback progress, not just a boolean", async () => {
    // ~800ms of movement across an 800ms window = real-time playback. The
    // boolean alone can't separate this from a 20ms limp.
    const el = createMedia();
    const promise = sampleAudioDiagnostic(el, {});
    (el as { currentTime: number }).currentTime = 0.8;
    const snapshot = await settle(promise);

    expect(snapshot.time_advancing).toBe(true);
    expect(snapshot.time_advanced_ms).toBe(800);
    expect(snapshot.current_time_ms).toBe(800);
  });

  it("reports time_advanced_ms 0 for a stalled element", async () => {
    const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.time_advanced_ms).toBe(0);
    expect(snapshot.time_advancing).toBe(false);
  });

  it("reports duration_ms and network_state", async () => {
    const el = createMedia();
    Object.defineProperty(el, "duration", { value: 30, configurable: true });
    Object.defineProperty(el, "networkState", { value: 2, configurable: true });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.duration_ms).toBe(30_000);
    expect(snapshot.network_state).toBe(2);
  });

  it("reports duration_ms null for a non-finite duration", async () => {
    const el = createMedia();
    Object.defineProperty(el, "duration", { value: NaN, configurable: true });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.duration_ms).toBeNull();
  });

  it("reports buffered_ahead_s from the range containing the playhead", async () => {
    // Healthy buffer while playing => a later silence is not a network stall.
    const el = createMedia({ currentTime: 2 });
    Object.defineProperty(el, "buffered", {
      value: { length: 1, start: () => 0, end: () => 10 },
      configurable: true,
    });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.buffered_ahead_s).toBe(8);
  });

  it("reports buffered_ahead_s 0 when the playhead sits outside every range", async () => {
    const el = createMedia({ currentTime: 99 });
    Object.defineProperty(el, "buffered", {
      value: { length: 1, start: () => 0, end: () => 10 },
      configurable: true,
    });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.buffered_ahead_s).toBe(0);
  });

  it("reports buffered_ahead_s null when nothing is buffered", async () => {
    const el = createMedia();
    Object.defineProperty(el, "buffered", {
      value: { length: 0, start: () => 0, end: () => 0 },
      configurable: true,
    });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.buffered_ahead_s).toBeNull();
  });

  it("skips ranges that do not contain the playhead", async () => {
    // Multi-range buffer: must report the range the playhead is actually in.
    const el = createMedia({ currentTime: 20 });
    const starts = [0, 15];
    const ends = [5, 25];
    Object.defineProperty(el, "buffered", {
      value: { length: 2, start: (i: number) => starts[i], end: (i: number) => ends[i] },
      configurable: true,
    });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.buffered_ahead_s).toBe(5);
  });

  it("reports audio_session_type when WebKit exposes navigator.audioSession", async () => {
    const nav = navigator as Navigator & { audioSession?: { type?: string } };
    Object.defineProperty(nav, "audioSession", {
      value: { type: "playback" },
      configurable: true,
    });

    try {
      const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));
      expect(snapshot.audio_session_type).toBe("playback");
    } finally {
      delete nav.audioSession;
    }
  });

  it("reports audio_session_type null where the API is absent", async () => {
    const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.audio_session_type).toBeNull();
  });

  it("reports user activation, separating no-gesture autoplay from post-tap silence", async () => {
    const nav = navigator as Navigator & {
      userActivation?: { hasBeenActive?: boolean; isActive?: boolean };
    };
    Object.defineProperty(nav, "userActivation", {
      value: { hasBeenActive: true, isActive: false },
      configurable: true,
    });

    try {
      const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));
      expect(snapshot.user_has_activated).toBe(true);
      expect(snapshot.user_activation_active).toBe(false);
    } finally {
      delete (nav as { userActivation?: unknown }).userActivation;
    }
  });

  it("reports user activation null where the API is absent", async () => {
    const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.user_has_activated).toBeNull();
    expect(snapshot.user_activation_active).toBeNull();
  });

  it("reports non-boolean userActivation fields as null", async () => {
    const nav = navigator as Navigator & { userActivation?: unknown };
    Object.defineProperty(nav, "userActivation", { value: {}, configurable: true });

    try {
      const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));
      expect(snapshot.user_has_activated).toBeNull();
      expect(snapshot.user_activation_active).toBeNull();
    } finally {
      delete (nav as { userActivation?: unknown }).userActivation;
    }
  });

  it("reports document_hidden — a hidden webview explains silence on its own", async () => {
    const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.document_hidden).toBe(false);
  });

  it("reports media_error_code when the element failed outright", async () => {
    const el = createMedia();
    Object.defineProperty(el, "error", { value: { code: 4 }, configurable: true });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.media_error_code).toBe(4);
  });

  it("reports media_error_code null when the element is healthy", async () => {
    const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.media_error_code).toBeNull();
  });

  it("reports element_src so the sampled element is identifiable", async () => {
    const el = createMedia();
    el.setAttribute("src", "https://media.begenuin.com/audio-ads/spot.mp3");
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.element_src).toContain("audio-ads/spot.mp3");
  });

  it("captures muted/volume/paused/ready_state from the live element", async () => {
    const el = createMedia({ muted: true, volume: 0, paused: true, readyState: 1 });
    const snapshot = await settle(sampleAudioDiagnostic(el, {}));

    expect(snapshot.element_muted).toBe(true);
    expect(snapshot.element_volume).toBe(0);
    expect(snapshot.paused).toBe(true);
    expect(snapshot.ready_state).toBe(1);
  });

  it("merges caller-supplied extra fields into the snapshot", async () => {
    const el = createMedia();
    const snapshot = await settle(
      sampleAudioDiagnostic(el, {
        wants_audible_ad_start: true,
        configured_volume: 0.2,
        ad_blocked_reason: "unmuted_autoplay_restricted",
      })
    );

    expect(snapshot.wants_audible_ad_start).toBe(true);
    expect(snapshot.configured_volume).toBe(0.2);
    expect(snapshot.ad_blocked_reason).toBe("unmuted_autoplay_restricted");
  });

  it("stamps is_webview from the user agent", async () => {
    // iOS WKWebView: iPhone UA with the Safari token dropped.
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
    );
    const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.is_webview).toBe(true);
  });

  it("honours a custom sample delay", async () => {
    const el = createMedia({ webkitAudioDecodedByteCount: 10 });
    const promise = sampleAudioDiagnostic(el, {}, 200);

    (el as HTMLMediaElement & { webkitAudioDecodedByteCount: number }).webkitAudioDecodedByteCount = 99;
    const snapshot = await settle(promise, 200);

    expect(snapshot.audio_decoding).toBe(true);
  });

  it("returns audiocontext_state null when no AudioContext has been created", async () => {
    // Must never construct one just to probe — instantiating an AudioContext has
    // real side effects on iOS.
    const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.audiocontext_state).toBeNull();
  });

  it("reports a pre-existing AudioContext's state without constructing one", async () => {
    const scope = globalThis as { __cxrAudioContext?: { state?: string } };
    scope.__cxrAudioContext = { state: "suspended" };

    try {
      const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));
      expect(snapshot.audiocontext_state).toBe("suspended");
    } finally {
      delete scope.__cxrAudioContext;
    }
  });

  it("ignores an AudioContext whose state is not a string", async () => {
    const scope = globalThis as { __cxrAudioContext?: { state?: string } };
    scope.__cxrAudioContext = {};

    try {
      const snapshot = await settle(sampleAudioDiagnostic(createMedia(), {}));
      expect(snapshot.audiocontext_state).toBeNull();
    } finally {
      delete scope.__cxrAudioContext;
    }
  });
});

// ─── decoy-element selection ──────────────────────────────────────────────────
// Regression cover for a real on-device miss: the audio-ad layout appends a
// decorative, muted, audio-less content video BEFORE the audio transport, so a
// first-match `querySelector` sampled the decoy and reported
// has_audio_track:false / element_volume:1 while audio was playing fine.

describe("ads/audioDiagnostic — picking the audio-bearing element", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /**
   * Mirrors the SDK's audio-ad DOM: decoy content video first, audio second.
   * Models current iOS — `audioTracks` populated, no byte counter.
   */
  /** Advances the sample window and asserts a snapshot came back (never null). */
  async function settleSlot<T>(promise: Promise<T | null>, delayMs = 800): Promise<T> {
    await vi.advanceTimersByTimeAsync(delayMs);
    const snapshot = await promise;
    expect(snapshot).not.toBeNull();
    return snapshot as T;
  }

  function slotWithDecoy(opts: { audioHasTrack?: boolean } = {}): HTMLDivElement {
    const { audioHasTrack = true } = opts;
    const slot = document.createElement("div");

    // Decorative content video: visible, muted, NO audio track.
    const decoy = document.createElement("video");
    decoy.className = "gen-audio-content-video";
    decoy.setAttribute("src", "https://cdn.example/decor.mp4");
    Object.defineProperty(decoy, "muted", { value: true, configurable: true });
    Object.defineProperty(decoy, "volume", { value: 1, configurable: true });
    Object.defineProperty(decoy, "currentTime", { value: 5, configurable: true });
    Object.defineProperty(decoy, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(decoy);

    // The real audio transport: hidden, unmuted, at the configured level.
    const audio = document.createElement("video");
    audio.style.display = "none";
    audio.setAttribute("src", "https://media.begenuin.com/audio-ads/spot.mp3");
    Object.defineProperty(audio, "muted", { value: false, configurable: true });
    Object.defineProperty(audio, "volume", { value: 0.2, configurable: true });
    Object.defineProperty(audio, "currentTime", { value: 3, configurable: true });
    Object.defineProperty(audio, "audioTracks", {
      value: { length: audioHasTrack ? 1 : 0 },
      configurable: true,
    });
    slot.appendChild(audio);

    return slot;
  }

  it("picks the decoding audio element over an earlier silent content video", () => {
    const slot = slotWithDecoy();
    const picked = findAudioElement(slot);

    expect(picked).not.toBeNull();
    expect(picked?.muted).toBe(false);
    expect(picked?.volume).toBe(0.2);
    expect(picked?.className).not.toBe("gen-audio-content-video");
  });

  it("samples the audio element when handed the container", async () => {
    const slot = slotWithDecoy();
    const snapshot = await settleSlot(sampleAudioDiagnostic(slot, {}));

    // The values that were wrong on device: previously volume 1 / no audio track.
    expect(snapshot.element_volume).toBe(0.2);
    expect(snapshot.element_muted).toBe(false);
    expect(snapshot.has_audio_track).toBe(true);
    expect(snapshot.element_src).toContain("audio-ads/spot.mp3");
    expect(snapshot.media_element_count).toBe(2);
  });

  it("still picks the audio element when its track list is empty", async () => {
    // Genuine "silent creative" case must still measure the audio element, not
    // the decoy — otherwise we'd blame the creative from the wrong element. Both
    // carry a `src` and neither reports a track, so the hidden-element tier is
    // the only thing separating them: the transport is `display: none`, the
    // decorative content video is visible.
    const slot = slotWithDecoy({ audioHasTrack: false });
    const snapshot = await settleSlot(sampleAudioDiagnostic(slot, {}));

    expect(snapshot.has_audio_track).toBe(false);
    expect(snapshot.audio_decoding).toBe(false);
    // The load-bearing assertions: these describe the transport, not the decoy.
    expect(snapshot.element_src).toContain("audio-ads/spot.mp3");
    expect(snapshot.element_volume).toBe(0.2);
    expect(snapshot.element_muted).toBe(false);
  });

  it("prefers the hidden transport over a visible decoy when neither reports a track", () => {
    // Same tie as above, asserted directly on the picker.
    const slot = document.createElement("div");
    const visible = document.createElement("video");
    visible.setAttribute("src", "https://cdn.example/decor.mp4");
    Object.defineProperty(visible, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(visible);

    const hidden = document.createElement("video");
    hidden.style.display = "none";
    hidden.setAttribute("src", "https://media.begenuin.com/audio-ads/spot.mp3");
    Object.defineProperty(hidden, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(hidden);

    expect(findAudioElement(slot)).toBe(hidden);
  });

  it("ignores a throwing style lookup and falls back to the source ranking", () => {
    // getComputedStyle throws on some detached/exotic elements; an unknown
    // visibility must degrade to the old src-only tiebreak, not blow up. Needs
    // two candidates — a lone element short-circuits before any scoring runs.
    const slot = document.createElement("div");
    const first = document.createElement("video");
    first.setAttribute("src", "https://cdn.example/decor.mp4");
    Object.defineProperty(first, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(first);

    const second = document.createElement("video");
    second.style.display = "none";
    second.setAttribute("src", "https://media.begenuin.com/audio-ads/spot.mp3");
    Object.defineProperty(second, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(second);

    const spy = vi.spyOn(globalThis, "getComputedStyle").mockImplementation(() => {
      throw new Error("InvalidStateError");
    });

    try {
      // Both fall to the src-only tier, so document order keeps the first.
      expect(findAudioElement(slot)).toBe(first);
    } finally {
      spy.mockRestore();
    }
  });

  it("returns null for a container with no media at all", () => {
    expect(findAudioElement(document.createElement("div"))).toBeNull();
  });

  it("falls back to the only candidate when nothing looks audio-bearing", () => {
    const slot = document.createElement("div");
    const only = document.createElement("video");
    Object.defineProperty(only, "muted", { value: true, configurable: true });
    Object.defineProperty(only, "volume", { value: 0, configurable: true });
    slot.appendChild(only);

    expect(findAudioElement(slot)).toBe(only);
  });

  it("prefers an unmuted audio-bearing element over a muted one", () => {
    // Both carry audio; the unmuted one is the ad transport.
    const slot = document.createElement("div");
    const muted = document.createElement("video");
    Object.defineProperty(muted, "muted", { value: true, configurable: true });
    Object.defineProperty(muted, "audioTracks", { value: { length: 1 }, configurable: true });
    slot.appendChild(muted);

    const audible = document.createElement("video");
    Object.defineProperty(audible, "muted", { value: false, configurable: true });
    Object.defineProperty(audible, "audioTracks", { value: { length: 1 }, configurable: true });
    slot.appendChild(audible);

    expect(findAudioElement(slot)).toBe(audible);
  });

  it("prefers an element with a src over a placeholder with none", () => {
    // IMA's content placeholder has no `src` and no audio; the real media does.
    const slot = document.createElement("div");
    const placeholder = document.createElement("video");
    Object.defineProperty(placeholder, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(placeholder);

    const real = document.createElement("video");
    real.setAttribute("src", "https://media.begenuin.com/audio-ads/spot.mp3");
    Object.defineProperty(real, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(real);

    expect(findAudioElement(slot)).toBe(real);
  });

  it("resolves null instead of throwing when the element misbehaves", async () => {
    // This ships to every publisher page. A throwing getter (detached element,
    // hostile CMP, exotic engine) must degrade to "no diagnostic", never to an
    // uncaught exception on someone else's site.
    const el = createMedia();
    Object.defineProperty(el, "muted", {
      get: () => {
        throw new Error("InvalidStateError");
      },
      configurable: true,
    });

    const promise = sampleAudioDiagnostic(el, {});
    await vi.advanceTimersByTimeAsync(800);

    await expect(promise).resolves.toBeNull();
  });

  it("resolves null for a container that never had media", async () => {
    // Defensive: the caller guards on this, but the sampler must not assume it.
    const promise = sampleAudioDiagnostic(document.createElement("div"), {});
    await vi.advanceTimersByTimeAsync(800);

    await expect(promise).resolves.toBeNull();
  });

  it("resolves null when the container's media disappears mid-sample", async () => {
    // Real teardown race: the slot had media at query time, then GenAd destroyed
    // the ad before the sample window closed. Must report nothing, not throw.
    const slot = slotWithDecoy();
    const promise = sampleAudioDiagnostic(slot, {});
    slot.replaceChildren(); // ad torn down

    await vi.advanceTimersByTimeAsync(800);

    await expect(promise).resolves.toBeNull();
  });

  it("survives a throwing buffered getter", async () => {
    // `buffered` throws InvalidStateError on some detached/errored elements.
    const el = createMedia();
    Object.defineProperty(el, "buffered", {
      get: () => {
        throw new Error("InvalidStateError");
      },
      configurable: true,
    });

    const snapshot = await settleSlot(sampleAudioDiagnostic(el, {}));

    expect(snapshot.buffered_ahead_s).toBeNull();
    // The rest of the snapshot must still be usable.
    expect(snapshot.has_audio_track).toBe(true);
  });

  it("survives a throwing TimeRanges.start()", async () => {
    // Ranges can mutate between the length check and the read (IndexSizeError).
    const el = createMedia();
    Object.defineProperty(el, "buffered", {
      value: {
        length: 1,
        start: () => {
          throw new Error("IndexSizeError");
        },
        end: () => 10,
      },
      configurable: true,
    });

    const snapshot = await settleSlot(sampleAudioDiagnostic(el, {}));

    expect(snapshot.buffered_ahead_s).toBeNull();
  });

  it("survives a throwing audioTracks getter", async () => {
    const el = createMedia();
    Object.defineProperty(el, "audioTracks", {
      get: () => {
        throw new Error("boom");
      },
      configurable: true,
    });

    const snapshot = await settleSlot(sampleAudioDiagnostic(el, {}));

    expect(snapshot.has_audio_track).toBe(false);
    expect(snapshot.audio_track_source).toBe("unknown");
  });

  it("survives a throwing navigator.audioSession", async () => {
    const nav = navigator as Navigator & { audioSession?: unknown };
    Object.defineProperty(nav, "audioSession", {
      get: () => {
        throw new Error("boom");
      },
      configurable: true,
    });

    try {
      const snapshot = await settleSlot(sampleAudioDiagnostic(createMedia(), {}));
      expect(snapshot.audio_session_type).toBeNull();
    } finally {
      delete (nav as { audioSession?: unknown }).audioSession;
    }
  });

  it("survives a throwing navigator.userActivation", async () => {
    const nav = navigator as Navigator & { userActivation?: unknown };
    Object.defineProperty(nav, "userActivation", {
      get: () => {
        throw new Error("boom");
      },
      configurable: true,
    });

    try {
      const snapshot = await settleSlot(sampleAudioDiagnostic(createMedia(), {}));
      expect(snapshot.user_has_activated).toBeNull();
      expect(snapshot.user_activation_active).toBeNull();
    } finally {
      delete (nav as { userActivation?: unknown }).userActivation;
    }
  });

  it("produces a complete snapshot on a non-WebKit engine (Chrome/Firefox shape)", async () => {
    // Same code runs on desktop web. No webkit extras, no audioSession, but
    // audioTracks and the standard fields still work — nothing throws, nothing
    // is silently wrong.
    const el = document.createElement("video");
    Object.defineProperty(el, "muted", { value: false, configurable: true });
    Object.defineProperty(el, "volume", { value: 0.2, configurable: true });
    Object.defineProperty(el, "paused", { value: false, configurable: true });
    Object.defineProperty(el, "readyState", { value: 4, configurable: true });
    Object.defineProperty(el, "currentTime", { value: 1, configurable: true });

    const snapshot = await settleSlot(sampleAudioDiagnostic(el, {}));

    // WebKit-only fields degrade to null rather than breaking the snapshot.
    expect(snapshot.audio_decoded_bytes).toBeNull();
    expect(snapshot.audio_session_type).toBeNull();
    expect(snapshot.audio_decoding).toBe(false);
    // Standard fields still populate, so the event stays useful off-iOS.
    expect(snapshot.element_muted).toBe(false);
    expect(snapshot.element_volume).toBe(0.2);
    expect(snapshot.network_state).toEqual(expect.any(Number));
    expect(snapshot.document_hidden).toBe(false);
    // `audioTracks` is implemented by Blink/Gecko too, so has_audio_track stays
    // meaningful cross-engine — it is not an iOS-only signal.
    expect(snapshot.audio_track_source).toBe("audioTracks");
  });

  it("reports media_element_count 1 when handed a bare element", async () => {
    const snapshot = await settleSlot(sampleAudioDiagnostic(createMedia(), {}));

    expect(snapshot.media_element_count).toBe(1);
  });

  it("uses absolute evidence when the re-resolve switches elements mid-sample", async () => {
    // The real sequence: at query time the audio element's track list is not yet
    // populated, so the decoy wins on `src`. Once the track appears the
    // re-resolve switches to it — and differencing two unrelated elements'
    // currentTime would be meaningless, so absolute progress decides.
    const slot = document.createElement("div");

    const decoy = document.createElement("video");
    decoy.setAttribute("src", "https://cdn.example/decor.mp4");
    Object.defineProperty(decoy, "muted", { value: true, configurable: true });
    Object.defineProperty(decoy, "currentTime", { value: 9, configurable: true });
    Object.defineProperty(decoy, "audioTracks", { value: { length: 0 }, configurable: true });
    slot.appendChild(decoy);

    const audio = document.createElement("video");
    Object.defineProperty(audio, "muted", { value: false, configurable: true });
    Object.defineProperty(audio, "currentTime", { value: 1.5, configurable: true });
    let trackReady = false;
    Object.defineProperty(audio, "audioTracks", {
      get: () => ({ length: trackReady ? 1 : 0 }),
      configurable: true,
    });
    slot.appendChild(audio);

    const promise = sampleAudioDiagnostic(slot, {});
    // Metadata lands → the audio element now outranks the decoy.
    trackReady = true;
    const snapshot = await settleSlot(promise);

    expect(snapshot.has_audio_track).toBe(true);
    // Switched elements: absolute progress (currentTime > 0), not a delta.
    expect(snapshot.time_advancing).toBe(true);
    expect(snapshot.element_muted).toBe(false);
  });
});
