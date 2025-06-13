import type { Meta, StoryObj } from "@storybook/react";
import { TrendingProfilesList } from "./trending-profiles-list";
import data from "./data.json";

const meta: Meta<typeof TrendingProfilesList> = {
  title: "Organisms/Trending Profiles List",
  component: TrendingProfilesList,
  tags: ["autodocs"],
  parameters: {
    layout: "started",
  },
};

export default meta;

type Story = StoryObj<typeof TrendingProfilesList>;

export const Default: Story = {
  args: {
    profiles: data,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Displays a list of trending profiles with avatars, usernames, and verification status.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    profiles: [],
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the loading skeleton for trending profiles.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    profiles: [],
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Displays the empty state when there are no trending profiles.",
      },
    },
  },
};

export const SingleProfile: Story = {
  args: {
    profiles: [
      {
        username: "janedoe",
        is_verified: true,
        is_avatar: true,
        profile_img: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    ],
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Displays a single trending profile.",
      },
    },
  },
};
