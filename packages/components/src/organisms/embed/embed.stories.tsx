import type { Meta, StoryObj } from "@storybook/react";

import { Embed } from "./embed";
import { testFeedData } from "./test-data-feed";

// Non-sectioned variant — used for Carousel and Grid stories
const testFeedDataUnsectioned = {
  ...testFeedData,
  pages: testFeedData.pages.map((page) => ({ ...page, hasSection: false })),
};

const meta: Meta<typeof Embed> = {
  title: "Organisms/Web-SDK/Embed",
  component: Embed,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "To render the section view, set `hasSection` to `true` in the feedData.pages[]. To render the default (unsectioned) view, set `hasSection` to `false`.",
      },
    },
  },
  argTypes: {
    wasLazilyLoaded: {
      control: "boolean",
      description:
        "Whether the embed was lazily loaded into the viewport. Affects when the EMBED_VIEWED analytics event fires.",
      defaultValue: false,
    },
    feedData: {
      description:
        "Pre-fetched feed data. When provided it bypasses the internal API call. Each page must match the FeedPage shape. Set `hasSection: true` on a page to enable the sectioned layout.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Embed>;

export const Carousel: Story = {
  name: "Embed Carousel",
  args: {
    feedData: testFeedDataUnsectioned,
    wasLazilyLoaded: false,
  },
};

export const Feed: Story = {
  name: "Embed Feed",
  args: {
    feedData: testFeedData,
    wasLazilyLoaded: false,
  },
};

export const Grid: Story = {
  name: "Embed Grid",
  args: {
    feedData: testFeedDataUnsectioned,
    wasLazilyLoaded: false,
  },
};
