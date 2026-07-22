/**
 * Tests for `AdProvider`.
 */
import { act, type ReactNode, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { installGenaiBridge, notifyAdFill, notifyAdNoFill } from "@cxr/ads/waterfall";
import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { PixelReporter } from "@cxr/observability/pixel-reporter";
import {
  AdProvider,
  useAdWaterfall,
  useOptionalAdWaterfall,
  type AdWaterfallContextValue,
} from "@cxr/providers/AdProvider";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const sendEventMock = vi.fn();
const setAdPassbackMock = vi.fn();

vi.mock("./AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setAdPassback: setAdPassbackMock }),
}));

// AdProvider reads `adLayout` from useTagDetails() (context), not a prop.
// Mock it so the harness can drive it without mounting the full provider tree.
const useTagDetailsMock = vi.fn(() => ({ adLayout: AD_LAYOUT.Unknown as AdLayoutId }));
vi.mock("./TagDetailsProvider", () => ({
  useTagDetails: () => useTagDetailsMock(),
}));

// Mock useEventBus + useInstanceId so AdProvider receives a stable pre-created
// bus and a stable id without an InstanceProvider wrapper.
let testBus: CxrEventBus;
const TEST_INSTANCE_ID = "inst-test";

vi.mock("../instance/InstanceContext", () => ({
  useEventBus: () => testBus,
  useInstanceId: () => TEST_INSTANCE_ID,
}));

// Controllable feed state for the single-hit deferred-passback tests.
type FeedEntryLike = { kind: string };
let testFeed: { entries: FeedEntryLike[]; activeIndex: number } = { entries: [], activeIndex: 0 };

vi.mock("./FeedProvider", () => ({
  useFeed: () => testFeed,
}));

// Controllable strategy — default all-off (singleHitWaterfall: false).
let testSingleHit = false;

vi.mock("../strategies/StrategyProvider", () => ({
  useStrategy: () => ({ singleHitWaterfall: testSingleHit }),
}));

vi.mock("../ads/waterfall", () => ({
  notifyAdFill: vi.fn(),
  notifyAdNoFill: vi.fn(),
  installGenaiBridge: vi.fn(() => vi.fn()),
}));

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { root, container };
}

function unmount(root: Root, container: HTMLDivElement): void {
  act(() => root.unmount());
  container.remove();
}

interface ContextHandle {
  ctx: AdWaterfallContextValue | null;
}

function Consumer({ handle }: { handle: ContextHandle }): ReactElement {
  handle.ctx = useAdWaterfall();
  return <span />;
}

// ---------------------------------------------------------------------------
// adLayout / isAudioOnlyAds tests
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("providers/AdProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testBus = new CxrEventBus();
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.Unknown });
    testFeed = { entries: [], activeIndex: 0 };
    testSingleHit = false;
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockImplementation(() => vi.fn());
    PixelReporter.getInstance().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children", () => {
    const { root, container } = mount(
      <AdProvider>
        <span>child</span>
      </AdProvider>
    );
    expect(container.textContent).toContain("child");
    unmount(root, container);
  });

  it("useAdWaterfall throws outside AdProvider", () => {
    function Outsider(): ReactElement {
      useAdWaterfall();
      return <span />;
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      act(() => {
        root.render(<Outsider />);
      })
    ).toThrow(/AdProvider/);
    errSpy.mockRestore();
    container.remove();
  });

  it("calls notifyAdFill on the first fill", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdSuccess("video");
    });

    expect(notifyAdFill).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("does not call notifyAdFill again on a repeat fill", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdSuccess("video");
      handle.ctx?.onAdSuccess("video");
    });

    expect(notifyAdFill).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("calls notifyAdNoFill, emits Ad Passback, and destroys on a no-fill", () => {
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    const destroy = vi.fn();
    getInstanceRegistry().register(TEST_INSTANCE_ID, { destroy });
    const emitSpy = vi.spyOn(testBus, "emit");
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdFail();
    });

    expect(notifyAdNoFill).toHaveBeenCalledTimes(1);
    // Dimensions derived from adLayout (L3 = 320×50).
    expect(sendEventMock).toHaveBeenCalledWith(
      "Ad Passback",
      expect.objectContaining({
        tag_height: 50,
        tag_width: 320,
      })
    );
    // Passback confirmed → widget torn down.
    expect(emitSpy).toHaveBeenCalledWith("genad:destroy", {});
    expect(destroy).toHaveBeenCalledTimes(1);

    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("does not call notifyAdNoFill again on a repeat no-fill (passback already fired)", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdFail();
      handle.ctx?.onAdFail();
    });

    expect(notifyAdNoFill).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("installs the genai bridge on mount", () => {
    const { root, container } = mount(
      <AdProvider>
        <span />
      </AdProvider>
    );
    expect(installGenaiBridge).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("calls bridge cleanup on unmount", () => {
    const cleanupMock = vi.fn();
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockReturnValueOnce(cleanupMock);

    const { root, container } = mount(
      <AdProvider>
        <span />
      </AdProvider>
    );
    unmount(root, container);

    expect(cleanupMock).toHaveBeenCalledTimes(1);
  });

  it("genai:onFill dispatched → calls notifyAdFill via bridge", () => {
    // Capture the onFill callback passed to installGenaiBridge (now the 2nd arg)
    let capturedOnFill: (() => void) | undefined;
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockImplementationOnce((_: unknown, onFill: () => void) => {
      capturedOnFill = onFill;
      return vi.fn();
    });

    const { root, container } = mount(
      <AdProvider>
        <span />
      </AdProvider>
    );

    act(() => {
      capturedOnFill?.();
    });

    expect(notifyAdFill).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("genai:onNoFill dispatched → calls notifyAdNoFill + Ad Passback via bridge", () => {
    let capturedOnNoFill: (() => void) | undefined;
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (_: unknown, __: unknown, onNoFill: () => void) => {
        capturedOnNoFill = onNoFill;
        return vi.fn();
      }
    );

    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    const { root, container } = mount(
      <AdProvider>
        <span />
      </AdProvider>
    );

    act(() => {
      capturedOnNoFill?.();
    });

    expect(notifyAdNoFill).toHaveBeenCalledTimes(1);
    expect(sendEventMock).toHaveBeenCalledWith("Ad Passback", expect.any(Object));
    unmount(root, container);
  });

  // ── adLayout / isAudioOnlyAds ─────────────────────────────────────────────

  it("exposes adLayout defaulting to AD_LAYOUT.Unknown when the tag has none", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.adLayout).toBe(AD_LAYOUT.Unknown);
    expect(handle.ctx?.isAudioOnlyAds).toBe(false);
    unmount(root, container);
  });

  it("exposes the tag's adLayout value in context", () => {
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.adLayout).toBe(AD_LAYOUT.L2);
    expect(handle.ctx?.isAudioOnlyAds).toBe(false);
    unmount(root, container);
  });

  it("sets isAudioOnlyAds=true for mobile-320x50", () => {
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.isAudioOnlyAds).toBe(true);
    unmount(root, container);
  });

  it("sets isAudioOnlyAds=true for mobile-320x100", () => {
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L4 });
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.isAudioOnlyAds).toBe(true);
    unmount(root, container);
  });

  // ── fireInfolinksImpression (host-triggered event only) ───────────────────

  it("registers fireInfolinksImpression, which fires the event only (no passback, no destroy)", () => {
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L4 });
    const destroy = vi.fn();
    getInstanceRegistry().register(TEST_INSTANCE_ID, { destroy });
    const emitSpy = vi.spyOn(testBus, "emit");

    const { root, container } = mount(
      <AdProvider>
        <span />
      </AdProvider>
    );

    const controls = getInstanceRegistry().get(TEST_INSTANCE_ID);
    expect(typeof controls?.fireInfolinksImpression).toBe("function");

    act(() => {
      controls?.fireInfolinksImpression?.();
    });

    // Fires Infolinks Impression with dims derived from adLayout (L4 = 320×100).
    expect(sendEventMock).toHaveBeenCalledWith("Infolinks Impression", {
      tag_height: 100,
      tag_width: 320,
    });
    // Does NOT run the no-fill path or destroy — that's onAdFail's job now.
    expect(notifyAdNoFill).not.toHaveBeenCalled();
    expect(setAdPassbackMock).not.toHaveBeenCalled();
    expect(sendEventMock).not.toHaveBeenCalledWith("Ad Passback", expect.anything());
    expect(emitSpy).not.toHaveBeenCalledWith("genad:destroy", {});
    expect(destroy).not.toHaveBeenCalled();

    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  // ── single-hit deferred passback ──────────────────────────────────────────

  /** Mount an AdProvider in single-hit mode with a controllable feed. */
  function mountSingleHit(entries: FeedEntryLike[], activeIndex = 0) {
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L4 });
    testSingleHit = true;
    testFeed = { entries, activeIndex };
    const destroy = vi.fn();
    getInstanceRegistry().register(TEST_INSTANCE_ID, { destroy });
    const emitSpy = vi.spyOn(testBus, "emit");
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider>
        <Consumer handle={handle} />
      </AdProvider>
    );
    return { destroy, emitSpy, handle, root, container };
  }

  function expectNoPassback(destroy: ReturnType<typeof vi.fn>): void {
    expect(sendEventMock).not.toHaveBeenCalledWith("Ad Passback", expect.anything());
    expect(destroy).not.toHaveBeenCalled();
  }

  it("single-hit: a no-fill before the last index does NOT passback", () => {
    // Two ad slots; only one no-filled, not at last index.
    const { destroy, handle, root, container } = mountSingleHit(
      [{ kind: "ad" }, { kind: "ad" }],
      0
    );
    act(() => handle.ctx?.onAdFail("ad-1"));
    expectNoPassback(destroy);
    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("single-hit: passback fires once every ad slot no-fills AND last index reached", () => {
    // Mounted at the last index so the reached-last effect latches on mount.
    const { destroy, handle, root, container } = mountSingleHit(
      [{ kind: "ad" }, { kind: "ad" }],
      1
    );

    act(() => handle.ctx?.onAdFail("ad-1"));
    // One slot reported (1 < 2) → still deferred.
    expect(sendEventMock).not.toHaveBeenCalledWith("Ad Passback", expect.anything());

    act(() => handle.ctx?.onAdFail("ad-2"));
    // Both slots reported at the last index, none filled → passback.
    expect(sendEventMock).toHaveBeenCalledWith("Ad Passback", { tag_height: 100, tag_width: 320 });
    expect(destroy).toHaveBeenCalledTimes(1);

    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("single-hit: any fill suppresses passback even after full traversal", () => {
    const { destroy, handle, root, container } = mountSingleHit(
      [{ kind: "ad" }, { kind: "ad" }],
      1 // already at last index
    );
    act(() => {
      handle.ctx?.onAdSuccess("video", "ad-1"); // one slot FILLED
      handle.ctx?.onAdFail("ad-2");
    });
    expectNoPassback(destroy);
    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("single-hit: does not passback while a slot is still pending at the last index", () => {
    const { destroy, handle, root, container } = mountSingleHit(
      [{ kind: "ad" }, { kind: "ad" }, { kind: "ad" }],
      2 // last index, but only 2 of 3 slots reported
    );
    act(() => {
      handle.ctx?.onAdFail("ad-1");
      handle.ctx?.onAdFail("ad-2");
    });
    expectNoPassback(destroy);
    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("single-hit: the same slot reporting twice does not inflate the tally", () => {
    const { destroy, handle, root, container } = mountSingleHit(
      [{ kind: "ad" }, { kind: "ad" }],
      1 // last index
    );
    act(() => {
      handle.ctx?.onAdFail("ad-1");
      handle.ctx?.onAdFail("ad-1"); // duplicate — Set dedups
    });
    // Only one distinct slot reported → 1 < 2 → no passback.
    expectNoPassback(destroy);
    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("single-hit: video-with-ad break counts toward exhaustion", () => {
    const { destroy, handle, root, container } = mountSingleHit(
      [{ kind: "ad" }, { kind: "video-with-ad" }],
      1 // last index
    );
    act(() => {
      handle.ctx?.onAdFail("ad-1");
      handle.ctx?.recordAdBreakResult("break-1", false); // break no-fill
    });
    expect(sendEventMock).toHaveBeenCalledWith("Ad Passback", { tag_height: 100, tag_width: 320 });
    expect(destroy).toHaveBeenCalledTimes(1);
    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("single-hit: a video-with-ad break FILL suppresses passback", () => {
    const { destroy, handle, root, container } = mountSingleHit(
      [{ kind: "ad" }, { kind: "video-with-ad" }],
      1 // last index
    );
    act(() => {
      handle.ctx?.onAdFail("ad-1");
      handle.ctx?.recordAdBreakResult("break-1", true); // break FILLED
    });
    expectNoPassback(destroy);
    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  // ── useOptionalAdWaterfall ────────────────────────────────────────────────

  it("useOptionalAdWaterfall returns the context value inside an AdProvider", () => {
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    const handle: ContextHandle = { ctx: null };
    function OptionalConsumer(): ReactElement {
      handle.ctx = useOptionalAdWaterfall() ?? null;
      return <span />;
    }
    const { root, container } = mount(
      <AdProvider>
        <OptionalConsumer />
      </AdProvider>
    );
    expect(handle.ctx?.adLayout).toBe(AD_LAYOUT.L2);
    unmount(root, container);
  });

  it("useOptionalAdWaterfall returns undefined (does not throw) outside an AdProvider", () => {
    let received: AdWaterfallContextValue | undefined | "unset" = "unset";
    function OptionalOutsider(): ReactElement {
      received = useOptionalAdWaterfall();
      return <span />;
    }
    const { root, container } = mount(<OptionalOutsider />);
    expect(received).toBeUndefined();
    unmount(root, container);
  });

  // ── PixelReporter → onAdFail bridge ──────────────────────────────────────

  it("calls onAdFail (full passback) when PixelReporter reports a failure for this instance", () => {
    // Mirrors index.jsx's real `destroyed` guard: PixelReporter.report() calls
    // destroy directly (best-effort, non-React path) AND AdProvider's onFailure
    // listener calls it again via onAdFail()'s firePassback — both target the
    // same registered instance, so the real destroy control is idempotent.
    // A bare vi.fn() here would otherwise (correctly) show 2 calls.
    let destroyed = false;
    const destroy = vi.fn(() => {
      destroyed = true;
    });
    getInstanceRegistry().register(TEST_INSTANCE_ID, {
      destroy: () => {
        if (destroyed) return;
        destroy();
      },
    });
    useTagDetailsMock.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    const { root, container } = mount(
      <AdProvider>
        <span>child</span>
      </AdProvider>
    );

    act(() => {
      PixelReporter.getInstance().report(TEST_INSTANCE_ID, "render", "render_error");
    });

    expect(notifyAdNoFill).toHaveBeenCalledTimes(1);
    expect(sendEventMock).toHaveBeenCalledWith("Ad Passback", expect.objectContaining({ tag_height: 50, tag_width: 320 }));
    expect(destroy).toHaveBeenCalledTimes(1);

    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
    unmount(root, container);
  });

  it("PixelReporter's best-effort destroy reaches the registered instance even without AdProvider mounted", () => {
    const destroy = vi.fn();
    getInstanceRegistry().register(TEST_INSTANCE_ID, { destroy });

    act(() => {
      PixelReporter.getInstance().report(TEST_INSTANCE_ID, "init", "initialization_error");
    });

    expect(destroy).toHaveBeenCalledTimes(1);

    getInstanceRegistry().unregister(TEST_INSTANCE_ID);
  });

  it("ignores a PixelReporter failure reported for a different instanceId", () => {
    const { root, container } = mount(
      <AdProvider>
        <span>child</span>
      </AdProvider>
    );

    act(() => {
      PixelReporter.getInstance().report("some-other-instance", "render", "render_error");
    });

    expect(notifyAdNoFill).not.toHaveBeenCalled();
    expect(sendEventMock).not.toHaveBeenCalledWith("Ad Passback", expect.anything());

    unmount(root, container);
  });

  it("unsubscribes from PixelReporter on unmount (no passback after unmount)", () => {
    const { root, container } = mount(
      <AdProvider>
        <span>child</span>
      </AdProvider>
    );

    unmount(root, container);

    act(() => {
      PixelReporter.getInstance().report(TEST_INSTANCE_ID, "render", "render_error");
    });

    expect(notifyAdNoFill).not.toHaveBeenCalled();
  });
});
