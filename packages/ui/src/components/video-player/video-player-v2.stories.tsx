import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useEffect, useRef, useState } from "react";

import { SAMPLE_AD_TAGS } from "./sample-ad-tags";
import { VideoElementProvider } from "./video-element-provider";
import { VideoPlayerV2 } from "./video-player-v2";

/**
 * Public Big Buck Bunny test MP4. (The Google `commondatastorage` bucket the
 * V1 stories point at is no longer publicly readable — it returns 403, which
 * surfaces as `error.code=4 / NETWORK_NO_SOURCE` only after a pre-roll because
 * `preload="none"` defers the load until `play()` runs.)
 */
const SAMPLE_SRC = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4";

/**
 * Ad lifecycle CustomEvents dispatched on the `<video>` by the ad layer. The
 * playground subscribes to these to make the pre-roll's pause visible.
 */
const AD_EVENTS: readonly string[] = [
  "genuin:ad-started",
  "genuin:ad-pause",
  "genuin:ad-completed",
  "genuin:ad-all-completed",
];

const meta: Meta<typeof VideoPlayerV2> = {
  title: "UI/VideoPlayerV2",
  component: VideoPlayerV2,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof VideoPlayerV2>;

/**
 * Manual verification harness for IMPROVEMENT-003: pausing mid-ad must stop the
 * pre-roll immediately. Renders V2 with a real IMA pre-roll and an external
 * Play/Pause toggle so a human can start the ad, pause it, and confirm the ad
 * audio/video halts (watch for `genuin:ad-pause` in the event log below).
 */
function AdPausePlayground() {
  const [play, setPlay] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  // Remount key. Storybook soft-reloads (HMR) keep the module-level IMA SDK and
  // the per-provider registry warm across "refreshes", so the ad won't re-request
  // on a soft reload. Bumping this key forces VideoPlayerV2 to unmount → release
  // (parking the shared entry, destroying its AdsLayer on the next src cycle) and
  // remount → fresh claim, which rebuilds the ad break without a server restart.
  const [mountKey, setMountKey] = useState(0);
  // Tracks the element + its bound listeners so we can detach cleanly when the
  // registry releases the <video> (V2 calls ref(null) on release).
  const boundRef = useRef<{
    el: HTMLVideoElement;
    bindings: { name: string; listener: EventListener }[];
  } | null>(null);

  const appendLog = useCallback((entry: string) => {
    const stamped = `${new Date().toLocaleTimeString()} — ${entry}`;
    // Keep only the last ~10 events so the panel stays lightweight.
    setLog((prev) => [...prev.slice(-9), stamped]);
  }, []);

  const detach = useCallback(() => {
    const bound = boundRef.current;
    if (!bound) return;
    for (const { name, listener } of bound.bindings) {
      bound.el.removeEventListener(name, listener);
    }
    boundRef.current = null;
  }, []);

  // V2 exposes the underlying <video> via its callback `ref`. We attach the
  // ad-event listeners when the element arrives and tear them down on release.
  const handleVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      detach();
      if (!el) return;
      const bindings = AD_EVENTS.map((name) => {
        const listener: EventListener = () => appendLog(name);
        el.addEventListener(name, listener);
        return { name, listener };
      });
      boundRef.current = { el, bindings };
    },
    [appendLog, detach]
  );

  // Defensive cleanup if the story unmounts while a video is still claimed.
  useEffect(() => detach, [detach]);

  return (
    // Side-by-side layout so the Play/Pause toggle and event log are always in
    // view next to the player. The player box is a fixed 9:16 portrait surface;
    // placing the controls in a separate column (rather than stacked below a
    // 640px-tall box) keeps them on-screen within the Storybook canvas instead
    // of pushed below the fold.
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        flexWrap: "wrap",
        fontFamily: "monospace",
      }}>
      <div
        style={{
          position: "relative",
          width: 270,
          height: 480,
          flex: "0 0 auto",
          backgroundColor: "#000",
          overflow: "hidden",
        }}>
        <VideoPlayerV2
          key={mountKey}
          src={SAMPLE_SRC}
          adUrl={SAMPLE_AD_TAGS.PRE_ROLL}
          play={play}
          muted={false}
          ref={handleVideoRef}
        />
      </div>

      <div style={{ flex: "1 1 240px", minWidth: 240 }}>
        <p style={{ marginTop: 0, marginBottom: 12, fontSize: 13 }}>
          Press Play to start the pre-roll ad, then Press Pause mid-ad — the ad should stop immediately.
        </p>

        <button
          type="button"
          data-testid="v2-play-toggle"
          onClick={() => setPlay((prev) => !prev)}
          style={{
            alignSelf: "flex-start",
            padding: "12px 28px",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 700,
            color: "#ffffff",
            background: play ? "#b91c1c" : "#15803d",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}>
          {play ? "⏸ Pause ad" : "▶ Play (start ad)"}
        </button>

        <button
          type="button"
          data-testid="v2-reset-ad"
          onClick={() => {
            setPlay(false);
            setMountKey((prev) => prev + 1);
            appendLog("reset — remounting player");
          }}
          style={{
            marginLeft: 12,
            padding: "12px 20px",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 600,
            color: "#1f2937",
            background: "#e5e7eb",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}>
          ↻ Reset / re-request ad
        </button>

        <div
          style={{
            marginTop: 12,
            padding: 8,
            minHeight: 120,
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: "pre-wrap",
          }}>
          <strong>Ad event log</strong>
          {log.length === 0 ? (
            <div style={{ marginTop: 4, color: "#888" }}>No ad events yet.</div>
          ) : (
            log.map((entry, index) => (
              <div key={`${index}-${entry}`} style={{ marginTop: 4 }}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export const AdPauseToggle: Story = {
  name: "Ad Pause Toggle (IMPROVEMENT-003)",
  render: () => (
    <VideoElementProvider>
      <AdPausePlayground />
    </VideoElementProvider>
  ),
};

/**
 * Public HLS test streams used to exercise the swap-back resume path. Both ship
 * permissive CORS so hls.js can fetch their playlists + segments from any origin.
 */
const HLS_SOURCES: ReadonlyArray<{ label: string; src: string }> = [
  {
    label: "Apple BipBop",
    src: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
  },
  {
    label: "Mux BBB",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
];

/**
 * Native `<video>` events that signal a fresh load / playback resumption. The
 * Network panel is the ground truth for IMPROVEMENT-002, but these events line
 * up the timeline so the human tester knows when the swap-back fetch starts.
 */
const HLS_EVENTS: readonly string[] = ["loadstart", "loadedmetadata", "playing"];

/**
 * Manual verification harness for IMPROVEMENT-002: swapping HLS sources back to
 * a previously-seen stream should resume from the stored position rather than
 * re-fetching from segment 0. Renders V2 with two HLS sources and a swap button
 * so a human can watch the Network panel for the segment range fetched on
 * swap-back.
 */
function HlsSwapPlayground() {
  const [srcIndex, setSrcIndex] = useState(0);
  const [play] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const boundRef = useRef<{
    el: HTMLVideoElement;
    bindings: { name: string; listener: EventListener }[];
  } | null>(null);

  const appendLog = useCallback((entry: string) => {
    const stamped = `${new Date().toLocaleTimeString()} — ${entry}`;
    setLog((prev) => [...prev.slice(-9), stamped]);
  }, []);

  const detach = useCallback(() => {
    const bound = boundRef.current;
    if (!bound) return;
    for (const { name, listener } of bound.bindings) {
      bound.el.removeEventListener(name, listener);
    }
    boundRef.current = null;
  }, []);

  const handleVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      detach();
      if (!el) return;
      const bindings = HLS_EVENTS.map((name) => {
        const listener: EventListener = () => appendLog(name);
        el.addEventListener(name, listener);
        return { name, listener };
      });
      boundRef.current = { el, bindings };
    },
    [appendLog, detach]
  );

  useEffect(() => detach, [detach]);

  // HLS_SOURCES is a non-empty const tuple; index 0 is always defined. We coerce
  // here so downstream JSX doesn't need to reckon with `possibly undefined` from
  // `noUncheckedIndexedAccess`.
  const FALLBACK = HLS_SOURCES[0] as (typeof HLS_SOURCES)[number];
  const currentSource = HLS_SOURCES[srcIndex] ?? FALLBACK;
  const nextSource = HLS_SOURCES[(srcIndex + 1) % HLS_SOURCES.length] ?? FALLBACK;

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        flexWrap: "wrap",
        fontFamily: "monospace",
      }}>
      <div
        style={{
          position: "relative",
          width: 270,
          height: 480,
          flex: "0 0 auto",
          backgroundColor: "#000",
          overflow: "hidden",
        }}>
        <VideoPlayerV2 src={currentSource.src} play={play} muted={true} ref={handleVideoRef} />
      </div>

      <div style={{ flex: "1 1 240px", minWidth: 240 }}>
        <p style={{ marginTop: 0, marginBottom: 12, fontSize: 13 }}>
          Press Play, let it buffer past ~10s, then Swap to B. After it starts playing, Swap back to A. Open DevTools →
          Network → filter <code>.ts</code> / <code>.m4s</code>; on swap-back, the first A segment fetched should be
          near the resume offset, not segment 0.
        </p>

        <p style={{ marginTop: 0, marginBottom: 12, fontSize: 12, color: "#555" }}>
          Currently playing: <strong>{currentSource.label}</strong>
        </p>

        <button
          type="button"
          data-testid="v2-hls-swap"
          onClick={() => {
            const next = (srcIndex + 1) % HLS_SOURCES.length;
            setSrcIndex(next);
            appendLog(`swap → ${HLS_SOURCES[next]?.label ?? "?"}`);
          }}
          style={{
            alignSelf: "flex-start",
            padding: "12px 28px",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 700,
            color: "#ffffff",
            background: "#1d4ed8",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}>
          ▶︎ Swap to {nextSource.label}
        </button>

        <div
          style={{
            marginTop: 12,
            padding: 8,
            minHeight: 120,
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: "pre-wrap",
          }}>
          <strong>Event log</strong>
          {log.length === 0 ? (
            <div style={{ marginTop: 4, color: "#888" }}>No events yet.</div>
          ) : (
            log.map((entry, index) => (
              <div key={`${index}-${entry}`} style={{ marginTop: 4 }}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export const HlsSwapResume: Story = {
  name: "HLS Swap Resume (IMPROVEMENT-002)",
  render: () => (
    <VideoElementProvider>
      <HlsSwapPlayground />
    </VideoElementProvider>
  ),
};

/**
 * Manual verification harness for IMPROVEMENT-001: opening expand view while an
 * ad is actively playing in the embed slot, then closing expand, must leave the
 * embed slot showing the original `<video>` (and ad) intact. Renders TWO
 * `VideoPlayerV2` instances pointing at the same `src` + `adUrl` so the second
 * one (expand) forces the registry's transient-mint path while the first
 * (embed) holds the shared `<video>`. The on-screen log captures ref
 * attach/detach, native `<video>` events, ad lifecycle events, and a snapshot
 * of each slot's DOM so a human tester can diagnose where the layout breaks.
 *
 * Per the doc the bug only reproduces while an ad is actively playing — that's
 * why the test sequence is: start ad → open expand (mid-ad) → close expand
 * (mid-ad) → inspect embed slot.
 */
const TRANSITION_AD_EVENTS: readonly string[] = [
  "genuin:ad-started",
  "genuin:ad-pause",
  "genuin:ad-completed",
  "genuin:ad-all-completed",
];

// Native `<video>` events that surface the symptoms described in the doc:
// `emptied` fires if the src is reset on the wrong element; `loadstart` /
// `loadedmetadata` mark fresh loads on the transient; `error` surfaces decode
// failures introduced by the transition.
const TRANSITION_VIDEO_EVENTS: readonly string[] = ["loadstart", "loadedmetadata", "playing", "error", "emptied"];

type SlotKey = "embed" | "expand";

type Bound = {
  el: HTMLVideoElement;
  bindings: { name: string; listener: EventListener }[];
};

function ExpandEmbedTransitionPlayground() {
  const [expandOpen, setExpandOpen] = useState(false);
  const [play, setPlay] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // One ref per slot so we can independently track which `<video>` each
  // `VideoPlayerV2` callback-ref hands back. When the registry mints a
  // transient for the second simultaneous claim, the two refs MUST be
  // different elements — if they're the same, the registry's transient
  // path is wrong.
  const embedSlotRef = useRef<HTMLDivElement>(null);
  const expandSlotRef = useRef<HTMLDivElement>(null);
  const embedBoundRef = useRef<Bound | null>(null);
  const expandBoundRef = useRef<Bound | null>(null);

  const appendLog = useCallback((entry: string) => {
    const stamped = `${new Date().toLocaleTimeString()} — ${entry}`;
    setLog((prev) => [...prev.slice(-19), stamped]);
  }, []);

  const detach = useCallback((boundRef: { current: Bound | null }) => {
    const bound = boundRef.current;
    if (!bound) return;
    for (const { name, listener } of bound.bindings) {
      bound.el.removeEventListener(name, listener);
    }
    boundRef.current = null;
  }, []);

  const makeRefHandler = useCallback(
    (slot: SlotKey, boundRef: { current: Bound | null }) => (el: HTMLVideoElement | null) => {
      detach(boundRef);
      if (!el) {
        appendLog(`[${slot}] ref(null) — release`);
        return;
      }
      // Tag the element so we can identify it later in the snapshot. The
      // attribute survives reparenting, so if the SAME element ends up in
      // both slots the snapshot will show two slots reporting the same tag.
      const existingTag = el.getAttribute("data-harness-tag");
      const tag = existingTag ?? `el-${Math.random().toString(36).slice(2, 7)}`;
      if (!existingTag) el.setAttribute("data-harness-tag", tag);
      appendLog(`[${slot}] ref(attach) tag=${tag}`);
      const bindings = [
        ...TRANSITION_VIDEO_EVENTS.map((name) => {
          const listener: EventListener = () => appendLog(`[${slot}/native] ${name}`);
          el.addEventListener(name, listener);
          return { name, listener };
        }),
        ...TRANSITION_AD_EVENTS.map((name) => {
          const listener: EventListener = () => appendLog(`[${slot}/ad] ${name}`);
          el.addEventListener(name, listener);
          return { name, listener };
        }),
      ];
      boundRef.current = { el, bindings };
    },
    [appendLog, detach]
  );

  const handleEmbedRef = useCallback(
    (el: HTMLVideoElement | null) => makeRefHandler("embed", embedBoundRef)(el),
    [makeRefHandler]
  );
  const handleExpandRef = useCallback(
    (el: HTMLVideoElement | null) => makeRefHandler("expand", expandBoundRef)(el),
    [makeRefHandler]
  );

  useEffect(() => {
    return () => {
      detach(embedBoundRef);
      detach(expandBoundRef);
    };
  }, [detach]);

  const snapshotSlots = useCallback(() => {
    const describe = (slot: SlotKey, slotEl: HTMLDivElement | null) => {
      if (!slotEl) return `[${slot}] slot ref is null`;
      const video = slotEl.querySelector("video");
      const container = slotEl.querySelector("[data-video-registry-container]");
      const freeze = slotEl.querySelector("[data-video-registry-freeze]");
      const rect = slotEl.getBoundingClientRect();
      const videoSrc = video?.getAttribute("src") ?? "(none)";
      const videoTag = video?.getAttribute("data-harness-tag") ?? "(none)";
      const adsContainer = slotEl.querySelector("[data-video-registry-ads]");
      const adsDisplay = (adsContainer as HTMLElement | null)?.style.display ?? "(no ads container)";
      return (
        `[${slot}] rect=${Math.round(rect.width)}x${Math.round(rect.height)}` +
        ` container=${container ? "yes" : "NO"}` +
        ` video=${video ? "yes" : "NO"}` +
        ` freeze=${freeze ? "yes" : "no"}` +
        ` tag=${videoTag} src=${videoSrc.slice(0, 40)}${videoSrc.length > 40 ? "…" : ""}` +
        ` adsDisplay=${adsDisplay}`
      );
    };
    appendLog("--- snapshot ---");
    appendLog(describe("embed", embedSlotRef.current));
    appendLog(describe("expand", expandSlotRef.current));
  }, [appendLog]);

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        flexWrap: "wrap",
        fontFamily: "monospace",
      }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <strong style={{ fontSize: 12 }}>Embed slot (270x480)</strong>
        <div
          ref={embedSlotRef}
          style={{
            position: "relative",
            width: 270,
            height: 480,
            flex: "0 0 auto",
            backgroundColor: "#000",
            overflow: "hidden",
          }}>
          <VideoPlayerV2
            src={SAMPLE_SRC}
            adUrl={SAMPLE_AD_TAGS.PRE_ROLL}
            play={play}
            muted={false}
            ref={handleEmbedRef}
          />
        </div>
      </div>

      {expandOpen ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <strong style={{ fontSize: 12 }}>Expand slot (405x720)</strong>
          <div
            ref={expandSlotRef}
            style={{
              position: "relative",
              width: 405,
              height: 720,
              flex: "0 0 auto",
              backgroundColor: "#111",
              overflow: "hidden",
              outline: "2px solid #facc15",
            }}>
            <VideoPlayerV2
              src={SAMPLE_SRC}
              adUrl={SAMPLE_AD_TAGS.PRE_ROLL}
              play={play}
              muted={false}
              ref={handleExpandRef}
            />
          </div>
        </div>
      ) : null}

      <div style={{ flex: "1 1 280px", minWidth: 280 }}>
        <p style={{ marginTop: 0, marginBottom: 12, fontSize: 13 }}>
          IMPROVEMENT-001 harness. Repro: <strong>1.</strong> Press Play — pre-roll starts in the embed slot.{" "}
          <strong>2.</strong> While the ad is playing (watch for <code>genuin:ad-started</code>), press{" "}
          <strong>Open Expand</strong> — registry mints a transient for the second claim. <strong>3.</strong> While the
          ad is still playing, press <strong>Close Expand</strong>. <strong>4.</strong> Press{" "}
          <strong>Snapshot slots</strong> and inspect the embed: it should still contain the original{" "}
          <code>&lt;video&gt;</code> with the ad overlay; if it&apos;s blank, the bug reproduced.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            data-testid="v2-transition-play-toggle"
            onClick={() => setPlay((prev) => !prev)}
            style={{
              padding: "10px 20px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              color: "#ffffff",
              background: play ? "#b91c1c" : "#15803d",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}>
            {play ? "⏸ Pause" : "▶ Play (start ad)"}
          </button>

          <button
            type="button"
            data-testid="v2-transition-expand-toggle"
            onClick={() => {
              setExpandOpen((prev) => {
                appendLog(prev ? "close expand" : "open expand");
                return !prev;
              });
            }}
            style={{
              padding: "10px 20px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              color: "#ffffff",
              background: expandOpen ? "#92400e" : "#1d4ed8",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}>
            {expandOpen ? "✕ Close Expand" : "⤢ Open Expand"}
          </button>

          <button
            type="button"
            data-testid="v2-transition-snapshot"
            onClick={snapshotSlots}
            style={{
              padding: "10px 20px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              color: "#1f2937",
              background: "#e5e7eb",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}>
            📸 Snapshot slots
          </button>

          <button
            type="button"
            data-testid="v2-transition-clear"
            onClick={() => setLog([])}
            style={{
              padding: "10px 20px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              color: "#1f2937",
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}>
            🧹 Clear log
          </button>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 8,
            minHeight: 240,
            maxHeight: 480,
            overflow: "auto",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "pre-wrap",
            background: "#fafafa",
          }}>
          <strong>Event log (newest at bottom)</strong>
          {log.length === 0 ? (
            <div style={{ marginTop: 4, color: "#888" }}>No events yet.</div>
          ) : (
            log.map((entry, index) => (
              <div key={`${index}-${entry}`} style={{ marginTop: 2 }}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export const ExpandEmbedTransition: Story = {
  name: "Expand→Embed Transition (IMPROVEMENT-001)",
  render: () => (
    <VideoElementProvider>
      <ExpandEmbedTransitionPlayground />
    </VideoElementProvider>
  ),
};
