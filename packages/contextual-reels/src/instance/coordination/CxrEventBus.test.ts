// packages/contextual-reels/src/instance/coordination/CxrEventBus.test.ts
import { describe, it, expect, vi } from "vitest";

import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

describe("CxrEventBus", () => {
  it("delivers detail to a registered listener", () => {
    const bus = new CxrEventBus();
    const handler = vi.fn();
    bus.on("genai:videoId", handler);
    bus.emit("genai:videoId", { videoId: "abc" });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ videoId: "abc" });
  });

  it("returns an off() function that stops further deliveries", () => {
    const bus = new CxrEventBus();
    const handler = vi.fn();
    const off = bus.on("genai:videoId", handler);
    bus.emit("genai:videoId", { videoId: "one" });
    off();
    bus.emit("genai:videoId", { videoId: "two" });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ videoId: "one" });
  });

  it("delivers to every listener attached to the same event", () => {
    const bus = new CxrEventBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.on("genad:destroy", a);
    bus.on("genad:destroy", b);
    bus.emit("genad:destroy", {});
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("does not deliver to listeners on a different event name", () => {
    const bus = new CxrEventBus();
    const handler = vi.fn();
    bus.on("genai:onFill", handler);
    bus.emit("genai:onNoFill", {});
    expect(handler).not.toHaveBeenCalled();
  });

  it("two independent buses do not cross-contaminate", () => {
    const busA = new CxrEventBus();
    const busB = new CxrEventBus();
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    busA.on("genai:videoId", handlerA);
    busB.on("genai:videoId", handlerB);
    busA.emit("genai:videoId", { videoId: "from-a" });
    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).not.toHaveBeenCalled();
  });

  describe("hasFired latch", () => {
    it("reports false before an event has fired and true after", () => {
      const bus = new CxrEventBus();
      expect(bus.hasFired("mute:unmuted")).toBe(false);
      bus.emit("mute:unmuted", {});
      expect(bus.hasFired("mute:unmuted")).toBe(true);
    });

    it("latches independently per event name", () => {
      const bus = new CxrEventBus();
      bus.emit("mute:unmuted", {});
      expect(bus.hasFired("mute:unmuted")).toBe(true);
      expect(bus.hasFired("fullscreen:enter")).toBe(false);
    });

    it("is observable even with no subscriber at emit time (late reader)", () => {
      const bus = new CxrEventBus();
      bus.emit("mute:unmuted", {}); // nobody subscribed yet
      // A consumer that mounts later can still learn it happened.
      expect(bus.hasFired("mute:unmuted")).toBe(true);
    });

    it("does not cross-contaminate between independent buses", () => {
      const busA = new CxrEventBus();
      const busB = new CxrEventBus();
      busA.emit("mute:unmuted", {});
      expect(busA.hasFired("mute:unmuted")).toBe(true);
      expect(busB.hasFired("mute:unmuted")).toBe(false);
    });
  });
});
