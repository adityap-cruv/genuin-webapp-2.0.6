import { describe, expect, it, vi } from "vitest";

// The organism file also pulls the player / feed / skeleton chain (lottie, swiper …), which
// has no business in a pure-helper unit test — stub the heavy leaves out.
vi.mock("@genuin/components/molecules/feed-player/context", () => ({ PlayerProvider: () => null }));
vi.mock("@genuin/components/react-query/api/feed/feed", () => ({ useFeed: () => ({}) }));
vi.mock("@genuin/components/templates/feed/feed-skeleton", () => ({
  FEED_SKELETON_THEME: { light: {}, dark: {} },
  FeedSkeleton: () => null,
  PlayerSkeleton: () => null,
}));
vi.mock("@genuin/components/molecules/error/safe-suspense", () => ({ SafeSuspense: () => null }));
vi.mock("@genuin/components/context/base", () => ({ useBaseContext: () => ({}) }));
vi.mock("@genuin/components/context", () => ({ VideoTypes: { Content: "content" } }));
vi.mock("swiper/css", () => ({}));
// `lottie-web` (reached through `@genuin/ui`) touches a 2D canvas at import time; jsdom has none.
vi.hoisted(() => {
  if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = (() => ({
      fillStyle: "",
      fillRect: () => undefined,
      getImageData: () => ({ data: [] }),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
});

import { buildVideoMetaParts, buildVideoMetaText, getVideoDescriptionText } from "./video-feed";
import { resolveVideoFeedQuery } from "./video-feed";

// 90 s duration, timestamp well in the past so `getMonthYear` yields "Jan 6, 2026".
const JAN_6_2026 = Date.UTC(2026, 0, 6, 12);

const baseVideo = {
  createdAt: JAN_6_2026,
  duration: 90,
  descritptionText: "Short clip description",
  description: null,
  attributes: null,
} as unknown as Parameters<typeof buildVideoMetaParts>[0];

describe("buildVideoMetaParts", () => {
  it("builds date • duration • description", () => {
    expect(buildVideoMetaParts(baseVideo)).toEqual(["Jan 6, 2026", "1 min 30 sec", "Short clip description"]);
    expect(buildVideoMetaText(baseVideo)).toBe("Jan 6, 2026 • 1 min 30 sec • Short clip description");
  });

  it("omits missing parts instead of rendering empty separators", () => {
    expect(buildVideoMetaText({ ...baseVideo!, duration: 0, descritptionText: null })).toBe("Jan 6, 2026");
    expect(buildVideoMetaText({ ...baseVideo!, createdAt: -1 })).toBe("1 min 30 sec • Short clip description");
    expect(buildVideoMetaText(null)).toBe("");
  });

  it("prefers attributes.timestamp over createdAt (same rule as placement metadata)", () => {
    const parts = buildVideoMetaParts({
      ...baseVideo!,
      attributes: { timestamp: Date.UTC(2025, 11, 25, 12) } as never,
    });
    expect(parts[0]).toBe("Dec 25, 2025");
  });
});

describe("getVideoDescriptionText", () => {
  it("flattens array descriptions of strings and { text } runs", () => {
    expect(
      getVideoDescriptionText({
        descritptionText: null,
        description: ["Hello", { text: "world" }, ""] as never,
        attributes: null,
      })
    ).toBe("Hello world");
  });

  it("falls back to attributes.title", () => {
    expect(
      getVideoDescriptionText({ descritptionText: null, description: null, attributes: { title: "Title" } as never })
    ).toBe("Title");
  });
});

describe("resolveVideoFeedQuery", () => {
  it("videoId alone → VIDEO feed with videoIds", () => {
    expect(resolveVideoFeedQuery({ videoId: "v1" })).toEqual({
      feedType: "VIDEO",
      options: { isInIframe: false, videoIds: ["v1"] },
      hasSource: true,
    });
  });

  it("communityId → FEED_V1 with community_ids", () => {
    expect(resolveVideoFeedQuery({ communityId: "c1" }).options).toEqual({ isInIframe: false, communityIds: ["c1"] });
  });

  it("groupId → FEED_V1 with loop_ids (groupIds)", () => {
    const result = resolveVideoFeedQuery({ groupId: "g1" });
    expect(result.feedType).toBe("FEED_V1");
    expect(result.options).toEqual({ isInIframe: false, groupIds: ["g1"] });
  });

  it("videoId + communityId → community feed with the video prepended", () => {
    expect(resolveVideoFeedQuery({ videoId: "v1", communityId: "c1" })).toEqual({
      feedType: "FEED_V1",
      options: { isInIframe: false, communityIds: ["c1"], initialVideoIds: ["v1"] },
      hasSource: true,
    });
  });

  it("no source → nothing to fetch", () => {
    expect(resolveVideoFeedQuery({}).hasSource).toBe(false);
  });
});
