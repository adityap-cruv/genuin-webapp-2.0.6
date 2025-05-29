import type { Meta, StoryObj } from "@storybook/react-vite";

import { Feed } from "./feed";

const meta: Meta<typeof Feed> = {
  title: "Templates/Feed",
  component: Feed,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Feed>;

export const Default: Story = {
  args: { feedType: "HOME" },
};
