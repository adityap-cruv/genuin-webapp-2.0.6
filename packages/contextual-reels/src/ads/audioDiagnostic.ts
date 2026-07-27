/**
 * Audio-audibility diagnostic sampler.
 *
 * Infolinks report that our audible-start audio ad shows the volume UI going up
 * inside their iOS `WKWebView`, but no sound is heard. Audibility on iOS is
 * gated by `AVAudioSession` — an app-global native setting owned by whoever
 * instantiates the web view. JavaScript cannot read it, set it, or detect the
 * ring/silent switch, so we cannot fix audibility from here; we can only prove
 * which layer owns the failure.
 *
 * This module samples the live media element twice and reports the deltas.
 *
 * The intended proof was `webkitAudioDecodedByteCount` climbing (bytes actually
 * reaching the decoder), but on-device testing showed that property is **absent
 * on current iOS** — so the diagnostic instead rests on the combination:
 * `has_audio_track` (from `audioTracks`, which IS populated on iOS) +
 * `element_muted === false` + `time_advancing`. Together those say the web layer
 * is doing everything right; if the user still hears nothing, the silence is
 * native (`AVAudioSession` / ring switch) and below anything JS can reach.
 *
 * Caveat that keeps this honest: without the byte counter we cannot prove audio
 * is being *decoded*, only that a track exists and playback is progressing. That
 * is a slightly weaker claim, and the fields say so rather than implying more.
 *
 * Instrumentation only — nothing here changes playback, mute, or volume.
 *
 * See `docs/AUDIO_DIAGNOSTIC_PLAN.md` for the decision tree these fields feed.
 */
import { isWebView } from "@cxr/platform/device";

/** Default gap between the two samples — long enough for deltas to be meaningful. */
const DEFAULT_SAMPLE_DELAY_MS = 800;

/**
 * `HTMLMediaElement.HAVE_METADATA` — the point at which track lists are
 * populated. Spelled as a literal rather than read off the element so the check
 * still works on a partial test double or a host that omits the constants.
 */
const HAVE_METADATA = 1;

/**
 * Non-standard WebKit media extras.
 *
 * `webkitAudioDecodedByteCount` was the ideal signal — a running count of audio
 * bytes handed to the decoder — but it is **absent on current iOS** (verified via
 * Safari Web Inspector on-device: `typeof` is `"undefined"`). Kept because it is
 * still present on some older WebKit builds and desktop Safari versions, where it
 * is the strongest available proof; the diagnostic no longer depends on it.
 *
 * `webkitHasAudio` is likewise unsupported on current iOS.
 */
type WebkitMedia = HTMLMediaElement & {
  webkitAudioDecodedByteCount?: number;
  webkitHasAudio?: boolean;
};

/** One diagnostic snapshot of a media element, plus any caller-supplied context. */
export interface AudioDiagnosticSnapshot extends Record<string, unknown> {
  /** Best-effort webview detection — the reported symptom is webview-specific. */
  is_webview: boolean;
  /** The element's real `muted`, not the app's or the SDK's idea of it. */
  element_muted: boolean;
  /**
   * The element's real `volume`. NOTE on iOS this is always `1`: the platform
   * ignores programmatic volume writes entirely (hardware buttons only), so a
   * `1` here does NOT mean our configured level failed to apply.
   *
   * Three independent views of volume land on each event, and the gaps between
   * them are the diagnostic:
   *   - `volume` / `is_muted` (analytics base context, from PlayerProvider) — what
   *     the CXR app believes.
   *   - `configured_volume` (this payload) — what the strategy/GIV intended.
   *   - `element_volume` (this field) — what the DOM element actually reports.
   * All three agreeing on "audible" while the user hears nothing is the native
   * case. `volume: 0` / `is_muted: true` instead means the app muted itself.
   */
  element_volume: number;
  paused: boolean;
  ready_state: number;
  /**
   * Decoded-audio byte count, or `null` where the counter is unsupported — which
   * is the case on current iOS. `null` means "unknown", never "no audio".
   */
  audio_decoded_bytes: number | null;
  /**
   * True only when the decode counter was present AND climbed. On current iOS the
   * counter is missing, so this is `false` and carries no information — read
   * `has_audio_track` + `time_advancing` instead.
   */
  audio_decoding: boolean;
  /** True when `currentTime` advanced between samples — playback is progressing. */
  time_advancing: boolean;
  /**
   * How far `currentTime` moved across the sample window, in ms. Quantifies what
   * `time_advancing` only booleans: ~800 means real-time playback, a small value
   * means limping, 0 means stalled. Distinguishes "played briefly then stopped"
   * from "never started" — which a boolean cannot.
   */
  time_advanced_ms: number;
  /** `currentTime` at the second sample, in ms — how far into the spot we are. */
  current_time_ms: number;
  /** Creative duration in ms where known, else `null`; pairs with the above. */
  duration_ms: number | null;
  /**
   * How many seconds of media are buffered ahead. A healthy audible spot has
   * buffer; `0` alongside `paused=false` points at a network/decode stall rather
   * than anything audio-session related.
   */
  buffered_ahead_s: number | null;
  /** `networkState` — separates "still loading" from "loaded and idle/stalled". */
  network_state: number;
  /**
   * Whether the media actually carries an audio track, from `audioTracks.length`
   * (works on current iOS) falling back to the decode counter / `webkitHasAudio`.
   * This is the field that separates "creative has no audio" (our bug) from
   * "audio is fine but silenced downstream" (not our bug).
   */
  has_audio_track: boolean;
  /**
   * Which signal `has_audio_track` came from, so the data is self-explaining.
   *
   * `awaitingMetadata` means `audioTracks` was empty but metadata had not loaded
   * yet — INCONCLUSIVE, not "no audio". Only `audioTracks` with
   * `has_audio_track: false` is evidence the creative genuinely carries none;
   * treating `awaitingMetadata` as that verdict would blame the creative for
   * what is really a slow network at sample time.
   */
  audio_track_source: "audioTracks" | "awaitingMetadata" | "decodedBytes" | "webkitHasAudio" | "unknown";
  /** Media URL being played, trimmed — confirms which element was sampled. */
  element_src: string | null;
  /**
   * How many media elements the slot contains. The audio-ad layout can render a
   * decorative content video alongside the audio transport, so >1 is possible —
   * it's here to catch a future layout change that adds another decoy.
   */
  media_element_count: number;
  /** State of a pre-existing `AudioContext`, if any; never constructs one. */
  audiocontext_state: string | null;
  /**
   * `navigator.audioSession.type` — WebKit-only, readable by default since
   * Safari 17. Reports the audio-session category the WEB CONTENT is under
   * ("auto" | "playback" | "ambient" | "transient" | ...). `null` where the API
   * is absent.
   *
   * Note this is the web-side view; the native host app's `AVAudioSession` is
   * still invisible to us, and per WebKit bug 167788 WKWebView has historically
   * ignored the host's category anyway.
   */
  audio_session_type: string | null;
  /**
   * `navigator.userActivation.hasBeenActive` — whether this document has EVER
   * had a user gesture (sticky activation). WebKit since Safari 17.
   *
   * This is the field that separates the two failure modes we could not tell
   * apart before: audio absent with NO gesture ever = a genuine no-gesture
   * autoplay attempt; audio absent AFTER a gesture = something else silenced it.
   */
  user_has_activated: boolean | null;
  /** `navigator.userActivation.isActive` — transient activation at sample time. */
  user_activation_active: boolean | null;
  /**
   * Whether the document was hidden at sample time. iOS suspends media in a
   * non-visible web view, so a hidden document explains silence without any
   * audio-session involvement — and would otherwise look like the native case.
   */
  document_hidden: boolean;
  /** `MediaError.code` when the element failed outright, else `null`. */
  media_error_code: number | null;
}

/**
 * Reads the decode counter, distinguishing "unsupported" from "zero bytes".
 *
 * Zero must not be reported as `null` (that would hide a real decode failure),
 * and unsupported must not be reported as `0` (that would look like one).
 */
function readDecodedBytes(el: HTMLMediaElement): number | null {
  const count = (el as WebkitMedia).webkitAudioDecodedByteCount;
  return typeof count === "number" ? count : null;
}

/**
 * Seconds of media buffered ahead of the playhead, or `null` when unknown.
 *
 * Distinguishes a network/decode stall (nothing buffered while unpaused) from the
 * audio-session case (healthy buffer, playing, still silent).
 */
function readBufferedAhead(el: HTMLMediaElement): number | null {
  // `buffered` can throw InvalidStateError on a detached/errored element, and
  // start()/end() throw IndexSizeError if the ranges mutate between the length
  // check and the read. Diagnostics must never surface as a page error.
  try {
    const ranges = el.buffered;
    if (!ranges || ranges.length === 0) return null;
    const now = el.currentTime;
    for (let i = 0; i < ranges.length; i += 1) {
      if (now >= ranges.start(i) && now <= ranges.end(i)) {
        return Math.max(0, ranges.end(i) - now);
      }
    }
    return 0;
  } catch {
    return null;
  }
}

/** Finite, non-negative duration in ms, else `null` (live/unknown streams). */
function readDurationMs(el: HTMLMediaElement): number | null {
  const duration = el.duration;
  return typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? Math.round(duration * 1000) : null;
}

/**
 * Reads `navigator.audioSession.type` (WebKit-only, readable by default since
 * Safari 17). Read-only — never assigns, since setting it would change playback
 * routing for a live ad.
 *
 * `AudioSession.state` (which would expose interruption) is deliberately NOT used:
 * WebKit gates it behind the `DOMAudioSessionFullEnabled` flag, off by default, so
 * it is `undefined` in the field.
 */
function readAudioSessionType(): string | null {
  try {
    const session = (navigator as Navigator & { audioSession?: { type?: string } }).audioSession;
    return typeof session?.type === "string" ? session.type : null;
  } catch {
    return null;
  }
}

/**
 * Reads the User Activation API (WebKit since Safari 17) — whether a user gesture
 * has ever occurred in this document, and whether one is transiently active.
 *
 * Distinguishes "no-gesture autoplay attempt" from "silent even after a tap",
 * which the beacon previously could not separate.
 */
function readUserActivation(): { hasBeenActive: boolean | null; isActive: boolean | null } {
  try {
    const ua = (
      navigator as Navigator & {
        userActivation?: { hasBeenActive?: boolean; isActive?: boolean };
      }
    ).userActivation;
    if (!ua) return { hasBeenActive: null, isActive: null };
    return {
      hasBeenActive: typeof ua.hasBeenActive === "boolean" ? ua.hasBeenActive : null,
      isActive: typeof ua.isActive === "boolean" ? ua.isActive : null,
    };
  } catch {
    return { hasBeenActive: null, isActive: null };
  }
}

/**
 * Determines whether the media genuinely carries audio, and says how it knows.
 *
 * Ordered by reliability on the platform we actually care about: `audioTracks` is
 * populated on current iOS (verified on-device), whereas the decode counter is
 * gone. Reporting the source keeps a `false` here interpretable — "no audio in
 * the creative" vs "we couldn't tell".
 *
 * An EMPTY `audioTracks` is only evidence of "no audio" once metadata has
 * loaded. Before that the list is legitimately empty on a creative that does
 * carry audio, so reporting `audioTracks` + `false` there would let a slow
 * network masquerade as the creative defect this beacon exists to detect (the
 * "ours" branch of the decision table). Below `HAVE_METADATA` an empty list is
 * reported as `awaitingMetadata` — inconclusive, not a verdict. A NON-empty
 * list is trustworthy whenever it appears, so it is honoured regardless.
 */
function readAudioTrack(el: HTMLMediaElement): {
  hasAudio: boolean;
  source: AudioDiagnosticSnapshot["audio_track_source"];
} {
  try {
    const tracks = (el as HTMLMediaElement & { audioTracks?: { length: number } }).audioTracks;
    if (tracks && typeof tracks.length === "number") {
      if (tracks.length > 0) return { hasAudio: true, source: "audioTracks" };
      // Empty list: only downgrade to "inconclusive" on a KNOWN pre-metadata
      // readyState. A non-numeric readyState (partial host object) must not
      // silently reroute every real verdict to awaitingMetadata — an unreadable
      // readyState is no reason to distrust an empty list, so fall through to
      // the pre-existing `audioTracks` verdict as before.
      const readyState = el.readyState;
      if (typeof readyState === "number" && readyState < HAVE_METADATA) {
        return { hasAudio: false, source: "awaitingMetadata" };
      }
      return { hasAudio: false, source: "audioTracks" };
    }

    const bytes = readDecodedBytes(el);
    if (bytes !== null) return { hasAudio: bytes > 0, source: "decodedBytes" };

    const webkitHasAudio = (el as WebkitMedia).webkitHasAudio;
    if (typeof webkitHasAudio === "boolean") {
      return { hasAudio: webkitHasAudio, source: "webkitHasAudio" };
    }

    return { hasAudio: false, source: "unknown" };
  } catch {
    return { hasAudio: false, source: "unknown" };
  }
}

/**
 * Picks the media element that actually carries the ad's audio.
 *
 * A naive `querySelector("video, audio")` is WRONG here: the audio-ad layout
 * appends a decorative, muted, audio-less **content video** BEFORE the real
 * audio transport, so first-match-wins samples the decoy — reporting
 * `has_audio_track: false` and `element_volume: 1` while the actual audio
 * element sits later in the DOM at the configured volume.
 *
 * Ranks every candidate instead, deliberately avoiding the SDK's internal class
 * names (not a contract, and they differ per layout version). The ranking must
 * NOT lean on `webkitAudioDecodedByteCount` — it is absent on current iOS, so
 * every candidate would tie there and document order would decide:
 *   1. carries an audio track and is unmuted — the ad's audio transport
 *   2. carries an audio track at all
 *   3. has a media source AND is hidden — the audio path renders the transport
 *      `display: none`, while the decorative content video is visible. Without
 *      this tier, an ad whose creative genuinely has NO audio track ties with
 *      the decoy on "has a source" and document order picks the decoy — losing
 *      exactly the case this beacon exists to prove.
 *   4. has a media source (decoys like IMA's placeholder have no `src`)
 *   5. first candidate, so a single-element slot still reports
 *
 * @param root Container to search — the slot node we handed the SDK.
 */
export function findAudioElement(root: ParentNode): HTMLMediaElement | null {
  const [firstCandidate, ...rest] = Array.from(root.querySelectorAll<HTMLMediaElement>("video, audio"));
  if (!firstCandidate) return null;

  // `display: none` distinguishes the hidden ad transport from the visible decoy.
  // Guarded: getComputedStyle can throw on a detached element, and treating an
  // unknown as "not hidden" just falls back to the old source-only ranking.
  const isHidden = (el: HTMLMediaElement): boolean => {
    try {
      return getComputedStyle(el).display === "none";
    } catch {
      return false;
    }
  };

  const score = (el: HTMLMediaElement): number => {
    const { hasAudio } = readAudioTrack(el);
    if (hasAudio && !el.muted) return 4;
    if (hasAudio) return 3;
    if (el.currentSrc || el.getAttribute("src")) return isHidden(el) ? 2 : 1;
    return 0;
  };

  // Stable: keeps the earlier element on a tie, so a single-candidate slot (and
  // the pre-decode window) behaves exactly like the old first-match.
  return rest.reduce((best, el) => (score(el) > score(best) ? el : best), firstCandidate);
}

/**
 * Best-effort read of an existing `AudioContext`'s state.
 *
 * Deliberately does NOT construct one: instantiating an `AudioContext` has real
 * side effects on iOS (it can claim the audio session). Since nothing in this
 * package creates one today, this is expected to be `null` in practice and is
 * here to catch a future path that does.
 */
function probeAudioContextState(): string | null {
  const existing = (globalThis as { __cxrAudioContext?: { state?: string } }).__cxrAudioContext;
  return typeof existing?.state === "string" ? existing.state : null;
}

/**
 * Samples a media element twice, `delayMs` apart, and resolves the deltas.
 *
 * @param el      The live ad media element (GenAd renders a real `<video>` into
 *                our container — for the audio-ad path it is `display: none`).
 * @param extra   Caller context merged into the snapshot (e.g.
 *                `wants_audible_ad_start`, `configured_volume`).
 * @param delayMs Gap between samples. Defaults to 800ms.
 *
 * @example
 * const snapshot = await sampleAudioDiagnostic(mediaEl, { configured_volume: 0.2 });
 * sendEvent(EVENT.AUDIO_DIAGNOSTIC, snapshot);
 */
export function sampleAudioDiagnostic(
  target: HTMLMediaElement | ParentNode,
  extra: Record<string, unknown>,
  delayMs: number = DEFAULT_SAMPLE_DELAY_MS
): Promise<AudioDiagnosticSnapshot | null> {
  // Accepting the container (not just an element) lets us re-resolve which
  // element carries the audio at SAMPLE time. Before playback starts nothing has
  // decoded yet, so an up-front pick cannot tell the real audio transport from a
  // decorative content video — by the second sample it can.
  const isElement = "currentTime" in (target as HTMLMediaElement);
  // Non-null by contract: an element target is itself, and a container target is
  // guarded by the caller (which returns early when the slot holds no media).
  const resolveEl = (): HTMLMediaElement =>
    isElement ? (target as HTMLMediaElement) : (findAudioElement(target as ParentNode) as HTMLMediaElement);

  // A container target with no media resolves to null; callers guard, but never
  // assume — an element torn down between the guard and here must not throw.
  const first = resolveEl();
  const bytesBefore = first ? readDecodedBytes(first) : null;
  const timeBefore = first ? first.currentTime : 0;

  return new Promise<AudioDiagnosticSnapshot | null>((resolve) => {
    setTimeout(() => {
      // Everything below runs inside a setTimeout, so a throw here would be an
      // UNCAUGHT exception in the publisher's page — not a rejected promise.
      // Resolve null on any failure: a missing diagnostic is always preferable to
      // a console error we caused on someone else's site.
      try {
        // Re-resolve: with real decode evidence available now, this corrects an
        // early pick that landed on a silent decoy.
        const el = resolveEl();
        if (!el) {
          resolve(null);
          return;
        }
        const sameElement = el === first;
        const bytesAfter = readDecodedBytes(el);

        const track = readAudioTrack(el);
        const activation = readUserActivation();

        resolve({
          is_webview: isWebView(),
          element_muted: el.muted,
          element_volume: el.volume,
          paused: el.paused,
          ready_state: el.readyState,
          audio_decoded_bytes: bytesAfter,
          // Legacy signal, kept for the WebKit builds that still expose the counter
          // (absent on current iOS). A mid-sample element switch makes the delta
          // meaningless, so it only counts when both samples came from one element.
          audio_decoding: sameElement && bytesBefore !== null && bytesAfter !== null && bytesAfter > bytesBefore,
          time_advancing: sameElement ? el.currentTime > timeBefore : el.currentTime > 0,
          time_advanced_ms: Math.round(Math.max(0, sameElement ? el.currentTime - timeBefore : el.currentTime) * 1000),
          current_time_ms: Math.round(el.currentTime * 1000),
          duration_ms: readDurationMs(el),
          buffered_ahead_s: readBufferedAhead(el),
          network_state: el.networkState,
          has_audio_track: track.hasAudio,
          audio_track_source: track.source,
          element_src: el.currentSrc || el.getAttribute("src") || null,
          media_element_count: isElement ? 1 : (target as ParentNode).querySelectorAll("video, audio").length,
          audiocontext_state: probeAudioContextState(),
          audio_session_type: readAudioSessionType(),
          user_has_activated: activation.hasBeenActive,
          user_activation_active: activation.isActive,
          document_hidden: document.hidden,
          media_error_code: el.error ? el.error.code : null,
          ...extra,
        });
      } catch {
        resolve(null);
      }
    }, delayMs);
  });
}
