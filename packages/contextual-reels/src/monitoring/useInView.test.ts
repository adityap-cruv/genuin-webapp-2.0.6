/**
 * Tests for useInView — the generic viewport-visibility wrapper (callback ref +
 * IntersectionObserver + CSS `visibility` check).
 *
 * A stub `IntersectionObserver` is installed on `window` so tests can drive
 * intersection callbacks by hand and assert observe/disconnect bookkeeping.
 * Mounted with raw react-dom (no @testing-library/react, matching repo
 * convention) via a throwaway harness component.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useInView, type UseInViewOptions } from "@cxr/monitoring/useInView";

/** A stub observer instance the tests can inspect and fire. */
interface StubObserver {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  observed: Element[];
  disconnect: ReturnType<typeof vi.fn>;
}

let stubs: StubObserver[] = [];
/** When set, `observe()` throws it — exercises the detached-node path. */
let observeError: Error | null = null;
const realIntersectionObserver = window.IntersectionObserver;
const realGetComputedStyle = window.getComputedStyle;

function installStub(): void {
  class Stub {
    callback: IntersectionObserverCallback;
    options: IntersectionObserverInit | undefined;
    observed: Element[] = [];
    disconnect = vi.fn();

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.options = options;
      stubs.push(this as unknown as StubObserver);
    }

    observe(element: Element): void {
      if (observeError) throw observeError;
      this.observed.push(element);
    }

    unobserve(): void {}
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = Stub;
}

/**
 * Fires the most recently created observer's callback with the given entries.
 * `rootBounds` defaults to a non-null stub (same-origin root); pass `null`
 * explicitly to simulate the cross-origin-frame nulling.
 */
function fireEntries(
  entries: Array<{
    isIntersecting: boolean;
    target?: Element;
    rootBounds?: DOMRectReadOnly | null;
    isVisible?: boolean;
  }>
): void {
  // When IO v2 is supported the hook creates TWO observers (v1 + a
  // trackVisibility v2) on the same element; in the browser both receive the
  // same entry. Drive every stub for the current mount with the same entries so
  // both callbacks run, exactly as they would live.
  act(() => {
    for (const stub of stubs) {
      stub.callback(
        entries.map(
          (e) =>
            ({
              isIntersecting: e.isIntersecting,
              target: e.target ?? stub.observed[0],
              rootBounds: e.rootBounds === undefined ? ({} as DOMRectReadOnly) : e.rootBounds,
              // Only present when the caller drives IO v2 explicitly; left off
              // otherwise so `"isVisible" in entry` reflects real v2 support.
              ...(e.isVisible === undefined ? {} : { isVisible: e.isVisible }),
            }) as IntersectionObserverEntry
        ),
        stub as unknown as IntersectionObserver
      );
    }
  });
}

/**
 * Installs / removes IO v2 support the way the hook detects it — the presence of
 * `isVisible` on `IntersectionObserverEntry.prototype`. jsdom ships no
 * `IntersectionObserverEntry` at all, so "supported" synthesises a minimal one.
 */
function setIoV2Supported(supported: boolean): void {
  const win = window as unknown as { IntersectionObserverEntry?: { prototype: Record<string, unknown> } };
  if (supported) {
    if (!win.IntersectionObserverEntry) {
      win.IntersectionObserverEntry = { prototype: {} } as { prototype: Record<string, unknown> };
    }
    if (!("isVisible" in win.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(win.IntersectionObserverEntry.prototype, "isVisible", {
        value: false,
        configurable: true,
      });
    }
  } else if (win.IntersectionObserverEntry) {
    delete win.IntersectionObserverEntry;
  }
}

/** Fires the most recently created observer's callback with a single entry. */
function fireIntersection(isIntersecting: boolean): void {
  fireEntries([{ isIntersecting }]);
}

let container: HTMLDivElement;
let root: Root;
/** Latest value the hook returned, captured on every render. */
let observedValue: boolean | null;
/** Latest `source` the hook returned, captured on every render. */
let observedSource: "measured" | "unsupported" | "error" | "pending";
/** Latest `crossOriginRoot` the hook returned, captured on every render. */
let observedCrossOriginRoot: boolean | null;
/** Latest `trulyVisible` the hook returned, captured on every render. */
let observedTrulyVisible: boolean | null;
let lastNode: HTMLDivElement | null;

/** Mounts a harness that always renders a div and attaches the hook's ref. */
function setup(options?: UseInViewOptions): void {
  function Harness(): React.JSX.Element {
    const { ref, isVisible, source, crossOriginRoot, trulyVisible } = useInView(options);
    observedValue = isVisible;
    observedSource = source;
    observedCrossOriginRoot = crossOriginRoot;
    observedTrulyVisible = trulyVisible;
    return React.createElement("div", {
      ref: (node: HTMLDivElement | null) => {
        lastNode = node;
        ref(node);
      },
    });
  }

  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(React.createElement(Harness));
  });
}

describe("useInView", () => {
  beforeEach(() => {
    stubs = [];
    observeError = null;
    observedValue = undefined as unknown as boolean | null;
    observedSource = undefined as unknown as typeof observedSource;
    observedCrossOriginRoot = undefined as unknown as boolean | null;
    observedTrulyVisible = undefined as unknown as boolean | null;
    lastNode = null;
    installStub();
    setIoV2Supported(false);
    window.getComputedStyle = ((element: Element) => realGetComputedStyle(element)) as typeof window.getComputedStyle;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = realIntersectionObserver;
    window.getComputedStyle = realGetComputedStyle;
    setIoV2Supported(false);
  });

  it("observes the attached element on mount and reports null until the first callback", () => {
    setup();

    expect(stubs).toHaveLength(1);
    expect(stubs[0]!.observed).toHaveLength(1);
    expect(stubs[0]!.observed[0]).toBe(lastNode);
    expect(observedValue).toBeNull();
    // Attached but no callback yet — pending, not a measured or fail-open value.
    expect(observedSource).toBe("pending");
    // Frame context unknown until a real entry arrives.
    expect(observedCrossOriginRoot).toBeNull();
  });

  it("defaults to a threshold of 0 — any intersecting pixel counts", () => {
    setup();

    expect(stubs[0]!.options?.threshold).toBe(0);
  });

  it("passes an explicit threshold through to the observer", () => {
    setup({ threshold: 0.5 });

    expect(stubs[0]!.options?.threshold).toBe(0.5);
  });

  it("reports true when the element intersects and is not CSS-hidden", () => {
    setup();

    fireIntersection(true);

    expect(observedValue).toBe(true);
    // A genuine callback fired — this true is measured, not fail-open.
    expect(observedSource).toBe("measured");
    // Same-origin root (rootBounds present) → not cross-origin.
    expect(observedCrossOriginRoot).toBe(false);
  });

  it("reports crossOriginRoot true when rootBounds is nulled (cross-origin frame)", () => {
    setup();

    // The browser nulls rootBounds only for a cross-origin root.
    fireEntries([{ isIntersecting: true, rootBounds: null }]);

    expect(observedValue).toBe(true);
    expect(observedSource).toBe("measured");
    expect(observedCrossOriginRoot).toBe(true);
  });

  it("reports false when the element stops intersecting", () => {
    setup();

    fireIntersection(true);
    fireIntersection(false);

    expect(observedValue).toBe(false);
  });

  it("reports false when the element intersects but is visibility:hidden", () => {
    setup();
    lastNode!.style.visibility = "hidden";

    fireIntersection(true);

    expect(observedValue).toBe(false);
  });

  it("reports true again once visibility is restored", () => {
    setup();
    lastNode!.style.visibility = "hidden";
    fireIntersection(true);
    expect(observedValue).toBe(false);

    lastNode!.style.visibility = "visible";
    fireIntersection(true);

    expect(observedValue).toBe(true);
  });

  it("reads the last entry when a callback batches several", () => {
    setup();

    fireEntries([{ isIntersecting: true }, { isIntersecting: false }]);

    expect(observedValue).toBe(false);
  });

  it("ignores an empty entry list rather than throwing", () => {
    setup();
    fireIntersection(true);

    const stub = stubs[0]!;
    act(() => {
      stub.callback([], stub as unknown as IntersectionObserver);
    });

    expect(observedValue).toBe(true);
  });

  it("disconnects the observer on unmount", () => {
    setup();
    const stub = stubs[0]!;

    act(() => root.unmount());

    expect(stub.disconnect).toHaveBeenCalledTimes(1);

    // afterEach unmounts again; make that a no-op on an already-unmounted root.
    root = { unmount: () => {} } as unknown as Root;
  });

  it("re-observes when the callback ref attaches to a different element", () => {
    let toggle = false;
    function Harness(): React.JSX.Element {
      const { ref, isVisible } = useInView();
      observedValue = isVisible;
      // Two distinct div identities via `key` force React to unmount the first
      // and mount a second, exercising ref detach (null) then re-attach.
      return React.createElement("div", { key: toggle ? "b" : "a", ref });
    }

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(React.createElement(Harness)));
    expect(stubs).toHaveLength(1);
    const firstDisconnect = stubs[0]!.disconnect;

    toggle = true;
    act(() => root.render(React.createElement(Harness)));

    expect(firstDisconnect).toHaveBeenCalledTimes(1);
    expect(stubs).toHaveLength(2);
    expect(stubs[1]!.observed).toHaveLength(1);
  });

  it("fails open to true when IntersectionObserver is unavailable", () => {
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = undefined;

    setup();

    expect(stubs).toHaveLength(0);
    expect(observedValue).toBe(true);
    // Fail-open, not measured — the consumer must be able to exclude this row.
    expect(observedSource).toBe("unsupported");
  });

  it("fails open to true when observe() throws on a detached node", () => {
    observeError = new Error("detached");

    setup();

    expect(observedValue).toBe(true);
    expect(observedSource).toBe("error");
  });

  it("fails open to true and creates no observer when disabled", () => {
    setup({ enabled: false });

    expect(stubs).toHaveLength(0);
    expect(observedValue).toBe(true);
    // Disabled counts as unsupported for provenance — no real measurement taken.
    expect(observedSource).toBe("unsupported");
  });

  it("stays fail-open true even once an element attaches, while disabled", () => {
    setup({ enabled: false });

    expect(lastNode).not.toBeNull();
    expect(stubs).toHaveLength(0);
    expect(observedValue).toBe(true);
    expect(observedSource).toBe("unsupported");
  });

  // --- trulyVisible: the consolidated verdict (IO v1 ∧ IO v2 / geometry) ---
  //
  // Measurement-only signal that folds the field-confirmed IO v2 signal (and a
  // geometry fallback where IO v2 is unsupported) on top of today's IO v1
  // reading. It NEVER weakens the fail-open guarantees `isVisible` gives the
  // revenue gate — it is an extra field, not a replacement.
  describe("trulyVisible (consolidated verdict)", () => {
    /** Positions the target's rect fully on-screen (jsdom inner viewport is 1024×768). */
    function stubRectOnScreen(): void {
      lastNode!.getBoundingClientRect = () =>
        ({ x: 10, y: 10, width: 320, height: 480, top: 10, left: 10, right: 330, bottom: 490 }) as DOMRect;
    }
    /** Positions the target's rect collapsed off-screen — the field repro (rect_x/y < 0, tiny). */
    function stubRectOffScreen(): void {
      lastNode!.getBoundingClientRect = () =>
        ({ x: -160, y: -240, width: 320, height: 480, top: -240, left: -160, right: 160, bottom: 240 }) as DOMRect;
    }

    it("is null before the first callback (same pending semantics as isVisible)", () => {
      setup();
      expect(observedTrulyVisible).toBeNull();
    });

    it("fails open to true when IntersectionObserver is unsupported", () => {
      (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
        undefined as unknown as typeof IntersectionObserver;
      setup();
      expect(observedTrulyVisible).toBe(true);
    });

    it("is false whenever IO v1 is not intersecting, regardless of v2/geometry", () => {
      setIoV2Supported(true);
      setup();
      stubRectOnScreen();
      fireEntries([{ isIntersecting: false, isVisible: true }]);
      expect(observedTrulyVisible).toBe(false);
    });

    describe("with IO v2 supported", () => {
      beforeEach(() => setIoV2Supported(true));

      it("is true when IO v1 intersects AND IO v2 reports painted", () => {
        setup();
        fireEntries([{ isIntersecting: true, isVisible: true }]);
        expect(observedValue).toBe(true);
        expect(observedTrulyVisible).toBe(true);
      });

      it("is FALSE when IO v1 intersects but IO v2 reports not painted (the field repro)", () => {
        setup();
        // io_v1_intersecting: true → isVisible stays true (today's bug); the
        // consolidated verdict catches the native hide via io_v2_is_visible:false.
        fireEntries([{ isIntersecting: true, isVisible: false }]);
        expect(observedValue).toBe(true);
        expect(observedTrulyVisible).toBe(false);
      });
    });

    describe("with IO v2 unsupported (geometry fallback)", () => {
      it("is true when IO v1 intersects and the rect is on-screen", () => {
        setup();
        stubRectOnScreen();
        fireEntries([{ isIntersecting: true }]);
        expect(observedValue).toBe(true);
        expect(observedTrulyVisible).toBe(true);
      });

      it("is FALSE when IO v1 intersects but the rect is collapsed off-screen", () => {
        setup();
        stubRectOffScreen();
        fireEntries([{ isIntersecting: true }]);
        expect(observedValue).toBe(true);
        expect(observedTrulyVisible).toBe(false);
      });

      it("fails open to true when the geometry read itself throws", () => {
        setup();
        // A getBoundingClientRect that throws must never read as hidden — the
        // consolidated verdict is revenue-adjacent measurement, fail open.
        lastNode!.getBoundingClientRect = () => {
          throw new Error("detached");
        };
        fireEntries([{ isIntersecting: true }]);
        expect(observedValue).toBe(true);
        expect(observedTrulyVisible).toBe(true);
      });
    });

    it("degrades to the geometry fallback when the IO v2 observer constructor throws", () => {
      // Some runtimes advertise isVisible but throw on `trackVisibility`. The v2
      // observer creation is wrapped; the v1 path and geometry must still work.
      setIoV2Supported(true);
      const OriginalStub = (window as unknown as { IntersectionObserver: new (...a: unknown[]) => unknown })
        .IntersectionObserver;
      (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = function (
        this: unknown,
        cb: IntersectionObserverCallback,
        options?: IntersectionObserverInit & { trackVisibility?: boolean }
      ) {
        if (options?.trackVisibility) throw new Error("trackVisibility unsupported");
        return new (OriginalStub as new (...a: unknown[]) => unknown)(cb, options);
      } as unknown as typeof IntersectionObserver;

      setup();
      stubRectOffScreen();
      fireEntries([{ isIntersecting: true }]);

      // v1 still measured true; consolidated verdict falls through to geometry,
      // which sees the off-screen rect and reports hidden.
      expect(observedValue).toBe(true);
      expect(observedTrulyVisible).toBe(false);
    });
  });
});
