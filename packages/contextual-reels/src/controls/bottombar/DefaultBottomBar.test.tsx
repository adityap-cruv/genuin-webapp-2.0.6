import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { DefaultBottomBar } from "@cxr/controls/bottombar/DefaultBottomBar";
import type { NormalisedReel, TagResponse } from "@cxr/types";

vi.mock("@cxr/providers/GenAIProvider", () => ({
  useGenAI: vi.fn(() => ({
    genAiEnabled: false,
    octoFraction: 0,
    setOctoFraction: vi.fn(),
    octoAxis: "y" as const,
    setOctoAxis: vi.fn(),
  })),
  useOctoSplit: vi.fn(() => ({
    octoFraction: 0,
    octoAxis: "y" as const,
    splitActive: false,
    playerShare: 1,
  })),
}));

function makeReel(overrides: Partial<NormalisedReel> = {}): NormalisedReel {
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
    config: null,
    owner: {
      share_string: "https://begenuin.com/user/alice",
      nickname: "alice",
      profile_image: "https://example.com/alice.jpg",
    },
    video: {
      description: "Test description",
      slug: "test-video",
      thumbnail: undefined,
    },
    cta: null,
    playerType: "default",
    ...overrides,
  };
}

const mockTagDetails: TagResponse = {
  tag_id: "tag-1",
  config: { show_owner_details: true, show_spark: true, show_share: true },
};

describe("DefaultBottomBar", () => {
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

  function render(overrides: Partial<React.ComponentProps<typeof DefaultBottomBar>> = {}) {
    act(() => {
      root.render(
        React.createElement(DefaultBottomBar, {
          item: makeReel(),
          tagDetails: mockTagDetails,
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

  it('renders data-testid="default-bottom-bar"', () => {
    render();
    expect(container.querySelector('[data-testid="default-bottom-bar"]')).toBeTruthy();
  });

  it("renders owner profile when show_owner_details=true", () => {
    render();
    expect(container.querySelector('[data-testid="owner-profile-link"]')).toBeTruthy();
  });

  it("hides owner profile when show_owner_details=false", () => {
    render({ tagDetails: { tag_id: "tag-1", config: { show_owner_details: false } } });
    expect(container.querySelector('[data-testid="owner-profile-link"]')).toBeNull();
  });

  it("renders spark button when show_spark=true", () => {
    render();
    expect(container.querySelector('[data-testid="bottombar-spark"]')).toBeTruthy();
  });

  it("hides spark button when show_spark=false", () => {
    render({ tagDetails: { tag_id: "tag-1", config: { show_spark: false } } });
    expect(container.querySelector('[data-testid="bottombar-spark"]')).toBeNull();
  });

  it("renders share button when show_share=true", () => {
    render();
    expect(container.querySelector('[data-testid="bottombar-share"]')).toBeTruthy();
  });

  it("hides share button when show_share=false", () => {
    render({ tagDetails: { tag_id: "tag-1", config: { show_share: false } } });
    expect(container.querySelector('[data-testid="bottombar-share"]')).toBeNull();
  });

  it("renders CTA when show_cta=true and tagDetails has cta", () => {
    render({
      tagDetails: {
        tag_id: "tag-1",
        config: { show_cta: true },
        cta: { text: "Learn More", link: "https://example.com" },
      },
    });
    expect(container.querySelector('[data-testid="bottombar-cta"]')).toBeTruthy();
  });

  it("hides CTA when show_cta=false", () => {
    render({ tagDetails: { tag_id: "tag-1", config: { show_cta: false } } });
    expect(container.querySelector('[data-testid="bottombar-cta"]')).toBeNull();
  });
});
