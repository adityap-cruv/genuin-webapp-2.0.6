/**
 * Tests for useEmblaCarousel — focused on the enable/disable swipe gate that
 * freezes the feed while an Octo sheet is open. Embla itself is mocked; we
 * assert on `reInit` calls and the wheel-guard early-return.
 *
 * Uses a tiny host component + react-dom/client (rather than
 * @testing-library/react) to match this package's existing test convention and
 * avoid adding a test dependency.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import EmblaCarousel from "embla-carousel";
import type { EmblaCarouselType } from "embla-carousel";
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

function makeWheel(deltaY: number): WheelEvent {
  return { deltaY, deltaMode: 0, preventDefault: vi.fn() } as unknown as WheelEvent;
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
});
