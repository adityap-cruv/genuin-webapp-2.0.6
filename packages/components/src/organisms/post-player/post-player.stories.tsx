import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PostPlayer } from "./post-player";

const meta: Meta<typeof PostPlayer> = {
  title: "Organisms/PostPlayer",
  component: PostPlayer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen", // Full-width for video component
  },
};

export default meta;

type Story = StoryObj<typeof PostPlayer>;

export const Default: Story = {
  render: (args) => <PostPlayer {...args} />,
  args: {
    onVideoUrl: (url: string) => {
      console.log("Video URL from Storybook:", url);
    },
  },
};
