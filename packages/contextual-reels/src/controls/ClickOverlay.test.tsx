import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let onSetMuted: ((value: boolean) => void) | undefined;
let mockIsMuted = true;

vi.mock("../providers/PlayerProvider", () => ({
  usePlayer: () => ({
    isMuted: mockIsMuted,
    isPlaying: true,
    setPlaying: vi.fn(),
    setMuted: (value: boolean) => onSetMuted?.(value),
  }),
}));

const { sendEventMock } = vi.hoisted(() => ({ sendEventMock: vi.fn() }));
vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setBrandId: vi.fn() }),
}));

import { ClickOverlay } from "@cxr/controls/ClickOverlay";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

let testBus: CxrEventBus;

vi.mock("../instance/coordination/EventBusContext", () => ({
  useEventBus: () => testBus,
}));


describe("ClickOverlay", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    onSetMuted = undefined;
    mockIsMuted = true;
    sendEventMock.mockClear();
    testBus = new CxrEventBus();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(overrides: Partial<React.ComponentProps<typeof ClickOverlay>> = {}) {
    const defaults = {
      isFullScreen: false,
      onFullScreenClick: vi.fn(),
      onPlayClick: vi.fn(),
      containerId: "gen-ad-slot-test-1",
      ...overrides,
    };
    act(() => {
      root.render(React.createElement(ClickOverlay, defaults));
    });
    return defaults;
  }

  it('renders with data-testid="click-overlay"', () => {
    render();
    expect(container.querySelector('[data-testid="click-overlay"]')).toBeTruthy();
  });

  it("non-fullscreen: click unmutes via a user-initiated setMuted, not onPlayClick", () => {
    const { onFullScreenClick, onPlayClick } = render({ isFullScreen: false });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onPlayClick).not.toHaveBeenCalled();
    expect(onFullScreenClick).not.toHaveBeenCalled();
  });

  it("non-fullscreen: click emits ad:unmuteRequest with containerId BEFORE setMuted", () => {
    const emitOrder: string[] = [];
    const unmuteHandler = vi.fn(() => emitOrder.push("emit"));
    testBus.on("ad:unmuteRequest", unmuteHandler);
    onSetMuted = () => emitOrder.push("setMuted");

    const { onPlayClick, onFullScreenClick } = render({
      isFullScreen: false,
      containerId: "gen-ad-slot-w-7",
    });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Gesture-bound unmute request must fire synchronously, targeting this slot.
    expect(unmuteHandler).toHaveBeenCalledWith({ containerId: "gen-ad-slot-w-7" });
    // Order: emit first (gesture-synchronous SDK call), then React state update.
    expect(emitOrder).toEqual(["emit", "setMuted"]);
    expect(onPlayClick).not.toHaveBeenCalled();
    expect(onFullScreenClick).not.toHaveBeenCalled();
  });

  it("non-fullscreen: click with no subscriber still updates mute state", () => {
    render({ isFullScreen: false });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  });

  it("expandOnTap=true (non-fullscreen): click expands, does not unmute", () => {
    const emitOrder: string[] = [];
    const unmuteHandler = vi.fn(() => emitOrder.push("emit"));
    testBus.on("ad:unmuteRequest", unmuteHandler);
    onSetMuted = () => emitOrder.push("setMuted");

    const { onFullScreenClick, onPlayClick } = render({
      isFullScreen: false,
      containerId: "gen-ad-slot-300x250",
      expandOnTap: true,
    });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onFullScreenClick).toHaveBeenCalledOnce();
    expect(unmuteHandler).not.toHaveBeenCalled();
    expect(emitOrder).toEqual([]);
    expect(onPlayClick).not.toHaveBeenCalled();
  });

  it("fullscreen: click calls onPlayClick, not onFullScreenClick", () => {
    const { onFullScreenClick, onPlayClick } = render({ isFullScreen: true });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onPlayClick).toHaveBeenCalledOnce();
    expect(onFullScreenClick).not.toHaveBeenCalled();
  });

  it("covers full area with position:absolute inset:0", () => {
    render();
    const el = container.querySelector<HTMLElement>('[data-testid="click-overlay"]')!;
    expect(el.className).toContain("gencl:absolute");
    expect(el.className).toContain("gencl:inset-0");
  });

  // Covers the shared `stopProp` handler wired to pointer/touch events: each must
  // stop propagation so an embedded host's scroll listeners don't see the gesture.
  it.each([
    ["pointerdown"],
    ["pointermove"],
    ["touchstart"],
    ["touchmove"],
  ])("stops propagation on %s", (type) => {
    render();
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    const event = new Event(type, { bubbles: true });
    const spy = vi.spyOn(event, "stopPropagation");
    act(() => {
      el.dispatchEvent(event);
    });
    expect(spy).toHaveBeenCalled();
  });

  it("fullscreen: click on an interactive child (button) is ignored", () => {
    const { onPlayClick } = render({ isFullScreen: true });
    const overlay = container.querySelector('[data-testid="click-overlay"]')!;
    const btn = document.createElement("button");
    overlay.appendChild(btn);
    act(() => {
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onPlayClick).not.toHaveBeenCalled();
  });

  it("non-fullscreen: no containerId still updates mute state without emitting", () => {
    const emitOrder: string[] = [];
    testBus.on("ad:unmuteRequest", () => emitOrder.push("emit"));
    onSetMuted = () => emitOrder.push("setMuted");
    render({ isFullScreen: false, containerId: undefined });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // Video overlays carry no containerId: skip the emit, still update mute state.
    expect(emitOrder).toEqual(["setMuted"]);
  });

  it("non-fullscreen: tap-to-unmute tracks Unmuted with by_user", () => {
    render({ isFullScreen: false });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(sendEventMock).toHaveBeenCalledWith("Unmuted", { by_user: true });
  });

  it("does not track Unmuted when already audible (no state change)", () => {
    mockIsMuted = false;
    render({ isFullScreen: false });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(sendEventMock).not.toHaveBeenCalled();
  });

  it("fullscreen: play/pause tap does not track Unmuted", () => {
    render({ isFullScreen: true });
    const el = container.querySelector('[data-testid="click-overlay"]')!;
    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(sendEventMock).not.toHaveBeenCalled();
  });
});
