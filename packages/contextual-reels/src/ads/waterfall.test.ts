/**
 * Tests for ad waterfall — consolidated from:
 *   ads/waterfall.test.ts
 *   ads/waterfallCallbacks.test.ts
 *   ads/genaiBridge.test.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { notifyAdFill, notifyAdNoFill, installGenaiBridge } from "@cxr/ads/waterfall";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

// ─── notifyAdFill ─────────────────────────────────────────────────────────────

describe("ads/waterfall — notifyAdFill", () => {
  beforeEach(() => {
    delete (window as Window & { adFillCallback?: unknown }).adFillCallback;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Window & { adFillCallback?: unknown }).adFillCallback;
    delete (window as Window & { noAdsCallback?: unknown }).noAdsCallback;
  });

  it("calls window.adFillCallback when it is a function", () => {
    const cb = vi.fn();
    (window as Window & { adFillCallback: () => void }).adFillCallback = cb;
    notifyAdFill();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("does not throw when window.adFillCallback is not set", () => {
    expect(() => notifyAdFill()).not.toThrow();
  });

  it("catches and does not rethrow when adFillCallback throws", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    (window as Window & { adFillCallback: () => void }).adFillCallback = () => {
      throw new Error("cb error");
    };
    expect(() => notifyAdFill()).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("sends postMessage to parent when parent !== window", () => {
    const parentPostMessage = vi.fn();
    const originalParent = window.parent;

    Object.defineProperty(window, "parent", {
      value: { postMessage: parentPostMessage },
      writable: true,
      configurable: true,
    });

    notifyAdFill();

    expect(parentPostMessage).toHaveBeenCalledWith({ type: "adFillCallback" }, "*");

    Object.defineProperty(window, "parent", {
      value: originalParent,
      writable: true,
      configurable: true,
    });
  });

  it("does not send postMessage when parent === window (same frame)", () => {
    const spy = vi.spyOn(window.parent, "postMessage");
    notifyAdFill();
    expect(spy).not.toHaveBeenCalled();
  });
});

// ─── notifyAdNoFill ───────────────────────────────────────────────────────────

describe("ads/waterfall — notifyAdNoFill", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Window & { noAdsCallback?: unknown }).noAdsCallback;
  });

  it("calls window.noAdsCallback when it is a function", () => {
    const cb = vi.fn();
    (window as Window & { noAdsCallback: () => void }).noAdsCallback = cb;
    notifyAdNoFill();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("does not throw when window.noAdsCallback is not set", () => {
    expect(() => notifyAdNoFill()).not.toThrow();
  });

  it("catches and does not rethrow when noAdsCallback throws", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    (window as Window & { noAdsCallback: () => void }).noAdsCallback = () => {
      throw new Error("no-fill cb error");
    };
    expect(() => notifyAdNoFill()).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("sends postMessage to parent when parent !== window", () => {
    const parentPostMessage = vi.fn();
    const originalParent = window.parent;

    Object.defineProperty(window, "parent", {
      value: { postMessage: parentPostMessage },
      writable: true,
      configurable: true,
    });

    notifyAdNoFill();

    expect(parentPostMessage).toHaveBeenCalledWith({ type: "noAdsCallback" }, "*");

    Object.defineProperty(window, "parent", {
      value: originalParent,
      writable: true,
      configurable: true,
    });
  });
});

// ─── installGenaiBridge ───────────────────────────────────────────────────────

describe("ads/waterfall — installGenaiBridge", () => {
  it("calls onFill when genai:onFill is emitted on the bus", () => {
    const bus = new CxrEventBus();
    const onFill = vi.fn();
    const onNoFill = vi.fn();

    const cleanup = installGenaiBridge(bus, onFill, onNoFill);

    bus.emit("genai:onFill", {});
    expect(onFill).toHaveBeenCalledTimes(1);
    expect(onNoFill).not.toHaveBeenCalled();

    cleanup();
  });

  it("calls onNoFill when genai:onNoFill is emitted on the bus", () => {
    const bus = new CxrEventBus();
    const onFill = vi.fn();
    const onNoFill = vi.fn();

    const cleanup = installGenaiBridge(bus, onFill, onNoFill);

    bus.emit("genai:onNoFill", {});
    expect(onNoFill).toHaveBeenCalledTimes(1);
    expect(onFill).not.toHaveBeenCalled();

    cleanup();
  });

  it("removes listeners after cleanup", () => {
    const bus = new CxrEventBus();
    const onFill = vi.fn();
    const onNoFill = vi.fn();

    const cleanup = installGenaiBridge(bus, onFill, onNoFill);
    cleanup();

    bus.emit("genai:onFill", {});
    bus.emit("genai:onNoFill", {});

    expect(onFill).not.toHaveBeenCalled();
    expect(onNoFill).not.toHaveBeenCalled();
  });

  it("can emit multiple times before cleanup", () => {
    const bus = new CxrEventBus();
    const onFill = vi.fn();
    const onNoFill = vi.fn();

    const cleanup = installGenaiBridge(bus, onFill, onNoFill);

    bus.emit("genai:onFill", {});
    bus.emit("genai:onFill", {});
    bus.emit("genai:onNoFill", {});

    expect(onFill).toHaveBeenCalledTimes(2);
    expect(onNoFill).toHaveBeenCalledTimes(1);

    cleanup();
  });
});
