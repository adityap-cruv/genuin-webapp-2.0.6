import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { DefaultBottomBar } from "@cxr/controls/bottombar/DefaultBottomBar";
import type { NormalisedReel, TagResponse } from "@cxr/types";

// useOctoSplit drives the "split" branches (sheet owns the surface → every bar
// element hides). A mutable flag lets individual tests flip splitActive on.
let splitActive = false;
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
    splitActive,
    playerShare: 1,
  })),
}));

const shareMocks = vi.hoisted(() => ({
  openShareLink: vi.fn(),
  copyToClipboard: vi.fn(() => Promise.resolve()),
}));
vi.mock("@cxr/utils/share", () => shareMocks);

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
    splitActive = false;
    shareMocks.openShareLink.mockClear();
    shareMocks.copyToClipboard.mockClear();
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

  it("supports the legacy show_cta on tagDetails root (not under config)", () => {
    render({ tagDetails: { tag_id: "tag-1", config: {}, show_cta: true, cta: { text: "Go", link: "https://x.com" } } });
    expect(container.querySelector('[data-testid="bottombar-cta"]')).toBeTruthy();
  });

  it("spark click opens the share link via openShareLink", () => {
    render({
      item: makeReel({
        video: { description: "Test description", slug: "test-video", share_string: "https://begenuin.com/v/x" },
      }),
    });
    act(() => {
      (container.querySelector('[data-testid="bottombar-spark"]') as HTMLButtonElement).click();
    });
    expect(shareMocks.openShareLink).toHaveBeenCalledWith("https://begenuin.com/v/x");
  });

  it("share click copies the share url via copyToClipboard", () => {
    render({
      item: makeReel({
        video: { description: "Test description", slug: "test-video", share_string: "https://begenuin.com/v/x" },
      }),
    });
    act(() => {
      (container.querySelector('[data-testid="bottombar-share"]') as HTMLButtonElement).click();
    });
    expect(shareMocks.copyToClipboard).toHaveBeenCalledWith("https://begenuin.com/v/x");
  });

  it("renders ad-copy when item.cta.ad_copy is set and no OG meta", () => {
    render({ item: makeReel({ cta: { ad_copy: "Sponsored message" } }) });
    const adCopy = container.querySelector('[data-testid="bottombar-ad-copy"]');
    expect(adCopy).toBeTruthy();
    expect(adCopy?.textContent).toContain("Sponsored message");
  });

  it("renders OG meta (with image + title) when show_url_meta and ogDetails exist", () => {
    render({
      item: makeReel({
        cta: { show_url_meta: true },
        ogDetails: { og_image: "https://example.com/og.png", og_title: "OG Title" },
      }),
    });
    const og = container.querySelector('[data-testid="bottombar-og"]');
    expect(og).toBeTruthy();
    expect(og?.textContent).toContain("OG Title");
    expect(og?.querySelector("img")).toBeTruthy();
  });

  it("OG meta omits the image when og_image is absent", () => {
    render({
      item: makeReel({
        cta: { show_url_meta: true },
        ogDetails: { og_title: "OG Title only" },
      }),
    });
    const og = container.querySelector('[data-testid="bottombar-og"]')!;
    expect(og.querySelector("img")).toBeNull();
  });

  it("skips OG details for pip player type, falling back to ad-copy", () => {
    render({
      item: makeReel({
        playerType: "pip",
        cta: { show_url_meta: true, ad_copy: "Fallback copy" },
        ogDetails: { og_image: "https://example.com/og.png", og_title: "Ignored" },
      }),
    });
    // pip nulls ogDetails, so the OG block is skipped and ad-copy renders instead.
    expect(container.querySelector('[data-testid="bottombar-og"]')).toBeNull();
    expect(container.querySelector('[data-testid="bottombar-ad-copy"]')?.textContent).toContain("Fallback copy");
  });

  it("renders no ad-copy or OG row when neither is present", () => {
    render({ item: makeReel({ cta: null, ogDetails: null }) });
    expect(container.querySelector('[data-testid="bottombar-og"]')).toBeNull();
    expect(container.querySelector('[data-testid="bottombar-ad-copy"]')).toBeNull();
  });

  describe("iheart variant", () => {
    it("always renders all four action buttons regardless of config", () => {
      render({ variant: "iheart", tagDetails: { tag_id: "tag-1", config: {} } });
      expect(container.querySelector('[data-testid="bottombar-spark"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="bottombar-play"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="bottombar-mute"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="bottombar-share"]')).toBeTruthy();
    });

    it("play button fires onPlayClick and shows the pause icon when playing", () => {
      const onPlayClick = vi.fn();
      render({ variant: "iheart", isPlay: true, onPlayClick });
      const playImg = container.querySelector('[data-testid="bottombar-play"] img') as HTMLImageElement;
      expect(playImg.getAttribute("src")).toContain("pause.svg");
      act(() => {
        (container.querySelector('[data-testid="bottombar-play"]') as HTMLButtonElement).click();
      });
      expect(onPlayClick).toHaveBeenCalledOnce();
    });

    it("mute button fires onMuteClick and shows the mute icon when muted", () => {
      const onMuteClick = vi.fn();
      render({ variant: "iheart", isMuted: true, onMuteClick });
      const muteImg = container.querySelector('[data-testid="bottombar-mute"] img') as HTMLImageElement;
      expect(muteImg.getAttribute("src")).toContain("mute.svg");
      act(() => {
        (container.querySelector('[data-testid="bottombar-mute"]') as HTMLButtonElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledOnce();
    });

    it("renders the iheart action rail even in fullscreen", () => {
      render({ variant: "iheart", isFullScreen: true });
      expect(container.querySelector('[data-testid="bottombar-actions"]')).toBeTruthy();
    });
  });

  it("default variant hides the action rail in fullscreen", () => {
    render({ isFullScreen: true });
    expect(container.querySelector('[data-testid="bottombar-actions"]')).toBeNull();
  });

  describe("split (Octo sheet owns the surface)", () => {
    beforeEach(() => {
      splitActive = true;
    });

    it("hides profile, actions, CTA and meta when split is active", () => {
      render({
        tagDetails: {
          tag_id: "tag-1",
          config: { show_owner_details: true, show_spark: true, show_share: true, show_cta: true },
          cta: { text: "Learn More", link: "https://example.com" },
        },
        item: makeReel({ cta: { ad_copy: "Sponsored" } }),
      });
      expect(container.querySelector('[data-testid="default-bottom-bar"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="owner-profile-link"]')).toBeNull();
      expect(container.querySelector('[data-testid="bottombar-actions"]')).toBeNull();
      expect(container.querySelector('[data-testid="bottombar-cta"]')).toBeNull();
      expect(container.querySelector('[data-testid="bottombar-ad-copy"]')).toBeNull();
    });
  });

  it("renders at 300x250 (small) dimensions without error", () => {
    render({ dimensions: { width: 300, height: 250 } });
    expect(container.querySelector('[data-testid="default-bottom-bar"]')).toBeTruthy();
  });

  it("renders the profile avatar from a remote https url and the description", () => {
    render();
    const img = container.querySelector('[data-testid="owner-profile-link"] img') as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("https://example.com/alice.jpg");
    expect(container.querySelector('[data-testid="default-bottom-bar"]')?.textContent).toContain("Test description");
  });

  it("falls back to the avatar asset path when the profile image is not an https url", () => {
    render({
      item: makeReel({
        owner: { share_string: "https://begenuin.com/user/bob", nickname: "bob", profile_image: "bob-avatar" },
      }),
    });
    const img = container.querySelector('[data-testid="owner-profile-link"] img') as HTMLImageElement;
    expect(img.getAttribute("src")).toContain("assets/avatar/bob-avatar.gif");
  });

  it("swaps the profile avatar to the penguin fallback when the image fails to load", () => {
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

  it("stops click propagation on the CTA button", () => {
    render({
      tagDetails: {
        tag_id: "tag-1",
        config: { show_cta: true },
        cta: { text: "Learn More", link: "https://example.com" },
      },
    });
    const cta = container.querySelector('[data-testid="bottombar-cta"] a')!;
    const event = new MouseEvent("click", { bubbles: true });
    const spy = vi.spyOn(event, "stopPropagation");
    act(() => {
      cta.dispatchEvent(event);
    });
    expect(spy).toHaveBeenCalled();
  });

  it("play button fires onPlayClick in the iheart variant", () => {
    const onPlayClick = vi.fn();
    render({ variant: "iheart", onPlayClick });
    act(() => {
      (container.querySelector('[data-testid="bottombar-play"]') as HTMLButtonElement).click();
    });
    expect(onPlayClick).toHaveBeenCalledOnce();
  });

  it("mute button fires onMuteClick in the iheart variant", () => {
    const onMuteClick = vi.fn();
    render({ variant: "iheart", onMuteClick });
    act(() => {
      (container.querySelector('[data-testid="bottombar-mute"]') as HTMLButtonElement).click();
    });
    expect(onMuteClick).toHaveBeenCalledOnce();
  });
});
