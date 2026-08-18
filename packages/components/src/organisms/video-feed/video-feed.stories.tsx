import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { testFeedData } from "@genuin/components/organisms/embed/test-data-feed";

import { setDeviceMode } from "../../../.storybook/preview";

import { VideoFeed } from "./video-feed";

/** Same production feed fixture the Embed / Feed stories render against. */
const FIXTURE_POSTS = testFeedData.pages.flatMap((page) => page.feed);

const meta: Meta<typeof VideoFeed> = {
  title: "Organisms/VideoFeed",
  component: VideoFeed,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Vertical snap-scrolling video feed for our own pages. Same player pipeline as the web-sdk embed " +
          "(`PlayerProvider → FeedPlayer → Controls`), fed by `useFeed` from `videoId` / `communityId` / `groupId`. " +
          "Auto-advances on end, wheel / touch / keyboard scroll, top-right mute · play/pause · expand " +
          "(opens the real full-screen FeedView with actions, comments, linkouts), " +
          "bottom `date • duration • description`.",
      },
    },
  },
  args: {
    autoAdvance: true,
    loop: false,
    showControls: true,
    showMeta: true,
  },
  argTypes: {
    width: { control: "text" },
    height: { control: "text" },
    onActiveVideoChange: { action: "activeVideoChange" },
    onExpandChange: { action: "expandChange" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "92vw" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VideoFeed>;

/** Desktop (688×387) — renders the fixture feed without any network call. */
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
    const feed = await canvas.findByRole("region", { name: "Video feed" });
    await waitFor(() => expect(feed.querySelectorAll('[data-slot="video-feed-slide"]').length).toBeGreaterThan(0));
    await waitFor(() => expect(feed.querySelector('[data-slot="video-feed-meta"]')?.textContent).toMatch(/•/));
  },
};

/** Mobile (382×215). */
export const Mobile: Story = {
  args: { posts: FIXTURE_POSTS },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  decorators: [
    (Story) => {
      setDeviceMode("mobile");
      return (
        <Story />
      );
    },
  ],
};

/** Loops back to the first video after the last one ends. */
export const LoopingSingleVideo: Story = {
  args: { posts: FIXTURE_POSTS.slice(0, 1), loop: true },
};

/**
 * Live API — needs the Storybook env (`.env`) to point at a reachable API; edit the
 * ids in Controls. Falls into the empty / error state when the API is unavailable.
 */
export const ByCommunityId: Story = {
  args: { communityId: "1fa079ce3e000d64" },
};

export const ByGroupId: Story = {
  args: { groupId: "1fdbea0285001400" },
};

export const ByVideoId: Story = {
  args: { videoId: "d3462334-f4d1-497c-ae53-33c313485b4a" },
};

/** Empty state. */
export const Empty: Story = {
  args: { posts: [] },
};
