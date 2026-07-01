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

  it("renders the avatar from a remote https url", () => {
    render();
    const img = container.querySelector('[data-testid="owner-profile-link"] img') as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("https://example.com/a.jpg");
  });

  it("builds the avatar asset path when the profile image is a bare thumb (not https)", () => {
    render({
      item: makeReel({ owner: { share_string: "", nickname: "bob", profile_image: "bob-avatar" } }),
    });
    const img = container.querySelector('[data-testid="owner-profile-link"] img') as HTMLImageElement;
    expect(img.getAttribute("src")).toContain("assets/avatar/bob-avatar.gif");
  });

  it("falls back to the user.thumb when owner.profile_image is absent", () => {
    render({
      item: makeReel({
        owner: { share_string: "", nickname: "bob", profile_image: undefined },
        user: { thumb: "user-thumb" } as NormalisedReel["user"],
      }),
    });
    const img = container.querySelector('[data-testid="owner-profile-link"] img') as HTMLImageElement;
    expect(img.getAttribute("src")).toContain("assets/avatar/user-thumb.gif");
  });

  it("renders no avatar img when there is no thumb", () => {
    render({
      item: makeReel({
        owner: { share_string: "", nickname: "bob", profile_image: undefined },
        user: null,
      }),
    });
    // Owner link still renders (nickname), but the img is omitted when src is undefined.
    expect(container.querySelector('[data-testid="owner-profile-link"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="owner-profile-link"] img')).toBeNull();
  });

  it("swaps to the penguin fallback avatar when the image fails to load", () => {
    render();
    const img = container.querySelector('[data-testid="owner-profile-link"] img') as HTMLImageElement;
    act(() => {
      img.dispatchEvent(new Event("error", { bubbles: false }));
    });
    expect(img.getAttribute("src")).toContain("assets/avatar/penguin.gif");
  });

  it("stops click propagation on the owner profile link", () => {
    render();
    const link = container.querySelector('[data-testid="owner-profile-link"]')!;
    const event = new MouseEvent("click", { bubbles: true });
    const spy = vi.spyOn(event, "stopPropagation");
    act(() => {
      link.dispatchEvent(event);
    });
    expect(spy).toHaveBeenCalled();
  });

  it("renders the video description when present", () => {
    render();
    expect(container.querySelector('[data-testid="fullscreen-in-video-overlay"]')?.textContent).toContain("desc");
  });

  it("omits the description when item.video.description is absent", () => {
    render({
      item: makeReel({ video: { description: undefined, slug: "slug", thumbnail: undefined } }),
    });
    const overlay = container.querySelector('[data-testid="fullscreen-in-video-overlay"]');
    expect(overlay).toBeTruthy();
    // No description paragraph — only the owner nickname text remains.
    expect(overlay?.querySelectorAll("p").length).toBe(1);
  });
});
