import type { Meta, StoryObj } from "@storybook/react";

import { testFeedData } from "@genuin/components/organisms/embed/test-data-feed";
import type { FeedData } from "@genuin/components/templates/feed/feed.types";
import { VideoCarousel } from "./video-carousel";

const feedVideos = testFeedData.pages.flatMap((page) => page.feed);

const fixtureFeedData: FeedData = {
  queryKey: ["fixture", "HOME"],
  videos: feedVideos,
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: () => undefined,
  totalVideos: feedVideos.length,
  pageSession: testFeedData.pages[0]?.pageSession,
};

const meta: Meta<typeof VideoCarousel> = {
  title: "Organisms/Video Carousel",
  component: VideoCarousel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: "560px", padding: "24px", boxSizing: "border-box" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    feedType: {
      control: "select",
      options: ["HOME", "COMMUNITY", "GROUP", "VIDEO_SLUG", "PROFILE", "TRENDING", "SEARCH"],
      description: "Feed type to fetch when used with live API queries",
    },
    ctaText: {
      control: "text",
      description: "Optional global CTA button text override",
    },
    controlSize: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of top video control buttons",
    },
  },
};

export default meta;

type Story = StoryObj<typeof VideoCarousel>;

export const Default: Story = {
  name: "Default Video Carousel",
  args: {
    feedType: "HOME",
    externalFeedData: fixtureFeedData,
  },
};

export const CustomCTA: Story = {
  name: "With Custom CTA Text",
  args: {
    feedType: "HOME",
    externalFeedData: fixtureFeedData,
    ctaText: "Explore Now",
  },
};
