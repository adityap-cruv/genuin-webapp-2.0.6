import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { BottomBar } from "@cxr/controls/BottomBar";
import type { NormalisedReel } from "@cxr/types";

vi.mock("./bottombar/DefaultBottomBar", () => ({
  DefaultBottomBar: () => React.createElement("div", { "data-testid": "default-bottom-bar" }),
}));
vi.mock("./bottombar/FullscreenBottomBar", () => ({
  FullscreenBottomBar: () => React.createElement("div", { "data-testid": "fullscreen-bottom-bar" }),
}));

function makeReel(): NormalisedReel {
  return {
    kind: "video",
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
    config: null,
    video: null,
    cta: null,
    playerType: "default",
  } as NormalisedReel;
}

describe("BottomBar router", () => {
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

  async function render(overrides: Partial<React.ComponentProps<typeof BottomBar>> = {}) {
    await act(async () => {
      root.render(
        React.createElement(BottomBar, {
          variant: "default",
          item: makeReel(),
          tagDetails: { tag_id: "tag-1" },
          dimensions: { width: 400, height: 600 },
          isActive: true,
          isFullScreen: false,
          isMuted: false,
          isPlay: true,
          instanceId: "test-instance",
          onMuteClick: vi.fn(),
          onPlayClick: vi.fn(),
          ...overrides,
        })
      );
    });
  }

  it("variant=default, not fullscreen → DefaultBottomBar", async () => {
    await render({ variant: "default", isFullScreen: false });
    expect(container.querySelector('[data-testid="default-bottom-bar"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fullscreen-bottom-bar"]')).toBeNull();
  });

  it("variant=default, fullscreen → DefaultBottomBar", async () => {
    await render({ variant: "default", isFullScreen: true });
    expect(container.querySelector('[data-testid="default-bottom-bar"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fullscreen-bottom-bar"]')).toBeNull();
  });

  it("variant=iheart, not fullscreen → DefaultBottomBar", async () => {
    await render({ variant: "iheart", isFullScreen: false });
    expect(container.querySelector('[data-testid="default-bottom-bar"]')).toBeTruthy();
  });

  it("variant=iheart, fullscreen → DefaultBottomBar (not FullscreenBottomBar)", async () => {
    await render({ variant: "iheart", isFullScreen: true });
    expect(container.querySelector('[data-testid="default-bottom-bar"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fullscreen-bottom-bar"]')).toBeNull();
  });
});
