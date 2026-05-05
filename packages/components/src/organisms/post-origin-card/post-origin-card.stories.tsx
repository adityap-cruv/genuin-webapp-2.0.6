import type { Meta, StoryObj } from "@storybook/react";

import { PostOriginCard, PostOriginCardSkeleton } from "./post-origin-card";

const meta: Meta<typeof PostOriginCard> = {
  title: "Organisms/PostOriginCard",
  component: PostOriginCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PostOriginCard>;

export const Default: Story = {
  args: {
    community: {
      name: "Tech Community",
      slug: "tech-community",
    },
    group: {
      name: "Frontend Developers",
      slug: "frontend-developers",
      actions: [
        {
          access_type_id: 1,
          action_id: 3,
        },
      ],
    },
  },
};

export const Skeleton: Story = {
  render: () => <PostOriginCardSkeleton />,
};
