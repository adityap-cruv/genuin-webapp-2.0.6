import type { Meta, StoryObj } from "@storybook/react";

import { TrendingGroupCard, TrendingGroupCardSkeleton } from "./trending-group-card";

const meta: Meta<typeof TrendingGroupCard> = {
  title: "Organisms/TrendingGroupCard",
  component: TrendingGroupCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Add argTypes here if the component has props
  },
};

export default meta;

type Story = StoryObj<typeof TrendingGroupCard>;

export const Default: Story = {
  args: {
    groupName: "TED Talks",
    memberCount: 8383,
    postCount: 878,
    userAvatars: [
      {
        imageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
        alt: "Profile Image",
        isAvatar: false,
        userName: "jon",
        name: "jon",
      },
      {
        imageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
        alt: "Profile Image",
        isAvatar: false,
        userName: "pick",
        name: "pick",
      },
      {
        imageUrl: "https://randomuser.me/api/portraits/women/3.jpg",
        alt: "Profile Image",
        isAvatar: false,
        userName: "john",
        name: "john",
      },
      {
        imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
        alt: "Profile Image",
        isAvatar: false,
        userName: "mexy",
        name: "mexy",
      },
    ],
    slug: "ted-talks",
    description:
      "It's going to be a fun, chill year! 2025 is going to be enjoyable for you. You will most likely be seen at pool parties, outings with your friends, or simply revelling in the things you like to do best. It's going to be a fun, chill year! 2025 is going to be enjoyable for you. You will most likely be seen at pool parties, outings with your friends, or simply revelling in the things you like to do best. It's going to be a fun, chill year! 2025 is going to be enjoyable for you. You will most likely be seen at pool parties, outings with your friends, or simply revelling in the things you like to do best.",
    postData: [
      {
        imageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
        alt: "Profile Image",
        slug: "post-1",
      },
      {
        imageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
        alt: "Profile Image",
        slug: "post-2",
      },
      {
        imageUrl: "https://randomuser.me/api/portraits/women/3.jpg",
        alt: "Profile Image",
        slug: "post-3",
      },
    ],
  },
};

export const Skeleton: Story = {
  render: (_args) => {
    return (
      <div className="gencl:w-[750px]">
        <TrendingGroupCardSkeleton />
      </div>
    );
  },
};
