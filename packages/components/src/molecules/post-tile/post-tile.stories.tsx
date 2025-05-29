import type { Meta, StoryObj } from "@storybook/react";

import { PostTile } from "./post-tile";

const meta: Meta<typeof PostTile> = {
  title: "Molecules/PostTile",
  component: PostTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    showHover: { control: "boolean" },
    size: { control: "select", options: ["sm", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof PostTile>;

export const Default: Story = {
  args: {
    postData: {
      postId: "1",
      imageUrl:
        "https://media.qa.begenuin.com/uploads/thumbnails/1691038031235.png",
      linkouts: "ldjfl",
      stats: {
        views: 12345,
        comments: 678,
        shares: 90,
      },
      isPinned: true,
    },
    size: "sm",
    showHover: true,
    imageCompProps: {
      useWebp: false,
    },
  },
};
