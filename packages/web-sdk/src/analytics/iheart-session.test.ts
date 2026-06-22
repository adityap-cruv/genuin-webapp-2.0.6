/**
 * Unit tests for the iHeart session lifecycle engine.
 *
 * NOTE: web-sdk currently has no unit-test runner (only Playwright E2E). These specs are
 * authored for Vitest and will run once a runner is added to the package (a new dev
 * dependency — requires team approval per CLAUDE.md). Until then they serve as executable
 * documentation of the session state machine.
 */

import { describe, expect, it } from "vitest";

import { IHeartSession } from "./iheart-session";

/** Deterministic clock for listenTime assertions. */
function fakeClock() {
  let now = 0;
  const clock = () => now;
  return { clock, advanceMs: (ms: number) => (now += ms) };
}

describe("IHeartSession", () => {
  it("starts inactive and becomes active on startStream", () => {
    const session = new IHeartSession();
    expect(session.isActive).toBe(false);
    session.startStream();
    expect(session.isActive).toBe(true);
  });

  it("generates a sessionId stable across the session", () => {
    const session = new IHeartSession();
    session.startStream();
    const first = session.snapshot().sessionId;
    session.openTrack("clip-2", 2, 10);
    expect(session.snapshot().sessionId).toBe(first);
    expect(first).not.toBe("");
  });

  it("keeps the same sessionId when startStream is called again while active", () => {
    const session = new IHeartSession();
    session.startStream();
    const id = session.snapshot().sessionId;
    session.startStream();
    expect(session.snapshot().sessionId).toBe(id);
  });

  it("resets clip/track state and sessionId scope on endStream", () => {
    const session = new IHeartSession();
    session.startStream();
    session.openTrack("clip-1", 1, 0);
    session.endStream();
    expect(session.isActive).toBe(false);
    expect(session.isTrackOpen).toBe(false);
    expect(session.clipId).toBeNull();
  });

  it("tracks the open clip and track-open flag", () => {
    const session = new IHeartSession();
    session.startStream();
    expect(session.isTrackOpen).toBe(false);
    session.openTrack("clip-1", 1, 0);
    expect(session.isTrackOpen).toBe(true);
    expect(session.clipId).toBe("clip-1");
    session.closeTrack();
    expect(session.isTrackOpen).toBe(false);
  });

  it("starts muted (true) and toggles with setMute", () => {
    const session = new IHeartSession();
    session.startStream();
    expect(session.snapshot().streamIsMute).toBe(true);
    session.setMute(false);
    expect(session.snapshot().streamIsMute).toBe(false);
    session.setMute(true);
    expect(session.snapshot().streamIsMute).toBe(true);
  });

  it("clamps feed position/total to >= 1 integers", () => {
    const session = new IHeartSession();
    session.startStream();
    session.setFeedPosition(0);
    session.setFeedTotal(-5);
    expect(session.snapshot().streamFeedPosition).toBe(1);
    expect(session.snapshot().streamFeedTotal).toBe(1);
    session.setFeedPosition(5.9);
    expect(session.snapshot().streamFeedPosition).toBe(5);
  });

  it("accumulates listenTime in seconds since stream start", () => {
    const { clock, advanceMs } = fakeClock();
    const session = new IHeartSession(clock);
    session.startStream();
    advanceMs(52_400);
    expect(session.snapshot().listenTime).toBe(52);
  });

  it("reports zero listenTime once the stream ends", () => {
    const { clock, advanceMs } = fakeClock();
    const session = new IHeartSession(clock);
    session.startStream();
    advanceMs(10_000);
    session.endStream();
    expect(session.isActive).toBe(false);
    expect(session.snapshot().listenTime).toBe(0);
  });

  it("records the playhead start position on openTrack", () => {
    const session = new IHeartSession();
    session.startStream();
    session.openTrack("clip-3", 3, 52);
    expect(session.snapshot().startPosition).toBe(52);
    expect(session.snapshot().streamFeedPosition).toBe(3);
  });
});
