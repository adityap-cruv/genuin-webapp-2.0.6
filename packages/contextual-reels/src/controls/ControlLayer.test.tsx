import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ControlLayer } from "@cxr/controls/ControlLayer";
import type { NormalisedReel } from "@cxr/types";

vi.mock("../instance/registry/InstanceContext", () => ({
  useInstanceId: () => "test-instance",
}));
vi.mock("../instance/coordination/EventBusContext", () => ({
  useEventBus: () => ({ on: () => () => undefined, emit: () => undefined }),
}));
vi.mock("../providers/PlayerProvider", () => ({
  usePlayer: () => ({ isMuted: true, isPlaying: true, setMuted: vi.fn(), setPlaying: vi.fn() }),
}));
vi.mock("./TopBar", () => ({
  TopBar: () => React.createElement("div", { "data-testid": "top-bar" }),
}));
vi.mock("./BottomBar", () => ({
  BottomBar: () => React.createElement("div", { "data-testid": "bottombar-mute", "data-tag": "button" }),
}));
vi.mock("../genai/octo/OctoSheet", () => ({
  OctoSheet: () => null,
}));

function makeReel(): NormalisedReel {
  return {
    kind: "reel",
    id: 0,
    active: true,
    videoUrl: null,
    videoType: null,
    thumb: null,
    user: null,
    community: null,
    loop: null,
    ogDetails: null,
    owner: null,
    video: null,
    cta: null,
    playerType: "default",
  } as NormalisedReel;
}

describe("ControlLayer", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(overrides: Partial<React.ComponentProps<typeof ControlLayer>> = {}) {
    act(() => {
      root.render(
        React.createElement(ControlLayer, {
          variant: "default",
          item: makeReel(),
          tagDetails: { tag_id: "tag-1" },
          dimensions: { width: 400, height: 600 },
          isActive: true,
          isFullScreen: false,
          isMuted: false,
          isPlay: true,
          adLayout: "unknown",
          onMuteClick: vi.fn(),
          onPlayClick: vi.fn(),
          onFullScreenClick: vi.fn(),
          ...overrides,
        })
      );
    });
  }

  it("renders control-layer-click-area", () => {
    render();
    expect(container.querySelector('[data-testid="click-overlay"]')).toBeTruthy();
  });

  // Click routing — non-fullscreen: tap unmutes (handled internally via
  // setMuted) and routes to neither onFullScreenClick nor onPlayClick.
  it("non-full: click area routes to neither onFullScreenClick nor onPlayClick", () => {
    const onFullScreenClick = vi.fn();
    const onPlayClick = vi.fn();
    render({ isFullScreen: false, onFullScreenClick, onPlayClick });
    const area = container.querySelector('[data-testid="click-overlay"]');
    act(() => {
      area?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onFullScreenClick).not.toHaveBeenCalled();
    expect(onPlayClick).not.toHaveBeenCalled();
  });

  // Click routing — fullscreen
  it("full: click area calls onPlayClick, not onFullScreenClick", () => {
    const onFullScreenClick = vi.fn();
    const onPlayClick = vi.fn();
    render({ isFullScreen: true, onFullScreenClick, onPlayClick });
    const area = container.querySelector('[data-testid="click-overlay"]');
    act(() => {
      area?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onPlayClick).toHaveBeenCalledOnce();
    expect(onFullScreenClick).not.toHaveBeenCalled();
  });

  // ClickOverlay guard: clicks on interactive children are ignored
  it("click on a <button> inside overlay does not call onFullScreenClick", () => {
    const onFullScreenClick = vi.fn();
    render({ isFullScreen: false, onFullScreenClick });
    const overlay = container.querySelector('[data-testid="click-overlay"]')!;
    const btn = document.createElement("button");
    overlay.appendChild(btn);
    act(() => {
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onFullScreenClick).not.toHaveBeenCalled();
  });

  it("click on a [data-no-cta] child does not call onFullScreenClick", () => {
    const onFullScreenClick = vi.fn();
    render({ isFullScreen: false, onFullScreenClick });
    const overlay = container.querySelector('[data-testid="click-overlay"]')!;
    const noCta = document.createElement("div");
    noCta.setAttribute("data-no-cta", "true");
    overlay.appendChild(noCta);
    act(() => {
      noCta.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onFullScreenClick).not.toHaveBeenCalled();
  });
});
