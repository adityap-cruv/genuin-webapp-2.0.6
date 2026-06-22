import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { FullscreenBottomBar } from "@cxr/controls/bottombar/FullscreenBottomBar";
import type { NormalisedReel, TagResponse } from "@cxr/types";

function makeReel(overrides: Partial<NormalisedReel> = {}): NormalisedReel {
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
    owner: { share_string: "", nickname: "alice", profile_image: "https://example.com/a.jpg" },
    video: { description: "desc", slug: "slug", thumbnail: undefined },
    cta: null,
    playerType: "default",
    ...overrides,
  } as NormalisedReel;
}

const mockTagDetails: TagResponse = {
  tag_id: "tag-1",
  config: { show_owner_details: true, show_spark: true, show_share: true },
};

describe("FullscreenBottomBar", () => {
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

  function render(overrides: Partial<React.ComponentProps<typeof FullscreenBottomBar>> = {}) {
    act(() => {
      root.render(
        React.createElement(FullscreenBottomBar, {
          item: makeReel(),
          tagDetails: mockTagDetails,
          dimensions: { width: 400, height: 600 },
          isActive: true,
          isFullScreen: true,
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

  it('renders data-testid="fullscreen-bottom-bar"', () => {
    render();
    expect(container.querySelector('[data-testid="fullscreen-bottom-bar"]')).toBeTruthy();
  });

  it("renders in-video profile overlay", () => {
    render();
    expect(container.querySelector('[data-testid="fullscreen-in-video-overlay"]')).toBeTruthy();
  });

  it("in-video overlay shows owner profile when show_owner_details=true", () => {
    render();
    expect(container.querySelector('[data-testid="owner-profile-link"]')).toBeTruthy();
  });

  it("hides spark button when show_spark=false", () => {
    render({
      tagDetails: { tag_id: "tag-1", config: { show_owner_details: true, show_spark: false, show_share: true } },
    });
    expect(container.querySelector('[data-testid="bottombar-spark"]')).toBeNull();
  });

  it("hides share button when show_share=false", () => {
    render({
      tagDetails: { tag_id: "tag-1", config: { show_owner_details: true, show_spark: true, show_share: false } },
    });
    expect(container.querySelector('[data-testid="bottombar-share"]')).toBeNull();
  });

  it("hides owner profile when show_owner_details=false", () => {
    render({
      tagDetails: { tag_id: "tag-1", config: { show_owner_details: false, show_spark: true, show_share: true } },
    });
    expect(container.querySelector('[data-testid="owner-profile-link"]')).toBeNull();
  });
});
