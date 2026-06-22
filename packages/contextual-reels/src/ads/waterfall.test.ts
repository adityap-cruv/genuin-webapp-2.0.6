/**
 * Tests for ad waterfall — consolidated from:
 *   ads/waterfall.test.ts
 *   ads/waterfallCallbacks.test.ts
 *   ads/genaiBridge.test.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  SINGLE_HIT_TAG_IDS,
  shouldCountFill,
  shouldCountNoFill,
  notifyAdFill,
  notifyAdNoFill,
  installGenaiBridge,
} from "@cxr/ads/waterfall";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

const SINGLE_HIT_ID = "69b298e3d6a6ad57e7b9a464";
const OTHER_ID = "69b298f4d6a6ad57e7b9a499";
const NORMAL_ID = "aaaabbbbccccdddd11112222";

describe("ads/waterfall — SINGLE_HIT_TAG_IDS", () => {
  it("contains the two known single-hit tag IDs", () => {
    expect(SINGLE_HIT_TAG_IDS.has(SINGLE_HIT_ID)).toBe(true);
    expect(SINGLE_HIT_TAG_IDS.has(OTHER_ID)).toBe(true);
  });

  it("does not contain arbitrary tag IDs", () => {
    expect(SINGLE_HIT_TAG_IDS.has(NORMAL_ID)).toBe(false);
  });
});

describe("ads/waterfall — shouldCountFill", () => {
  it("returns true for a non-single-hit tagId regardless of fill count", () => {
    expect(shouldCountFill(NORMAL_ID, 0)).toBe(true);
    expect(shouldCountFill(NORMAL_ID, 1)).toBe(true);
    expect(shouldCountFill(NORMAL_ID, 99)).toBe(true);
  });

  it("returns true for single-hit tagId when fill count is 0", () => {
    expect(shouldCountFill(SINGLE_HIT_ID, 0)).toBe(true);
    expect(shouldCountFill(OTHER_ID, 0)).toBe(true);
  });

  it("returns false for single-hit tagId when fill count is 1", () => {
    expect(shouldCountFill(SINGLE_HIT_ID, 1)).toBe(false);
    expect(shouldCountFill(OTHER_ID, 1)).toBe(false);
  });

  it("returns false for single-hit tagId when fill count is 2+", () => {
    expect(shouldCountFill(SINGLE_HIT_ID, 2)).toBe(false);
    expect(shouldCountFill(SINGLE_HIT_ID, 10)).toBe(false);
  });
});

describe("ads/waterfall — shouldCountNoFill", () => {
  it("returns true for a non-single-hit tagId regardless of noFill count", () => {
    expect(shouldCountNoFill(NORMAL_ID, 0)).toBe(true);
    expect(shouldCountNoFill(NORMAL_ID, 5)).toBe(true);
  });

  it("returns true for single-hit tagId when noFill count is 0", () => {
    expect(shouldCountNoFill(SINGLE_HIT_ID, 0)).toBe(true);
  });

  it("returns false for single-hit tagId when noFill count is 1", () => {
    expect(shouldCountNoFill(SINGLE_HIT_ID, 1)).toBe(false);
  });

  it("returns false for single-hit tagId when noFill count is 2+", () => {
    expect(shouldCountNoFill(SINGLE_HIT_ID, 2)).toBe(false);
  });
});

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
