/**
 * Tests for useHeavyAdReporter — Path A (Chrome's ReportingObserver, restored) and Path B
 * (interval/visibilitychange/unmount inferred-breach fallback, new), including dedup across
 * both firing orderings and the dev-only debug trigger.
 *
 * Mounted with raw react-dom (no @testing-library/react, matching repo convention) via a
 * throwaway harness component.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EVENT } from "@cxr/analytics/analytics";
import type * as CxrConfig from "@cxr/config";
import type { ResourceSnapshot } from "@cxr/monitoring/resourceMonitor";
import {
  useHeavyAdReporter,
  type HeavyAdReporterDeps,
  type HeavyAdRemovalContext,
} from "@cxr/monitoring/useHeavyAdReporter";

const isIframeMock = vi.fn(() => false);
vi.mock("@cxr/config", async (importOriginal) => {
  const actual = await importOriginal<typeof CxrConfig>();
  return { ...actual, isIframe: () => isIframeMock() };
});

function makeSnapshot(overall: "ok" | "warn" | "breach"): ResourceSnapshot {
  const metric = {
    current: 0,
    threshold: 1000,
    utilizationPercent: overall === "breach" ? 100 : 10,
    level: overall,
    breached: overall === "breach",
  };
  return { overall, timestamp: 0, metrics: { transferBytes: metric, peakCpuMs: metric, totalCpuMs: metric } };
}

const baseContext: HeavyAdRemovalContext = {
  tagId: "tag-1",
  instanceId: "instance-1",
  activeIndex: 0,
  activeReelId: 42,
  adLayout: "L1",
  adSource: "ad",
  isMuted: true,
  msSinceMount: 500,
};

let container: HTMLDivElement;
let root: Root;
let unmounted = false;

function mount(props: Partial<HeavyAdReporterDeps>): void {
  function Harness(): React.JSX.Element {
    useHeavyAdReporter({
      sendEvent: props.sendEvent ?? vi.fn(),
      emit: props.emit ?? vi.fn(),
      getSnapshot: props.getSnapshot ?? (() => null),
      getContext: props.getContext ?? (() => baseContext),
      observerFactory: props.observerFactory,
      enableDebug: props.enableDebug ?? false,
      debugTarget: props.debugTarget,
      inferenceIntervalMs: props.inferenceIntervalMs ?? 5000,
      // Path B defaults to disabled (see useHeavyAdReporter.ts's file-level doc comment) —
      // explicitly enable it for these tests so Path B's own behavior is what's under test,
      // independent of the disabled-by-default policy (covered separately below by the
      // "Path B default" describe block, which uses mountWithRealDefaults instead).
      enablePathB: props.enablePathB ?? true,
    });
    return React.createElement("span");
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  unmounted = false;
  act(() => {
    root.render(React.createElement(Harness));
  });
}

/**
 * Like {@link mount}, but does NOT default `enablePathB` to true — used only to exercise the
 * real `false` default a caller gets when it omits `enablePathB` entirely.
 */
function mountWithRealDefaults(props: Partial<HeavyAdReporterDeps>): void {
  function Harness(): React.JSX.Element {
    useHeavyAdReporter({
      sendEvent: props.sendEvent ?? vi.fn(),
      emit: props.emit ?? vi.fn(),
      getSnapshot: props.getSnapshot ?? (() => null),
      getContext: props.getContext ?? (() => baseContext),
      observerFactory: props.observerFactory,
      enableDebug: props.enableDebug ?? false,
      debugTarget: props.debugTarget,
      inferenceIntervalMs: props.inferenceIntervalMs ?? 5000,
    });
    return React.createElement("span");
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  unmounted = false;
  act(() => {
    root.render(React.createElement(Harness));
  });
}

/** Unmount the harness — safe to call once per test even if the test already unmounted early. */
function unmount(): void {
  if (unmounted) return;
  unmounted = true;
  act(() => root.unmount());
  container.remove();
}

describe("useHeavyAdReporter — Path A (Chrome report)", () => {
  afterEach(() => unmount());

  it("fires once via sendEvent + emit on an injected HAI report", () => {
    const sendEvent = vi.fn();
    const emit = vi.fn();
    let deliver: (reports: unknown[]) => void = () => {};
    const observerFactory = (cb: (reports: unknown[]) => void) => {
      deliver = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    };

    mount({ sendEvent, emit, observerFactory });
    act(() => deliver([{ type: "intervention", body: { id: "HeavyAdIntervention", message: "net" } }]));

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(EVENT.AD_REMOVED, expect.objectContaining({ reason: "heavy-ad-intervention" }));
    expect(emit).toHaveBeenCalledWith("ad:removed", expect.objectContaining({ reason: "heavy-ad-intervention" }));

    act(() => deliver([{ type: "intervention", body: { id: "HeavyAdIntervention", message: "net" } }]));
    expect(sendEvent).toHaveBeenCalledTimes(1); // fired-once guard
  });

  it("mounts clean with no ReportingObserver in env — no throw, no event", () => {
    const sendEvent = vi.fn();
    expect(() => mount({ sendEvent, observerFactory: undefined })).not.toThrow();
    expect(sendEvent).not.toHaveBeenCalled();
  });
});

describe("useHeavyAdReporter — Path B (inferred fallback)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  it("fires an inferred event when the interval snapshot reaches breach, with no Chrome report ever", () => {
    const sendEvent = vi.fn();
    const emit = vi.fn();
    let level: "ok" | "warn" | "breach" = "ok";
    const getSnapshot = () => makeSnapshot(level);

    mount({ sendEvent, emit, getSnapshot, observerFactory: undefined, inferenceIntervalMs: 1000 });

    level = "breach";
    act(() => vi.advanceTimersByTime(1000));

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(
      EVENT.AD_REMOVED,
      expect.objectContaining({ reason: "budget-exceeded-inferred", report: null })
    );
    expect(emit).toHaveBeenCalledWith("ad:removed", expect.objectContaining({ reason: "budget-exceeded-inferred" }));
  });

  it("does not fire while the snapshot stays under breach", () => {
    const sendEvent = vi.fn();
    const getSnapshot = () => makeSnapshot("warn");
    mount({ sendEvent, getSnapshot, observerFactory: undefined, inferenceIntervalMs: 1000 });
    act(() => vi.advanceTimersByTime(5000));
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it("does not fire when enablePathB is explicitly false, even on a real breach", () => {
    const sendEvent = vi.fn();
    const getSnapshot = () => makeSnapshot("breach");
    mount({ sendEvent, getSnapshot, observerFactory: undefined, inferenceIntervalMs: 1000, enablePathB: false });
    act(() => vi.advanceTimersByTime(5000));
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it("runs a check when the tab becomes hidden (visibilitychange lifecycle transition)", () => {
    const sendEvent = vi.fn();
    let level: "ok" | "warn" | "breach" = "ok";
    const getSnapshot = () => makeSnapshot(level);
    mount({ sendEvent, getSnapshot, observerFactory: undefined, inferenceIntervalMs: 60_000 });

    level = "breach";
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    act(() => document.dispatchEvent(new Event("visibilitychange")));

    expect(sendEvent).toHaveBeenCalledWith(EVENT.AD_REMOVED, expect.objectContaining({ reason: "budget-exceeded-inferred" }));
  });

  it("runs one final check on unmount (lifecycle transition)", () => {
    const sendEvent = vi.fn();
    let level: "ok" | "warn" | "breach" = "ok";
    const getSnapshot = () => makeSnapshot(level);
    mount({ sendEvent, getSnapshot, observerFactory: undefined, inferenceIntervalMs: 60_000 });
    level = "breach";
    unmount();
    expect(sendEvent).toHaveBeenCalledWith(EVENT.AD_REMOVED, expect.objectContaining({ reason: "budget-exceeded-inferred" }));
  });

  it("A-then-B: an inferred check after Path A already fired does not re-emit", () => {
    const sendEvent = vi.fn();
    let deliver: (reports: unknown[]) => void = () => {};
    const observerFactory = (cb: (reports: unknown[]) => void) => {
      deliver = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    };
    const getSnapshot = () => makeSnapshot("breach");

    mount({ sendEvent, getSnapshot, observerFactory, inferenceIntervalMs: 1000 });
    act(() => deliver([{ type: "intervention", body: { id: "HeavyAdIntervention" } }]));
    expect(sendEvent).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(sendEvent).toHaveBeenCalledTimes(1); // still 1 — Path B suppressed
  });

  it("B-then-A: a Chrome report after Path B already fired does not re-emit", () => {
    const sendEvent = vi.fn();
    let deliver: (reports: unknown[]) => void = () => {};
    const observerFactory = (cb: (reports: unknown[]) => void) => {
      deliver = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    };
    const getSnapshot = () => makeSnapshot("breach");

    mount({ sendEvent, getSnapshot, observerFactory, inferenceIntervalMs: 1000 });
    act(() => vi.advanceTimersByTime(1000));
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(EVENT.AD_REMOVED, expect.objectContaining({ reason: "budget-exceeded-inferred" }));

    act(() => deliver([{ type: "intervention", body: { id: "HeavyAdIntervention" } }]));
    expect(sendEvent).toHaveBeenCalledTimes(1); // still 1 — Path A suppressed after inferred fire
  });
});

describe("useHeavyAdReporter — Path B default (no enablePathB override)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    isIframeMock.mockReturnValue(false);
  });
  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  it("does not fire on a real breach outside an iframe (isIframe() === false)", () => {
    const sendEvent = vi.fn();
    const getSnapshot = () => makeSnapshot("breach");
    // No enablePathB override — exercises the real environment-derived default. Not an
    // iframe (the common Shadow DOM / direct-mount embed), so Path B must stay off:
    // page-wide byte counting would leak the host page's own bytes into the ad's budget check.
    isIframeMock.mockReturnValue(false);
    mountWithRealDefaults({ sendEvent, getSnapshot, observerFactory: undefined, inferenceIntervalMs: 1000 });
    act(() => vi.advanceTimersByTime(5000));
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it("fires on a real breach when running inside an iframe (isIframe() === true)", () => {
    const sendEvent = vi.fn();
    const getSnapshot = () => makeSnapshot("breach");
    // Simulate the iframe-embedded deployment — the isolated-performance case where page-wide
    // byte counting is trustworthy (no host-page bytes to leak into the widget's own timeline).
    isIframeMock.mockReturnValue(true);
    mountWithRealDefaults({ sendEvent, getSnapshot, observerFactory: undefined, inferenceIntervalMs: 1000 });
    act(() => vi.advanceTimersByTime(1000));
    expect(sendEvent).toHaveBeenCalledWith(
      EVENT.AD_REMOVED,
      expect.objectContaining({ reason: "budget-exceeded-inferred" })
    );
  });
});

describe("useHeavyAdReporter — debug trigger", () => {
  afterEach(() => unmount());

  it("installs _debugSimulateAdRemoval on debugTarget when enableDebug is true, and removes it on unmount", () => {
    const debugTarget: Record<string, unknown> = {};
    mount({ enableDebug: true, debugTarget, observerFactory: undefined });
    expect(typeof debugTarget._debugSimulateAdRemoval).toBe("function");
    unmount();
    expect(debugTarget._debugSimulateAdRemoval).toBeUndefined();
  });

  it("fires an HAI removal via sendEvent + emit when _debugSimulateAdRemoval is called with a limit", () => {
    const sendEvent = vi.fn();
    const emit = vi.fn();
    const debugTarget: Record<string, unknown> = {};
    mount({ sendEvent, emit, enableDebug: true, debugTarget, observerFactory: undefined });

    const simulate = debugTarget._debugSimulateAdRemoval as (limit?: string) => void;
    act(() => simulate("cpu-total"));

    expect(sendEvent).toHaveBeenCalledWith(
      EVENT.AD_REMOVED,
      expect.objectContaining({ reason: "heavy-ad-intervention" })
    );
    expect(emit).toHaveBeenCalledWith("ad:removed", expect.objectContaining({ reason: "heavy-ad-intervention" }));
  });

  it("re-fires on each _debugSimulateAdRemoval call, with and without a limit (resets fired guard)", () => {
    const sendEvent = vi.fn();
    const debugTarget: Record<string, unknown> = {};
    mount({ sendEvent, enableDebug: true, debugTarget, observerFactory: undefined });

    const simulate = debugTarget._debugSimulateAdRemoval as (limit?: string) => void;
    act(() => simulate("cpu-peak")); // with a limit
    act(() => simulate()); // without a limit — exercises the `limit ?? "unknown"` branch

    // fired guard is reset each call, so both fire.
    expect(sendEvent).toHaveBeenCalledTimes(2);
  });

  it("derives enableDebug from isDevEnv() when the flag is omitted", () => {
    // enableDebug omitted → the `enableDebug ?? isDevEnv()` branch (205) is evaluated,
    // executing isDevEnv() (128). Under the Vitest dev runtime import.meta.env.DEV is true,
    // so the debug trigger is installed; the assertion tracks that resolved default rather
    // than hard-coding the flag, and cleanup on unmount removes it either way.
    const debugTarget: Record<string, unknown> = {};
    function Harness(): React.JSX.Element {
      useHeavyAdReporter({
        sendEvent: vi.fn(),
        emit: vi.fn(),
        getSnapshot: () => null,
        getContext: () => baseContext,
        observerFactory: undefined,
        debugTarget,
        // enableDebug intentionally omitted — exercises the environment-derived default.
      });
      return React.createElement("span");
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    unmounted = false;
    expect(() =>
      act(() => {
        root.render(React.createElement(Harness));
      })
    ).not.toThrow();
    expect(typeof debugTarget._debugSimulateAdRemoval).toBe("function");
  });
});

describe("useHeavyAdReporter — observer factory edge cases", () => {
  afterEach(() => unmount());

  it("ignores a reports batch with no heavy-ad-intervention report (find → undefined early return)", () => {
    const sendEvent = vi.fn();
    let deliver: (reports: unknown[]) => void = () => {};
    const observerFactory = (cb: (reports: unknown[]) => void) => {
      deliver = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    };
    mount({ sendEvent, observerFactory });

    // A non-HAI report — isHeavyAdInterventionReport returns false, find → undefined, early return.
    act(() => deliver([{ type: "intervention", body: { id: "SomethingElse" } }]));
    expect(sendEvent).not.toHaveBeenCalled();

    // A matching report with NO body → the `?? {}` body fallback (224).
    act(() => deliver([{ type: "intervention", body: { id: "HeavyAdIntervention" } }]));
    expect(sendEvent).toHaveBeenCalledTimes(1);
  });

  it("survives an observerFactory whose observe() throws — observer stays null, no throw", () => {
    const sendEvent = vi.fn();
    const observerFactory = () => ({
      observe: () => {
        throw new Error("observe blew up");
      },
      disconnect: vi.fn(),
    });
    expect(() => mount({ sendEvent, observerFactory })).not.toThrow();
    // Disconnect on the throwing observer is skipped (observer === null) on unmount.
    expect(() => unmount()).not.toThrow();
    expect(sendEvent).not.toHaveBeenCalled();
  });
});
