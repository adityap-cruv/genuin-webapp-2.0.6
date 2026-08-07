/**
 * Tests for useFeedVisibilityGate — the render/passback/teardown state machine
 * built on top of useInView. useInView itself has its own dedicated test file
 * (monitoring/useInView.test.ts), so it's mocked here directly: tests drive a
 * module-level `mockIsVisible` and force a re-render to simulate an
 * intersection change, matching the direct-dependency-mocking convention used
 * by useMutePassbackGuard.test.ts.
 *
 * Mounted with raw react-dom (no @testing-library/react, matching repo
 * convention) via a throwaway harness component.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let mockIsVisible: boolean | null = null;
let mockSource: "measured" | "unsupported" | "error" | "pending" = "measured";
let mockCrossOriginRoot: boolean | null = null;
let mockTrulyVisible: boolean | null = null;
const useInViewRefMock = vi.fn();
const useInViewMock = vi.fn<
  (options?: { enabled?: boolean }) => {
    ref: typeof useInViewRefMock;
    isVisible: boolean | null;
    source: typeof mockSource;
    crossOriginRoot: boolean | null;
    trulyVisible: boolean | null;
  }
>(() => ({
  ref: useInViewRefMock,
  isVisible: mockIsVisible,
  source: mockSource,
  crossOriginRoot: mockCrossOriginRoot,
  trulyVisible: mockTrulyVisible,
}));
vi.mock("@cxr/monitoring/useInView", () => ({
  useInView: (options?: { enabled?: boolean }) => useInViewMock(options),
}));

let testVisibilityGate = false;
let testTimeoutMs = 30_000;
let testDestroyOnHide = false;
vi.mock("@cxr/strategies/StrategyProvider", () => ({
  useStrategy: () => ({
    visibilityGate: testVisibilityGate,
    visibilityGateTimeoutMs: testTimeoutMs,
    destroyOnHide: testDestroyOnHide,
  }),
}));

// A `let`, not `const` — the stale-closure test below swaps it mid-test to a
// fresh spy, then relies on `useAdWaterfall()` (called fresh every render)
// picking up the new reference, proving the hook doesn't capture `onUnitFail`
// in a closure once at mount.
let onUnitFailMock = vi.fn();
vi.mock("@cxr/providers/AdProvider", () => ({
  useAdWaterfall: () => ({ onUnitFail: onUnitFailMock }),
}));

const setLiveEventContextMock = vi.fn();
vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ setLiveEventContext: setLiveEventContextMock }),
}));

const busEmitMock = vi.fn();
vi.mock("@cxr/instance/InstanceContext", () => ({
  useEventBus: () => ({ emit: busEmitMock }),
  useInstanceId: () => "inst-test",
}));

const registryDestroyMock = vi.fn();
vi.mock("@cxr/instance/registry/InstanceRegistry", () => ({
  getInstanceRegistry: () => ({
    get: () => ({ destroy: registryDestroyMock }),
  }),
}));

import { useFeedVisibilityGate } from "@cxr/app/useFeedVisibilityGate";

let container: HTMLDivElement;
let root: Root;
let lastShouldRender: boolean;

function Harness(): React.JSX.Element {
  const { shouldRender, overlayRef } = useFeedVisibilityGate();
  lastShouldRender = shouldRender;
  return React.createElement("div", { ref: overlayRef });
}

/** Mounts (first call) or re-renders (subsequent calls) the harness. */
function render(): void {
  act(() => {
    root.render(React.createElement(Harness));
  });
}

describe("useFeedVisibilityGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    onUnitFailMock = vi.fn();
    mockIsVisible = null;
    mockSource = "measured";
    mockCrossOriginRoot = null;
    mockTrulyVisible = null;
    testVisibilityGate = false;
    testTimeoutMs = 30_000;
    testDestroyOnHide = false;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it("observes on every tag regardless of the gate — measurement is decoupled", () => {
    testVisibilityGate = false;
    render();

    // No `enabled` gating: the observer runs even with the gate off so
    // `unit_visible` is measured across all traffic (see the module doc).
    expect(useInViewMock).toHaveBeenCalledWith({});
  });

  it("renders immediately and arms no timer when the gate is off", () => {
    testVisibilityGate = false;
    render();

    expect(lastShouldRender).toBe(true);

    act(() => vi.advanceTimersByTime(60_000));

    expect(onUnitFailMock).not.toHaveBeenCalled();
    expect(registryDestroyMock).not.toHaveBeenCalled();
  });

  it("holds render when the gate is on and not yet visible (isVisible === null)", () => {
    testVisibilityGate = true;
    mockIsVisible = null;
    render();

    expect(lastShouldRender).toBe(false);
  });

  it("renders immediately when already visible on mount — the timer never arms", () => {
    testVisibilityGate = true;
    mockIsVisible = true;
    render();

    expect(lastShouldRender).toBe(true);

    act(() => vi.advanceTimersByTime(60_000));

    expect(onUnitFailMock).not.toHaveBeenCalled();
  });

  it("renders once visibility arrives before the timeout, and cancels the timeout", () => {
    testVisibilityGate = true;
    mockIsVisible = null;
    render();
    expect(lastShouldRender).toBe(false);

    act(() => vi.advanceTimersByTime(20_000));
    mockIsVisible = true;
    render();

    expect(lastShouldRender).toBe(true);

    // Past the original 30s window — must not fire now that it became visible.
    act(() => vi.advanceTimersByTime(20_000));
    expect(onUnitFailMock).not.toHaveBeenCalled();
  });

  it("passes back unit_hidden and does not run destroyOnly's own teardown when the timeout fires", () => {
    testVisibilityGate = true;
    testTimeoutMs = 30_000;
    mockIsVisible = false;
    render();

    act(() => vi.advanceTimersByTime(29_999));
    expect(onUnitFailMock).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onUnitFailMock).toHaveBeenCalledTimes(1);
    expect(onUnitFailMock).toHaveBeenCalledWith("unit_hidden");
    // onUnitFail (AdProvider.firePassback) owns the teardown for this path —
    // the hook must not also emit genad:destroy / call registry destroy itself.
    expect(busEmitMock).not.toHaveBeenCalled();
    expect(registryDestroyMock).not.toHaveBeenCalled();
    expect(lastShouldRender).toBe(false);
  });

  it("fires the timeout only once even if it somehow re-checked", () => {
    testVisibilityGate = true;
    mockIsVisible = false;
    render();

    act(() => vi.advanceTimersByTime(30_000));
    act(() => vi.advanceTimersByTime(30_000));

    expect(onUnitFailMock).toHaveBeenCalledTimes(1);
  });

  it("uses the latest onUnitFail rather than a closure captured at mount (stale-closure guard)", () => {
    testVisibilityGate = true;
    mockIsVisible = false;
    render(); // mounts — timer arms, closes over the ref-sync effect, not onUnitFail itself

    // Simulate AdProvider handing back a NEW onUnitFail identity (context value
    // re-created) after mount, before the timer fires.
    const staleOnUnitFail = onUnitFailMock;
    const freshOnUnitFail = vi.fn();
    onUnitFailMock = freshOnUnitFail;
    render(); // re-render — the ref-sync effect should pick up the new function

    act(() => vi.advanceTimersByTime(30_000));

    // If the timeout callback had captured onUnitFail in a closure at mount
    // (the pre-fix version), this would call the STALE function instead.
    expect(freshOnUnitFail).toHaveBeenCalledTimes(1);
    expect(freshOnUnitFail).toHaveBeenCalledWith("unit_hidden");
    expect(staleOnUnitFail).not.toHaveBeenCalled();
  });

  it("does not destroy when the unit goes hidden after rendering and destroyOnHide is off (default)", () => {
    testVisibilityGate = true;
    testDestroyOnHide = false;
    mockIsVisible = true;
    render();
    expect(lastShouldRender).toBe(true);

    mockIsVisible = false;
    render();

    expect(lastShouldRender).toBe(true);
    expect(busEmitMock).not.toHaveBeenCalled();
    expect(registryDestroyMock).not.toHaveBeenCalled();
    expect(onUnitFailMock).not.toHaveBeenCalled();
  });

  it("destroys (no passback) when the unit goes hidden after rendering and destroyOnHide is on", () => {
    testVisibilityGate = true;
    testDestroyOnHide = true;
    mockIsVisible = true;
    render();
    expect(lastShouldRender).toBe(true);

    mockIsVisible = false;
    render();

    expect(lastShouldRender).toBe(false);
    expect(busEmitMock).toHaveBeenCalledWith("genad:destroy", {});
    expect(registryDestroyMock).toHaveBeenCalledTimes(1);
    expect(onUnitFailMock).not.toHaveBeenCalled();
  });

  it("never fires unit_hidden once the unit has been visible, regardless of order or destroyOnHide", () => {
    testVisibilityGate = true;
    testDestroyOnHide = true;
    mockIsVisible = true;
    render(); // visible immediately — timer never even arms in a real run

    mockIsVisible = false;
    render(); // hidden again — destroyOnHide:true → destroyOnly, still no passback

    act(() => vi.advanceTimersByTime(60_000));

    expect(onUnitFailMock).not.toHaveBeenCalled();
  });

  it("does not run destroyOnly's teardown twice on repeated hidden transitions", () => {
    testVisibilityGate = true;
    testDestroyOnHide = true;
    mockIsVisible = true;
    render();

    mockIsVisible = false;
    render();
    render(); // effect deps unchanged — should not re-fire

    expect(busEmitMock).toHaveBeenCalledTimes(1);
    expect(registryDestroyMock).toHaveBeenCalledTimes(1);
  });

  it("clears the timer on unmount", () => {
    testVisibilityGate = true;
    mockIsVisible = false;
    render();

    act(() => root.unmount());
    act(() => vi.advanceTimersByTime(60_000));

    expect(onUnitFailMock).not.toHaveBeenCalled();

    // afterEach unmounts again; make that a no-op on an already-unmounted root.
    root = { unmount: () => {} } as unknown as Root;
  });

  it("honors a per-tag visibilityGateTimeoutMs override", () => {
    testVisibilityGate = true;
    testTimeoutMs = 5_000;
    mockIsVisible = false;
    render();

    act(() => vi.advanceTimersByTime(4_999));
    expect(onUnitFailMock).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onUnitFailMock).toHaveBeenCalledTimes(1);
  });

  describe("unit_visible analytics stamp", () => {
    it("stamps unit_visible even when the gate is off — measurement is decoupled", () => {
      testVisibilityGate = false;
      mockIsVisible = true;
      render();

      // The gate being off suppresses render/passback/teardown, NOT measurement:
      // we collect on-screen data across all traffic before turning the gate on.
      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: true,
        unit_visible_source: "measured",
      });
    });

    it("stamps unit_visible: false with the gate off when measured hidden", () => {
      testVisibilityGate = false;
      mockIsVisible = false;
      render();

      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: false,
        unit_visible_source: "measured",
      });
    });

    it("carries the fail-open source so a non-measured true can be excluded from the rate", () => {
      // No IntersectionObserver in the runtime → useInView fails open to true
      // with source "unsupported". The stamp must expose that provenance so the
      // analysis never counts it as a genuinely-measured visible unit.
      testVisibilityGate = false;
      mockIsVisible = true;
      mockSource = "unsupported";
      render();

      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: true,
        unit_visible_source: "unsupported",
      });
    });

    it("does not stamp anything while not yet measured (isVisible === null) — avoids a false negative", () => {
      testVisibilityGate = true;
      mockIsVisible = null;
      render();

      expect(setLiveEventContextMock).not.toHaveBeenCalled();
    });

    it("stamps unit_visible: true once the unit becomes visible", () => {
      testVisibilityGate = true;
      mockIsVisible = true;
      render();

      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: true,
        unit_visible_source: "measured",
      });
    });

    it("stamps unit_visible: false while known hidden (not null)", () => {
      testVisibilityGate = true;
      mockIsVisible = false;
      render();

      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: false,
        unit_visible_source: "measured",
      });
    });

    it("stamps unit_visible: false again on a post-render hide — a live value, not a latch", () => {
      testVisibilityGate = true;
      mockIsVisible = true;
      render();
      setLiveEventContextMock.mockClear();

      mockIsVisible = false;
      render();

      // Live per the requirement ("event fired when unit was hidden or visible") —
      // independent of hasBeenVisibleRef and of destroyOnHide.
      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: false,
        unit_visible_source: "measured",
      });
    });

    it("uses setLiveEventContext (enqueue-time snapshot), not setBaseEventContext (flush-time/retroactive)", () => {
      testVisibilityGate = true;
      mockIsVisible = true;
      render();

      // Only setLiveEventContext was mocked/imported from AnalyticsProvider —
      // if the hook called any other analytics method this test's import would
      // need it too. Asserting the mock call is the direct proof.
      expect(setLiveEventContextMock).toHaveBeenCalled();
    });

    it("stamps unit_visible_cross_origin when the frame context is known", () => {
      testVisibilityGate = false;
      mockIsVisible = true;
      mockCrossOriginRoot = true;
      render();

      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: true,
        unit_visible_source: "measured",
        unit_visible_cross_origin: true,
      });
    });

    it("omits unit_visible_cross_origin while the frame context is unknown (null)", () => {
      testVisibilityGate = false;
      mockIsVisible = true;
      mockCrossOriginRoot = null;
      render();

      // Same discipline as unit_visible-while-null: don't stamp an unknown as a
      // value. The field is absent, not `null`.
      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: true,
        unit_visible_source: "measured",
      });
    });

    it("stamps unit_truly_visible alongside unit_visible when the consolidated verdict is known", () => {
      // The field repro: IO v1 says visible, the consolidated verdict says
      // hidden. Both must be carried so the data can compare them.
      testVisibilityGate = false;
      mockIsVisible = true;
      mockTrulyVisible = false;
      render();

      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: true,
        unit_visible_source: "measured",
        unit_truly_visible: false,
      });
    });

    it("omits unit_truly_visible while the consolidated verdict is unknown (null)", () => {
      testVisibilityGate = false;
      mockIsVisible = true;
      mockTrulyVisible = null;
      render();

      expect(setLiveEventContextMock).toHaveBeenCalledWith({
        unit_visible: true,
        unit_visible_source: "measured",
      });
    });
  });
});
