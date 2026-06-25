import { describe, expect, it, vi } from "vitest";

import { addEventListener, dispatchEvent } from "@cxr/utils/eventBus";

describe("eventBus", () => {
  it("does not throw when no listener is attached", () => {
    expect(() => dispatchEvent("video:expand", {})).not.toThrow();
  });

  it("delivers detail to a registered listener", () => {
    const handler = vi.fn();
    const off = addEventListener("genai:videoId", handler);
    dispatchEvent("genai:videoId", { videoId: "abc" });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ videoId: "abc" });
    off();
  });

  it("returns an unsubscribe function that stops further deliveries", () => {
    const handler = vi.fn();
    const off = addEventListener("genai:videoId", handler);
    dispatchEvent("genai:videoId", { videoId: "one" });
    off();
    dispatchEvent("genai:videoId", { videoId: "two" });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ videoId: "one" });
  });

  it("delivers to every attached listener", () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = addEventListener("genad:destroy", a);
    const offB = addEventListener("genad:destroy", b);
    dispatchEvent("genad:destroy", {});
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    offA();
    offB();
  });

  it("does not invoke listeners attached to a different name", () => {
    const handler = vi.fn();
    const off = addEventListener("genai:onFill", handler);
    dispatchEvent("genai:onNoFill", {});
    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it("passes an empty-object detail for events with no payload", () => {
    const handler = vi.fn();
    const off = addEventListener("genai:onFill", handler);
    dispatchEvent("genai:onFill", {});
    expect(handler).toHaveBeenCalledWith({});
    off();
  });
});
