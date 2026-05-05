import type { Meta, StoryObj } from "@storybook/react";

import { CreatePost } from "./create-post";
import { EditPostSkeleton } from "./edit-post-skeleton";

// Component meta configuration
const meta: Meta<typeof CreatePost> = {
  title: "Organisms/CreatePost",
  component: CreatePost,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof CreatePost>;

// Default "upload video" state
export const Upload: Story = {
  render: () => <CreatePost />,
};

// When there's already a draft or active post
export const WithPostId: Story = {
  render: () => <CreatePost postId="206ee6e6-8ae3-4abc-808c-04871f17e330" />,
};

// When there's a draft ID
export const WithDraftId: Story = {
  render: () => <CreatePost draftId="f3b357f9-f0a1-4e48-97e4-2532aa6e071e" />,
};

// Just the skeleton loader
export const Skeleton: Story = {
  render: () => <EditPostSkeleton />,
};
