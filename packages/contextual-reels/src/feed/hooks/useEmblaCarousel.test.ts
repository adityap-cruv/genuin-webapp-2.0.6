/**
 * Tests for useEmblaCarousel — focused on the enable/disable swipe gate that
 * freezes the feed while an Octo sheet is open. Embla itself is mocked; we
 * assert on `reInit` calls and the wheel-guard early-return.
 *
 * Uses a tiny host component + react-dom/client (rather than
 * @testing-library/react) to match this package's existing test convention and
 * avoid adding a test dependency.
 */
import EmblaCarousel from "embla-carousel";
import type { EmblaCarouselType } from "embla-carousel";
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEmblaCarousel } from "@cxr/feed/hooks/useEmblaCarousel";
import type { UseEmblaCarouselResult } from "@cxr/feed/hooks/useEmblaCarousel";

vi.mock("embla-carousel", () => ({ default: vi.fn() }));

interface FakeApi
  extends Pick<EmblaCarouselType, "scrollNext" | "scrollPrev" | "reInit" | "on" | "off" | "destroy"> {
  /** Invoke the captured `settle` handler to simulate a snap completing. */
  fireSettle: () => void;
}

/** A wheel listener captured off the viewport element via addEventListener. */
type WheelHandler = (e: WheelEvent) => void;

function makeApi(): FakeApi {
  let settleHandler: (() => void) | undefined;
  return {
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    reInit: vi.fn(),
    on: vi.fn((evt: string, cb: () => void) => {
      if (evt === "settle") settleHandler = cb;
    }) as unknown as EmblaCarouselType["on"],
    off: vi.fn() as unknown as EmblaCarouselType["off"],
    destroy: vi.fn(),
    fireSettle: () => settleHandler?.(),
  };
}

/** Capture the wheel listener Embla's host registers on the viewport element. */
function captureWheel(el: HTMLDivElement): () => WheelHandler {
  let wheel: WheelHandler | undefined;
  const realAdd = el.addEventListener.bind(el);
  el.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, opts?: unknown) => {
    if (type === "wheel") wheel = listener as WheelHandler;
    return realAdd(type, listener as EventListener, opts as AddEventListenerOptions);
  }) as typeof el.addEventListener;
  return () => {
    if (!wheel) throw new Error("wheel listener not registered");
    return wheel;
  };
}

function makeWheel(deltaY: number, deltaMode = 0, target: EventTarget | null = null): WheelEvent {
  return { deltaY, deltaMode, target, preventDefault: vi.fn() } as unknown as WheelEvent;
}

describe("useEmblaCarousel enable/disable", () => {
  let container: HTMLDivElement;
  let root: Root;
  let hook: UseEmblaCarouselResult;

  /** Host component that exposes the hook result to the test. */
  function Host(): null {
    hook = useEmblaCarousel();
    return null;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(React.createElement(Host)));
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it("blocks wheel scrolling once disabled and restores it on enable", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    const getWheel = captureWheel(el);
    act(() => hook.viewportRef(el));

    const wheel = getWheel();
    // Enabled (default): a gesture past the threshold drives the carousel.
    act(() => wheel(makeWheel(50)));
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    act(() => api.fireSettle());

    // Disabled: wheel is swallowed, no scroll fires.
    act(() => hook.disable());
    act(() => wheel(makeWheel(50)));
    expect(api.scrollNext).toHaveBeenCalledTimes(1);

    // Re-enabled: wheel drives the carousel again.
    act(() => hook.enable());
    act(() => wheel(makeWheel(50)));
    expect(api.scrollNext).toHaveBeenCalledTimes(2);
  });

  it("toggles Embla pointer drag via reInit", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    act(() => hook.viewportRef(el));

    act(() => hook.disable());
    expect(api.reInit).toHaveBeenLastCalledWith(
      expect.objectContaining({ watchDrag: false, axis: "y", loop: true })
    );

    act(() => hook.enable());
    // enable() restores the ad-slot predicate (a function), never bare `true` —
    // otherwise the cross-origin-iframe phantom-drag bug would return.
    expect(api.reInit).toHaveBeenLastCalledWith(
      expect.objectContaining({ watchDrag: expect.any(Function), axis: "y", loop: true })
    );
  });

  it("watchDrag predicate suppresses drag that starts inside an ad slot", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    act(() => hook.viewportRef(el));

    const opts = vi.mocked(EmblaCarousel).mock.calls[0]?.[1] as { watchDrag: (api: unknown, evt: Event) => boolean };
    const predicate = opts.watchDrag;
    expect(typeof predicate).toBe("function");

    // Target inside an ad slot — drag must be suppressed (returns false).
    const adSlot = document.createElement("div");
    adSlot.setAttribute("data-testid", "ad-layout");
    const adChild = document.createElement("div");
    adSlot.appendChild(adChild);
    expect(predicate({}, { target: adChild } as unknown as Event)).toBe(false);

    // Target outside any ad slot — drag is allowed (returns true).
    const reel = document.createElement("div");
    expect(predicate({}, { target: reel } as unknown as Event)).toBe(true);
  });

  it("remembers a pre-mount disable and inits with drag off", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");

    // disable() before the viewport mounts — must not throw and must persist.
    act(() => hook.disable());
    act(() => hook.viewportRef(el));

    expect(EmblaCarousel).toHaveBeenLastCalledWith(el, expect.objectContaining({ watchDrag: false }));
  });

  it("scrollNext/scrollPrev delegate to the live Embla API", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    act(() => hook.viewportRef(document.createElement("div")));

    act(() => hook.scrollNext());
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    act(() => hook.scrollPrev());
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it("scrollNext/scrollPrev are no-ops before the viewport mounts", () => {
    expect(() => {
      act(() => hook.scrollNext());
      act(() => hook.scrollPrev());
    }).not.toThrow();
  });

  it("ignores a wheel gesture that originates inside a scrollable Octo/GenAI element", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    const getWheel = captureWheel(el);
    act(() => hook.viewportRef(el));

    const octo = document.createElement("div");
    octo.className = "genai-sdk-container";
    const child = document.createElement("div");
    octo.appendChild(child);

    const wheel = getWheel();
    const evt = makeWheel(50, 0, child);
    act(() => wheel(evt));
    // Event left untouched — neither prevented nor scrolled.
    expect(evt.preventDefault).not.toHaveBeenCalled();
    expect(api.scrollNext).not.toHaveBeenCalled();
  });

  it("resets the accumulator when the gesture direction flips mid-swipe", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    const getWheel = captureWheel(el);
    act(() => hook.viewportRef(el));
    const wheel = getWheel();

    // Down past threshold → scrollNext, then settle to unlock.
    act(() => wheel(makeWheel(50)));
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    act(() => api.fireSettle());

    // Flip direction (negative) — accumulator resets, then a big negative scrolls prev.
    act(() => wheel(makeWheel(-50)));
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it("resets an in-flight positive accumulation on a same-gesture reversal to negative", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    const getWheel = captureWheel(el);
    act(() => hook.viewportRef(el));
    const wheel = getWheel();

    // Small positive delta — under threshold, no settle fired, accumulator stays
    // at 10 (not reset by unlock) so the next opposite-sign delta hits the
    // reversal branch instead of starting from zero.
    act(() => wheel(makeWheel(10)));
    expect(api.scrollNext).not.toHaveBeenCalled();
    expect(api.scrollPrev).not.toHaveBeenCalled();

    // Reversal mid-gesture (delta < 0 while accumulated > 0): the accumulator
    // resets to 0 before adding this delta, so -15 alone must not cross the
    // threshold (|-15| < 20) and no scroll should fire yet.
    act(() => wheel(makeWheel(-15)));
    expect(api.scrollNext).not.toHaveBeenCalled();
    expect(api.scrollPrev).not.toHaveBeenCalled();

    // Confirm the accumulator really was reset to 0 (not merely reduced by
    // 15 to -5): one more -10 must total -25 (reset -15 + -10), crossing the
    // threshold, rather than -15 (unreset -5 + -10), which would not.
    act(() => wheel(makeWheel(-10)));
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it("resets an in-flight negative accumulation on a same-gesture reversal to positive", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    const getWheel = captureWheel(el);
    act(() => hook.viewportRef(el));
    const wheel = getWheel();

    // Small negative delta — under threshold, accumulator stays at -10.
    act(() => wheel(makeWheel(-10)));
    expect(api.scrollNext).not.toHaveBeenCalled();
    expect(api.scrollPrev).not.toHaveBeenCalled();

    // Reversal mid-gesture (delta > 0 while accumulated < 0): accumulator
    // resets to 0 before adding, so +15 alone must not cross the threshold.
    act(() => wheel(makeWheel(15)));
    expect(api.scrollNext).not.toHaveBeenCalled();
    expect(api.scrollPrev).not.toHaveBeenCalled();

    // One more +10 totals +25 (reset 15 + 10), crossing the threshold.
    act(() => wheel(makeWheel(10)));
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
  });

  it("normalises Firefox line-mode (deltaMode 1) and page-mode (deltaMode 2) deltas to px", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    const el = document.createElement("div");
    const getWheel = captureWheel(el);
    act(() => hook.viewportRef(el));
    const wheel = getWheel();

    // deltaMode 1 (line): deltaY 2 × 16 = 32px > threshold → scrollNext.
    act(() => wheel(makeWheel(2, 1)));
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    act(() => api.fireSettle());

    // deltaMode 2 (page): deltaY 1 × 100 = 100px > threshold → scrollNext again.
    act(() => wheel(makeWheel(1, 2)));
    expect(api.scrollNext).toHaveBeenCalledTimes(2);
  });

  it("tears down the previous Embla instance when the viewport re-attaches", () => {
    const first = makeApi();
    const second = makeApi();
    vi.mocked(EmblaCarousel)
      .mockReturnValueOnce(first as unknown as EmblaCarouselType)
      .mockReturnValueOnce(second as unknown as EmblaCarouselType);

    act(() => hook.viewportRef(document.createElement("div")));
    // Re-attaching a new node must destroy the first instance before creating the second.
    act(() => hook.viewportRef(document.createElement("div")));
    expect(first.destroy).toHaveBeenCalledTimes(1);
  });

  it("detaching the viewport (null node) tears the instance down", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    act(() => hook.viewportRef(document.createElement("div")));
    act(() => hook.viewportRef(null));
    expect(api.destroy).toHaveBeenCalledTimes(1);
  });
});

describe("useEmblaCarousel onReady", () => {
  let container: HTMLDivElement;
  let root: Root;
  let hook: UseEmblaCarouselResult;
  const onReady = vi.fn();

  function Host(): null {
    hook = useEmblaCarousel({ onReady });
    return null;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(React.createElement(Host)));
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it("invokes onReady with the live Embla API once the viewport mounts", () => {
    const api = makeApi();
    vi.mocked(EmblaCarousel).mockReturnValue(api as unknown as EmblaCarouselType);
    act(() => hook.viewportRef(document.createElement("div")));
    expect(onReady).toHaveBeenCalledWith(api);
  });
});
