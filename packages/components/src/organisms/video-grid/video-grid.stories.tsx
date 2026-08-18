import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { testFeedData } from "@genuin/components/organisms/embed/test-data-feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { setDeviceMode } from "../../../.storybook/preview";

import { VideoGrid } from "./video-grid";

const ALL_POSTS = testFeedData.pages.flatMap((page) => page.feed);
const DEMO_LINKOUTS = ALL_POSTS.find((post) => Array.isArray(post.video?.linkouts) && post.video.linkouts.length)
  ?.video?.linkouts;

/**
 * Production feed fixture, marked sponsored and given a linkout on every video so the
 * "Sponsored" pill and the CTA bar render on all tiles like the design.
 */
const FIXTURE_POSTS: PostDetailsType[] = ALL_POSTS.map((post) => ({
  ...post,
  video: post.video
    ? {
        ...post.video,
        cardLayoutId: 7,
        linkouts: Array.isArray(post.video.linkouts) && post.video.linkouts.length ? post.video.linkouts : DEMO_LINKOUTS,
        linkoutId: post.video.linkoutId ?? 4046,
      }
    : post.video,
}));

const meta: Meta<typeof VideoGrid> = {
  title: "Organisms/VideoGrid",
  component: VideoGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Grid of `VideoFeed` tiles — 2×2 on desktop (tiles 518×291, 1044×590 total), single column " +
          "on mobile (tiles 382×215, 382×884 total). One tile plays at a time, auto-advances to the next " +
          "(wrapping), tap a tile to activate it, expand opens the full-screen FeedView. Each tile: " +
          "Sponsored pill, mute · play/pause · expand (active tile), `date • duration • description`, " +
          "linkout CTA bar. Data via `videoId` / `videoIds` / `communityId` / `groupId` or static `posts`.",
      },
    },
  },
  args: { autoAdvance: true, loop: true, showControls: true, showMeta: true, showLinkouts: true, showSponsoredTag: true },
  argTypes: {
    onActiveVideoChange: { action: "activeVideoChange" },
    onExpandChange: { action: "expandChange" },
  },
};

export default meta;
type Story = StoryObj<typeof VideoGrid>;

/** Desktop 2×2 (1044×590). */
export const Desktop: Story = {
  args: { posts: FIXTURE_POSTS },
  decorators: [
    (Story) => {
      setDeviceMode("desktop");
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = await canvas.findByRole("region", { name: "Video grid" });
    await waitFor(() => expect(grid.querySelectorAll('[data-slot="video-grid-tile"]').length).toBe(4));
    await waitFor(() => expect(grid.querySelector('[data-slot="video-feed-meta"]')?.textContent).toMatch(/•/));
  },
};

/** Mobile single column (382×884). */
export const Mobile: Story = {
  args: { posts: FIXTURE_POSTS },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  decorators: [
    (Story) => {
      setDeviceMode("mobile");
      return <Story />;
    },
  ],
};

/** Live API — edit the ids in Controls; needs the Storybook `.env` API to be reachable. */
export const ByCommunityId: Story = { args: { communityId: "1fa079ce3e000d64" } };
export const ByGroupId: Story = { args: { groupId: "1fdbea0285001400" } };
export const ByVideoIds: Story = { args: { videoIds: ["d3462334-f4d1-497c-ae53-33c313485b4a"] } };

export const Empty: Story = { args: { posts: [] } };
