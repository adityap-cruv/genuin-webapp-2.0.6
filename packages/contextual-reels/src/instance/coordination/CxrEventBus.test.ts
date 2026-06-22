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
    const off = bus.on("genai:chatClosed", handler);
    bus.emit("genai:chatClosed", { identifier: "one" });
    off();
    bus.emit("genai:chatClosed", { identifier: "two" });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ identifier: "one" });
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
});
