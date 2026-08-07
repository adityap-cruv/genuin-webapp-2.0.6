/**
 * Tests for visibilityDiagnostic — the one-shot sampler that captures every
 * candidate viewability signal (IO v1/v2, rAF liveness, Page Visibility,
 * MRAID/OMID, geometry, viewport) so field data can pick the signal that
 * detects a natively-hidden webview.
 *
 * Stubs `IntersectionObserver`, `requestAnimationFrame`, `performance.now`, and
 * the various global probes so each branch — present, absent, and throwing — is
 * driven by hand. Fake timers advance the observation window deterministically.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@cxr/platform/device", () => ({ isWebView: vi.fn(() => true) }));

import { sampleVisibilityDiagnostic } from "@cxr/monitoring/visibilityDiagnostic";
import { isWebView } from "@cxr/platform/device";

/** IO v2's `trackVisibility`/`delay` aren't in the TS lib's `IntersectionObserverInit`. */
type IoOpts = IntersectionObserverInit & { trackVisibility?: boolean };

interface IoStub {
  cb: IntersectionObserverCallback;
  options?: IoOpts;
  observed: Element[];
  disconnect: ReturnType<typeof vi.fn>;
}

let ioStubs: IoStub[] = [];
let ioObserveThrows = false;
let rafCbs: FrameRequestCallback[] = [];
let clock = 0;

const win = window as unknown as Record<string, unknown>;
const saved: Record<string, PropertyDescriptor | undefined> = {};

function save(name: string): void {
  saved[name] = Object.getOwnPropertyDescriptor(window, name);
}
function restore(name: string): void {
  const d = saved[name];
  if (d) Object.defineProperty(window, name, d);
  else delete win[name];
}

function installIO(v2Supported: boolean): void {
  ioStubs = [];
  class Stub {
    cb: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
    observed: Element[] = [];
    disconnect = vi.fn();
    constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.cb = cb;
      this.options = options;
      ioStubs.push(this as unknown as IoStub);
    }
    observe(el: Element): void {
      if (ioObserveThrows) throw new Error("detached");
      this.observed.push(el);
    }
    unobserve(): void {}
  }
  win.IntersectionObserver = Stub;
  const Entry = function () {} as unknown as { prototype: Record<string, unknown> };
  if (v2Supported) Entry.prototype.isVisible = false; // makes `"isVisible" in proto` true
  win.IntersectionObserverEntry = Entry;
}

/** Fire a callback into the v1 (no trackVisibility) or v2 observer. */
function fire(
  which: "v1" | "v2",
  entry: { isIntersecting?: boolean; intersectionRatio?: number; rootBounds?: unknown; isVisible?: unknown }
): void {
  const stub = ioStubs.find((s) =>
    which === "v2" ? s.options?.trackVisibility === true : !s.options?.trackVisibility
  );
  if (!stub) return;
  stub.cb(
    [
      {
        isIntersecting: entry.isIntersecting ?? false,
        intersectionRatio: entry.intersectionRatio ?? 0,
        rootBounds: "rootBounds" in entry ? entry.rootBounds : ({} as DOMRectReadOnly),
        target: stub.observed[0],
        ...("isVisible" in entry ? { isVisible: entry.isVisible } : {}),
      } as unknown as IntersectionObserverEntry,
    ],
    stub as unknown as IntersectionObserver
  );
}

function installRaf(present: boolean): void {
  rafCbs = [];
  if (present) {
    let id = 0;
    win.requestAnimationFrame = (cb: FrameRequestCallback) => {
      rafCbs.push(cb);
      return ++id;
    };
    win.cancelAnimationFrame = vi.fn();
  } else {
    delete win.requestAnimationFrame;
  }
}

/** Run one "frame": invoke the pending rAF callbacks (which re-register). */
function flushFrame(t = 0): void {
  const cbs = rafCbs;
  rafCbs = [];
  for (const cb of cbs) cb(t);
}

/** Advance the fake window clock to resolution and return the snapshot. */
async function settle<T>(promise: Promise<T>, windowMs = 500): Promise<T> {
  clock += windowMs;
  await vi.advanceTimersByTimeAsync(windowMs);
  return promise;
}

function makeEl(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  vi.useFakeTimers();
  clock = 0;
  vi.spyOn(performance, "now").mockImplementation(() => clock);
  (isWebView as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
  for (const n of [
    "IntersectionObserver",
    "IntersectionObserverEntry",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "mraid",
    "omid3p",
    "visualViewport",
    "top",
    "innerWidth",
    "innerHeight",
    "devicePixelRatio",
    "screen",
  ]) {
    save(n);
  }
  installIO(true);
  installRaf(true);
});

afterEach(() => {
  for (const n of [
    "IntersectionObserver",
    "IntersectionObserverEntry",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "mraid",
    "omid3p",
    "visualViewport",
    "top",
    "innerWidth",
    "innerHeight",
    "devicePixelRatio",
    "screen",
  ]) {
    restore(n);
  }
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("monitoring/visibilityDiagnostic — sampleVisibilityDiagnostic", () => {
  it("captures IO v1 + v2 readings and merges extra context", async () => {
    const el = makeEl();
    const p = sampleVisibilityDiagnostic(el, { forced_fill: true }, 500);
    fire("v1", { isIntersecting: true, intersectionRatio: 1, rootBounds: {} });
    fire("v2", { isIntersecting: true, intersectionRatio: 1, isVisible: false });
    const snap = await settle(p);
    expect(snap).not.toBeNull();
    expect(snap!.io_v1_intersecting).toBe(true);
    expect(snap!.io_v1_ratio).toBe(1);
    expect(snap!.io_v1_root_bounds_null).toBe(false);
    expect(snap!.io_v2_supported).toBe(true);
    expect(snap!.io_v2_is_visible).toBe(false);
    expect(snap!.forced_fill).toBe(true);
    expect(snap!.is_webview).toBe(true);
  });

  it("flags a cross-origin root when rootBounds is null", async () => {
    const el = makeEl();
    const p = sampleVisibilityDiagnostic(el);
    fire("v1", { isIntersecting: true, rootBounds: null });
    const snap = await settle(p);
    expect(snap!.io_v1_root_bounds_null).toBe(true);
  });

  it("reports v2 isVisible as null when the entry omits a boolean", async () => {
    const el = makeEl();
    const p = sampleVisibilityDiagnostic(el);
    fire("v2", { isIntersecting: true, isVisible: "nope" });
    const snap = await settle(p);
    expect(snap!.io_v2_is_visible).toBeNull();
  });

  it("ignores an empty IO entry batch", async () => {
    const el = makeEl();
    const p = sampleVisibilityDiagnostic(el);
    const stub = ioStubs[0]!;
    stub.cb([], stub as unknown as IntersectionObserver);
    const snap = await settle(p);
    expect(snap!.io_v1_intersecting).toBeNull();
  });

  it("leaves IO fields null when IntersectionObserver is unsupported", async () => {
    delete win.IntersectionObserver;
    delete win.IntersectionObserverEntry;
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.io_v1_intersecting).toBeNull();
    expect(snap!.io_v2_supported).toBe(false);
    expect(snap!.io_v2_is_visible).toBeNull();
  });

  it("marks v2 unsupported when the entry prototype lacks isVisible", async () => {
    installIO(false);
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.io_v2_supported).toBe(false);
  });

  it("survives observe() throwing (detached node) — IO fields stay null", async () => {
    ioObserveThrows = true;
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    ioObserveThrows = false;
    expect(snap!.io_v1_intersecting).toBeNull();
    expect(snap!.io_v2_supported).toBe(true);
    expect(snap!.io_v2_is_visible).toBeNull();
  });

  it("counts rAF frames and derives fps + first-frame timing", async () => {
    const el = makeEl();
    const p = sampleVisibilityDiagnostic(el, {}, 500);
    clock = 10;
    flushFrame(10);
    clock = 20;
    flushFrame(20);
    const snap = await settle(p);
    expect(snap!.raf_supported).toBe(true);
    expect(snap!.raf_frames).toBe(2);
    // start=0, clock advanced to 20 during frames, then +500 in settle → 520ms.
    expect(snap!.raf_window_ms).toBe(520);
    expect(snap!.raf_fps).toBe(4); // round(2 / 520 * 1000)
    expect(snap!.raf_first_frame_ms).toBe(10);

    // A frame that arrives after the window closed is a no-op (hard stop) — the
    // self-re-registering loop must not keep counting once the sample resolved.
    flushFrame(999);
    expect(snap!.raf_frames).toBe(2);
  });

  it("reports zero frames + null first-frame when the surface is never drawn", async () => {
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.raf_frames).toBe(0);
    expect(snap!.raf_first_frame_ms).toBeNull();
    expect(snap!.raf_fps).toBe(0);
  });

  it("marks rAF unsupported when the API is absent", async () => {
    installRaf(false);
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.raf_supported).toBe(false);
    expect(snap!.raf_frames).toBe(0);
  });

  it("captures Page Visibility state", async () => {
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(typeof snap!.document_visibility_state).toBe("string");
    expect(typeof snap!.document_hidden).toBe("boolean");
    expect(typeof snap!.document_has_focus).toBe("boolean");
    // jsdom has no document.prerendering
    expect(snap!.document_prerendering).toBeNull();
  });

  it("reads a populated MRAID container", async () => {
    win.mraid = {
      getState: () => "default",
      isViewable: () => true,
      getCurrentPosition: () => ({ exposurePercentage: 42 }),
      getPlacementType: () => "inline",
    };
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.mraid_present).toBe(true);
    expect(snap!.mraid_state).toBe("default");
    expect(snap!.mraid_is_viewable).toBe(true);
    expect(snap!.mraid_exposure).toBe(42);
    expect(snap!.mraid_placement_type).toBe("inline");
  });

  it("reads MRAID present but with missing / throwing methods as nulls", async () => {
    win.mraid = {
      isViewable: () => {
        throw new Error("boom");
      },
      getCurrentPosition: () => ({}), // no exposurePercentage
    };
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.mraid_present).toBe(true);
    expect(snap!.mraid_state).toBeNull(); // getState missing
    expect(snap!.mraid_is_viewable).toBeNull(); // threw
    expect(snap!.mraid_exposure).toBeNull(); // no percentage
    expect(snap!.mraid_placement_type).toBeNull();
  });

  it("reports MRAID absent when window.mraid is missing", async () => {
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.mraid_present).toBe(false);
    expect(snap!.mraid_state).toBeNull();
  });

  it("reports MRAID absent when reading window.mraid throws", async () => {
    Object.defineProperty(window, "mraid", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.mraid_present).toBe(false);
  });

  it("detects an OMID service", async () => {
    win.omid3p = {};
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.omid_present).toBe(true);
  });

  it("reports OMID absent when reading throws", async () => {
    Object.defineProperty(window, "omid3p", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.omid_present).toBe(false);
  });

  it("captures geometry + viewport metrics", async () => {
    const el = makeEl();
    el.getBoundingClientRect = () =>
      ({
        x: 5,
        y: 6,
        width: 320,
        height: 480,
        top: 6,
        left: 5,
        right: 325,
        bottom: 486,
        toJSON: () => ({}),
      }) as DOMRect;
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.rect_x).toBe(5);
    expect(snap!.rect_width).toBe(320);
    expect(snap!.in_viewport).toBe(true);
    expect(typeof snap!.viewport_inner_width).toBe("number");
    expect(typeof snap!.device_pixel_ratio).toBe("number");
    expect(typeof snap!.screen_width).toBe("number");
  });

  it("reports not-in-viewport for a zero-size rect", async () => {
    const el = makeEl();
    el.getBoundingClientRect = () =>
      ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) }) as DOMRect;
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.in_viewport).toBe(false);
  });

  it("survives getBoundingClientRect + getComputedStyle throwing", async () => {
    const el = makeEl();
    el.getBoundingClientRect = () => {
      throw new Error("detached");
    };
    const gcs = vi.spyOn(window, "getComputedStyle").mockImplementation(() => {
      throw new Error("detached");
    });
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.rect_width).toBe(0);
    expect(snap!.computed_display).toBe("unknown");
    expect(snap!.computed_opacity).toBe(1);
    gcs.mockRestore();
  });

  it("defaults opacity to 1 when the computed value is non-numeric", async () => {
    const el = makeEl();
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      display: "block",
      visibility: "visible",
      opacity: "not-a-number",
    } as unknown as CSSStyleDeclaration);
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.computed_opacity).toBe(1);
  });

  it("reads visualViewport when present", async () => {
    win.visualViewport = { width: 300, height: 600, scale: 2 };
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.visual_viewport_width).toBe(300);
    expect(snap!.visual_viewport_scale).toBe(2);
  });

  it("leaves visualViewport fields null when absent", async () => {
    win.visualViewport = undefined;
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.visual_viewport_width).toBeNull();
  });

  it("survives viewport/device reads throwing (defaults applied)", async () => {
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.visual_viewport_width).toBeNull();
  });

  it("reports is_top_window true in a top-level context", async () => {
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.is_top_window).toBe(true);
  });

  it("reports is_top_window false when window.top read throws (cross-origin)", async () => {
    Object.defineProperty(window, "top", {
      configurable: true,
      get() {
        throw new Error("cross-origin");
      },
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.is_top_window).toBe(false);
  });

  it("resolves null when building the snapshot throws (isWebView throws)", async () => {
    (isWebView as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("boom");
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap).toBeNull();
  });

  it("resolves null when synchronous setup throws (requestAnimationFrame read throws)", async () => {
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const el = makeEl();
    // No timer is scheduled on the throw path, so it resolves without advancing.
    const snap = await sampleVisibilityDiagnostic(el);
    expect(snap).toBeNull();
  });

  it("falls back to Date.now when performance.now is unavailable", async () => {
    const perf = performance as unknown as { now?: () => number };
    const realNow = perf.now;
    // Force the performance.now branch to be skipped.
    Object.defineProperty(performance, "now", { configurable: true, value: undefined });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap).not.toBeNull();
    Object.defineProperty(performance, "now", { configurable: true, value: realNow });
  });

  it("falls back to Date.now when performance.now throws", async () => {
    vi.spyOn(performance, "now").mockImplementation(() => {
      throw new Error("boom");
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap).not.toBeNull();
  });

  it("reads a finite computed opacity", async () => {
    const el = makeEl();
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      display: "block",
      visibility: "visible",
      opacity: "0.4",
    } as unknown as CSSStyleDeclaration);
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.computed_opacity).toBe(0.4);
  });

  it("survives viewport reads throwing (innerWidth getter throws)", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.in_viewport).toBe(false);
    expect(snap!.viewport_inner_width).toBe(0);
  });

  it("survives window.screen throwing", async () => {
    Object.defineProperty(window, "screen", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.screen_width).toBe(0);
  });

  it("defaults device_pixel_ratio to 1 when non-finite", async () => {
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: NaN });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.device_pixel_ratio).toBe(1);
  });

  it("reports document_prerendering true when the flag is set", async () => {
    Object.defineProperty(document, "prerendering", { configurable: true, value: true });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.document_prerendering).toBe(true);
    delete (document as unknown as { prerendering?: boolean }).prerendering;
  });

  it("survives Page Visibility reads throwing", async () => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const el = makeEl();
    const snap = await settle(sampleVisibilityDiagnostic(el));
    expect(snap!.document_visibility_state).toBe("unknown");
    delete (document as unknown as { visibilityState?: string }).visibilityState;
  });

  it("ignores an empty v2 entry batch", async () => {
    const el = makeEl();
    const p = sampleVisibilityDiagnostic(el);
    const v2 = ioStubs.find((s) => s.options?.trackVisibility === true)!;
    v2.cb([], v2 as unknown as IntersectionObserver);
    const snap = await settle(p);
    expect(snap!.io_v2_is_visible).toBeNull();
  });
});
