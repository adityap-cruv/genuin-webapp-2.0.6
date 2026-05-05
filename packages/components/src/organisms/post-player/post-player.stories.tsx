import type { Meta, StoryObj } from "@storybook/react";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { testPostDetails } from "../../__test-data__/test-data";

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
  render: () => <PostPlayer post={testPostDetails as unknown as PostDetailsType} />,
};
