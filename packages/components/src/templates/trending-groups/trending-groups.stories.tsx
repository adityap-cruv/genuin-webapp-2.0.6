import type { Meta, StoryObj } from "@storybook/react";

import { TrendingGroups } from "./trending-groups";
import data from "./data.json";

const meta = {
  title: "templates/TrendingGroups",
  component: TrendingGroups,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    groups: [],
    isLoading: { control: { type: "boolean" } },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "36px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TrendingGroups>;

export default meta;
type Story = StoryObj<typeof TrendingGroups>;

export const Default: Story = {
  args: {
    groups: data,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Displays a list of trending groups with their title, members, post, users and descriptions.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    groups: [],
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Displays the empty state when there are no trending groups.",
      },
    },
  },
};
