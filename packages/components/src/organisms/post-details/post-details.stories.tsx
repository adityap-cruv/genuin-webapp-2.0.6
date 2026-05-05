import type { Meta, StoryObj } from "@storybook/react-vite";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { testPostDetails } from "../../__test-data__/test-data";

import { PostDetails } from "./post-details";

const meta: Meta<typeof PostDetails> = {
  title: "Components/PostDetails",
  component: PostDetails,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PostDetails>;

export const Default: Story = {
  render: () => <PostDetails postDetails={testPostDetails as unknown as PostDetailsType} />,
};
