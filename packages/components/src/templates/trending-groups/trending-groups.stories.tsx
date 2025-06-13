import type { Meta, StoryObj } from "@storybook/react";
import { TrendingGroups } from "./trending-groups";

const meta: Meta<typeof TrendingGroups> = {
  title: "templates/TrendingGroups",
  component: TrendingGroups,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof TrendingGroups>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Displays a list of trending groups with their title, members, post, users and descriptions.",
      },
    },
  },
};
