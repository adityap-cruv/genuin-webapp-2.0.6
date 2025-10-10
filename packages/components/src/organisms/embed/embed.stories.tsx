import type { Meta, StoryObj } from "@storybook/react";
import { Embed } from "./embed";
import { testFeedData } from "./test-data-feed";

const meta: Meta<typeof Embed> = {
  title: "Organisms/Web-SDK/Embed",
  component: Embed,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "To render the section view, set `sectioned` to `true` in the feedData.pages[]. To render the default (unsectioned) view, set `sectioned` to `false`.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Embed>;

export const Carousel: Story = {
  name: "Embed Carousel",
  args: {
    // feedData: testFeedData,
  },
};

export const Feed: Story = {
  name: "Embed Feed",
  args: {
    // feedData: testFeedData,
  },
};

export const Grid: Story = {
  name: "Embed Grid",
  args: {
    // feedData: testFeedData,
  },
};
