import type { Meta, StoryObj } from "@storybook/react";
import { TrendingCommunities } from "./trending-communities";

const meta: Meta<typeof TrendingCommunities> = {
  title: "Templates/TrendingCommunities",
  component: TrendingCommunities,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof TrendingCommunities>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Displays a list of trending communities with their banners, avatars, descriptions, and stats.",
      },
    },
  },
};
