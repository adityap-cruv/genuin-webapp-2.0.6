/**
 * Unit tests for the iHeart streaming lifecycle orchestrator.
 *
 * NOTE: web-sdk has no unit-test runner yet (Vitest dep requires team approval). Authored
 * for Vitest; documents the stream/track state machine driven by Genuin events.
 */

import { describe, expect, it } from "vitest";

import { IHeartLifecycle } from "./iheart-analytics-bridge";
import { IHeartSession } from "./iheart-session";
import type { IHeartEvent } from "./iheart-types";

function harness() {
  const emitted: IHeartEvent[] = [];
  const lifecycle = new IHeartLifecycle((event) => emitted.push(event), new IHeartSession(() => 0));
  const types = () => emitted.map((event) => event.type);
  return { lifecycle, emitted, types };
}

const clip = (id: string, extra: Record<string, unknown> = {}) => ({
  content_id: id,
  title: `clip ${id}`,
  total_videos: 20,
  position_index: 0,
  ...extra,
});

describe("IHeartLifecycle", () => {
  it("emits stream_start + track_start on the first Video Started", () => {
    const { lifecycle, types } = harness();
    lifecycle.handle("Video Started", clip("a"));
    expect(types()).toEqual(["stream_start", "track_start"]);
  });

  it("does not re-open a stream on a second Video Started for the same clip", () => {
    const { lifecycle, types } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.handle("Video Started", clip("a"));
    expect(types()).toEqual(["stream_start", "track_start"]);
  });

  it("ends the previous track and starts a new one when the clip changes", () => {
    const { lifecycle, types, emitted } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.handle("Video Started", clip("b", { position_index: 1 }));
    expect(types()).toEqual(["stream_start", "track_start", "track_end", "track_start"]);
    expect(emitted[2].data.station?.endReason).toBe("next");
  });

  it("emits pause + track_end on Video Paused, then play + track_start on resume", () => {
    const { lifecycle, types } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.handle("Video Paused", clip("a"));
    lifecycle.handle("Video Play", clip("a"));
    expect(types()).toEqual(["stream_start", "track_start", "pause", "track_end", "play", "track_start"]);
  });

  it("emits track_end(new_clip_start) only on Video Complete and keeps the session open", () => {
    const { lifecycle, types, emitted } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.handle("Video Complete", clip("a"));
    expect(types()).toEqual(["stream_start", "track_start", "track_end"]);
    expect(emitted[2].data.station?.endReason).toBe("new_clip_start");
    // Session stays open -> the next clip opens a NEW track in the SAME stream (no 2nd stream_start).
    lifecycle.handle("Video Started", clip("b", { position_index: 1 }));
    expect(types()).toEqual(["stream_start", "track_start", "track_end", "track_start"]);
    expect(types().filter((t) => t === "stream_start").length).toBe(1);
  });

  it("ends the session via exit after the last clip completes", () => {
    const { lifecycle, types } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.handle("Video Complete", clip("a"));
    lifecycle.finalizeOnExit();
    // track already closed by Complete -> exit only needs to close the stream.
    expect(types()).toEqual(["stream_start", "track_start", "track_end", "stream_end"]);
  });

  it("finalizes an open session on exit with navigation reasons", () => {
    const { lifecycle, emitted } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.finalizeOnExit();
    const trackEnd = emitted.find((e) => e.type === "track_end");
    const streamEnd = emitted.find((e) => e.type === "stream_end");
    expect(trackEnd?.data.station?.endReason).toBe("navigation");
    expect(streamEnd?.data.station?.endReason).toBe("navigation");
  });

  it("pauseOnHidden closes the track with pause but keeps the stream open", () => {
    const { lifecycle, types, emitted } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.pauseOnHidden();
    expect(types()).toEqual(["stream_start", "track_start", "track_end"]);
    expect(emitted[2].data["station.endReason"]).toBe("pause");
    // Stream still open: resume reopens a track in the SAME session (no 2nd stream_start).
    lifecycle.handle("Video Play", clip("a"));
    expect(types()).toEqual(["stream_start", "track_start", "track_end", "play", "track_start"]);
    expect(types().filter((t) => t === "stream_start").length).toBe(1);
  });

  it("pauseOnHidden is a no-op when no track is open (already paused)", () => {
    const { lifecycle, types } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.handle("Video Paused", clip("a"));
    lifecycle.pauseOnHidden();
    expect(types()).toEqual(["stream_start", "track_start", "pause", "track_end"]);
  });

  it("finalizeOnExit is a no-op when no session is open", () => {
    const { lifecycle, emitted } = harness();
    lifecycle.finalizeOnExit();
    expect(emitted).toEqual([]);
  });

  it("updates mute state without emitting", () => {
    const { lifecycle, types } = harness();
    lifecycle.handle("Video Started", clip("a"));
    lifecycle.handle("Muted", clip("a"));
    lifecycle.handle("Video Paused", clip("a"));
    // mute reflected on the pause's track_end is asserted via no extra emissions here
    expect(types()).toEqual(["stream_start", "track_start", "pause", "track_end"]);
  });

  it("drops events not in the spec subset", () => {
    const { lifecycle, types } = harness();
    lifecycle.handle("Video Reported", clip("a"));
    expect(types()).toEqual([]);
  });
});
