import { describe, expect, it, vi } from "vitest";

// Importing the organism pulls the player chain; stub the heavy leaves (see video-feed.test.ts).
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
vi.hoisted(() => {
  if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = (() => ({
      fillStyle: "",
      fillRect: () => undefined,
      getImageData: () => ({ data: [] }),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
});

import { VIDEO_GRID_TILE_SIZE } from "./video-grid";

describe("VIDEO_GRID_TILE_SIZE", () => {
  it("desktop 2×2 with an 8 px gap is 1044×590", () => {
    const { width, height, columns } = VIDEO_GRID_TILE_SIZE.desktop;
    expect(columns).toBe(2);
    expect(width * 2 + 8).toBe(1044);
    expect(height * 2 + 8).toBe(590);
  });

  it("mobile 1×4 with an 8 px gap is 382×884", () => {
    const { width, height, columns } = VIDEO_GRID_TILE_SIZE.mobile;
    expect(columns).toBe(1);
    expect(width).toBe(382);
    expect(height * 4 + 8 * 3).toBe(884);
  });
});
