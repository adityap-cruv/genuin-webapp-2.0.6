import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostDetails } from "./post-details";

const meta: Meta<typeof PostDetails> = {
  title: "Components/PostDetails",
  component: PostDetails,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PostDetails>;

export const Default: Story = {
  args: {},
};
