import type { Meta, StoryObj } from "@storybook/react";
import { ProfileItem, ProfileItemSkeleton } from "./profile-item";

const meta: Meta<typeof ProfileItem> = {
  title: "Molecules/ProfileItem",
  component: ProfileItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ProfileItem>;

export const Default: Story = {
  args: {
    username: "janedoe",
    isVerified: false,
    profileImage: {
      isAvatar: true,
      url: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  },
};

export const Verified: Story = {
  args: {
    username: "verifieduser",
    isVerified: true,
    profileImage: {
      isAvatar: true,
      url: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
};

export const WithImage: Story = {
  args: {
    username: "imageuser",
    isVerified: false,
    profileImage: {
      isAvatar: false,
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    },
  },
};

export const Skeleton: StoryObj = {
  render: () => <ProfileItemSkeleton />,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};
