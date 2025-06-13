import type { Meta, StoryObj } from "@storybook/react";
import { CommunityCard, CommunityCardSkeleton } from "./community-card";
import type { CommunityCardProps } from "./community-card.types";

const meta: Meta<typeof CommunityCard> = {
  title: "Organisms/CommunityCard",
  component: CommunityCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    community: { control: "object", description: "Community data" },
    width: {
      control: { type: "text" },
      description: "Set the width of the card (e.g. 400px, 100%)",
      table: { disable: false },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommunityCard>;

const baseCommunity = {
  name: "Frontend Masters",
  dp: "https://randomuser.me/api/portraits/men/32.jpg",
  banner: "https://picsum.photos/400/300",
  description:
    "A community for frontend developers to share, learn, and grow together.",
  stats: {
    members: 3200,
    groups: 12,
    posts: 540,
  },
};

export const Default: Story = {
  args: {
    community: baseCommunity,
    width: "400px",
  },
  render: (args) => (
    <div style={{ width: args.width ?? "400px" }}>
      <CommunityCard community={args.community} />
    </div>
  ),
};

export const WithLongName: Story = {
  args: {
    community: {
      ...baseCommunity,
      name: "Frontend Masters – The Ultimate Community for Frontend Engineers, Designers, and Web Enthusiasts Worldwide",
    },
    width: "400px",
  },
  render: (args) => (
    <div style={{ width: args.width ?? "400px" }}>
      <CommunityCard community={args.community} />
    </div>
  ),
};

export const WithNoDescription: Story = {
  args: {
    community: {
      ...baseCommunity,
      description: "",
    },
    width: "400px",
  },
  render: (args) => (
    <div style={{ width: args.width ?? "400px" }}>
      <CommunityCard community={args.community} />
    </div>
  ),
};

export const LargeStats: Story = {
  args: {
    community: {
      ...baseCommunity,
      stats: {
        members: 120000,
        groups: 120,
        posts: 25000,
      },
    },
    width: "400px",
  },
  render: (args) => (
    <div style={{ width: args.width ?? "400px" }}>
      <CommunityCard community={args.community} />
    </div>
  ),
};

export const Skeleton: StoryObj = {
  args: {
    width: "400px",
  },
  render: (args) => (
    <div style={{ width: args.width ?? "400px" }}>
      <CommunityCardSkeleton className={args.className} />
    </div>
  ),
  argTypes: {
    community: { table: { disable: true } },
  },
};
