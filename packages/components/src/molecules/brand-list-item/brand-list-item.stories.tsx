import type { Meta, StoryObj } from "@storybook/react";

import { BrandListItem, BrandListItemSkeleton } from "./brand-list-item";

const meta: Meta<typeof BrandListItem> = {
  title: "Molecules/Brand List Item",
  component: BrandListItem,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof BrandListItem>;

export const Default: Story = {
  args: {
    label: "example.com",
    avatar: {
      url: "https://randomuser.me/api/portraits/men/32.jpg",
      isAvatar: false,
    },
  },
};

export const Skeleton: Story = {
  render: () => {
    return <BrandListItemSkeleton />;
  },
};
