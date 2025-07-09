import type { Meta, StoryObj } from "@storybook/react";
import { CommunityCard, CommunityCardSkeleton } from "./community-card";
import type { CommunityCardProps } from "./community-card.types";

type StoryProps = CommunityCardProps & {
  width?: string;
};

const meta: Meta<StoryProps> = {
  title: "Organisms/CommunityCard",
  component: CommunityCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    community: { control: "object", description: "Community data" },
    variant: {
      control: { type: "select" },
      options: ["explore", "search", "suggestion", "recent"],
      description: "Visual variant of the card",
      table: { disable: false },
    },
    url: {
      control: { type: "text" },
      description: "URL to navigate when community name is clicked",
      table: { disable: false },
    },
    width: {
      control: { type: "text" },
      description: "Set the width of the card (e.g. 400px, 100%)",
      table: { disable: false },
    },
  },
};

export default meta;
type Story = StoryObj<StoryProps>;

const baseCommunity = {
  id: "frontend-masters",
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
  type: "PUBLIC" as "PUBLIC",
};

export const Default: Story = {
  args: {
    community: baseCommunity,
    variant: "explore",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const WithLongName: Story = {
  args: {
    community: {
      ...baseCommunity,
      name: "Frontend Masters – The Ultimate Community for Frontend Engineers, Designers, and Web Enthusiasts Worldwide",
    },
    variant: "explore",
    width: "400px",
    url: "/community/frontend-masters-ultimate",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const WithNoDescription: Story = {
  args: {
    community: {
      ...baseCommunity,
      description: "",
    },
    variant: "explore",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
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
    variant: "explore",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const Search: Story = {
  args: {
    community: {
      ...baseCommunity,
      description:
        "A community for frontend developers to share, learn, and grow together. Join us to connect with like-minded individuals and enhance your skills.",
    },
    variant: "search",
    width: "600px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "600px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};
export const SearchWithNoDescription: Story = {
  args: {
    community: {
      ...baseCommunity,
      description: "",
    },
    variant: "search",
    width: "600px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "600px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const SearchLargeStats: Story = {
  args: {
    community: {
      ...baseCommunity,
      stats: {
        members: 8400000,
        groups: 10,
        posts: 680,
      },
    },
    variant: "search",
    width: "600px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "600px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};
export const SearchWithLongName: Story = {
  args: {
    community: {
      ...baseCommunity,
      name: "Frontend Masters – The Ultimate Community for Frontend Engineers, Designers, and Web Enthusiasts Worldwide",
    },
    variant: "search",
    width: "600px",
    url: "/community/frontend-masters-ultimate",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "600px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const Suggestion: Story = {
  args: {
    community: baseCommunity,
    variant: "suggestion",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const SuggestionWithLongName: Story = {
  args: {
    community: {
      ...baseCommunity,
      name: "Frontend Masters – The Ultimate Community for Frontend Engineers, Designers, and Web Enthusiasts Worldwide",
    },
    variant: "suggestion",
    width: "400px",
    url: "/community/frontend-masters-ultimate",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const SuggestionLargeStats: Story = {
  args: {
    community: {
      ...baseCommunity,
      stats: {
        members: 8400000,
        groups: 10,
        posts: 680000,
      },
    },
    variant: "suggestion",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const SuggestionPrivate: Story = {
  args: {
    community: {
      ...baseCommunity,
      name: "Private Frontend Community",
      type: "PRIVATE" as "PRIVATE",
    },
    variant: "suggestion",
    width: "400px",
    url: "/community/private-frontend",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const SuggestionList: Story = {
  args: {
    community: baseCommunity,
    variant: "suggestion",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg shadow-sm">
        {/* <h3 className="text-sm font-medium text-gray-900 mb-2">
          Community Suggestions
        </h3> */}
        <CommunityCard {...args} />
        <CommunityCard
          {...args}
          community={{
            ...baseCommunity,
            id: "react-dev",
            name: "React Developers",
            stats: { members: 15600, groups: 8, posts: 1200 },
          }}
          url="/community/react-dev"
        />
        <CommunityCard
          {...args}
          community={{
            ...baseCommunity,
            id: "ui-ux",
            name: "UI/UX Design Hub",
            type: "PRIVATE" as "PRIVATE",
            stats: { members: 2800, groups: 5, posts: 340 },
          }}
          url="/community/ui-ux-design"
        />
      </div>
    </div>
  ),
};

export const Recent: Story = {
  args: {
    community: baseCommunity,
    variant: "recent",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const RecentWithLongName: Story = {
  args: {
    community: {
      ...baseCommunity,
      name: "Frontend Masters – The Ultimate Community for Frontend Engineers, Designers, and Web Enthusiasts Worldwide",
    },
    variant: "recent",
    width: "400px",
    url: "/community/frontend-masters-ultimate",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const RecentPrivate: Story = {
  args: {
    community: {
      ...baseCommunity,
      name: "Private Frontend Community",
      type: "PRIVATE" as "PRIVATE",
    },
    variant: "recent",
    width: "400px",
    url: "/community/private-frontend",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <CommunityCard {...args} />
    </div>
  ),
};

export const RecentList: Story = {
  args: {
    community: baseCommunity,
    variant: "recent",
    width: "400px",
    url: "/community/frontend-masters",
  },
  render: ({ width, ...args }) => (
    <div style={{ width: width ?? "400px" }}>
      <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg shadow-sm">
        <CommunityCard {...args} />
        <CommunityCard
          {...args}
          community={{
            ...baseCommunity,
            id: "react-dev",
            name: "React Developers",
            stats: { members: 15600, groups: 8, posts: 1200 },
          }}
          url="/community/react-dev"
        />
        <CommunityCard
          {...args}
          community={{
            ...baseCommunity,
            id: "ui-ux",
            name: "UI/UX Design Hub",
            type: "PRIVATE" as "PRIVATE",
            stats: { members: 2800, groups: 5, posts: 340 },
          }}
          url="/community/ui-ux-design"
        />
      </div>
    </div>
  ),
};

type SkeletonStoryProps = {
  width?: string;
  className?: string;
  variant?: "explore" | "search" | "suggestion" | "recent";
};

export const Skeleton: StoryObj<SkeletonStoryProps> = {
  args: {
    width: "450px",
    variant: "explore",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["explore", "search", "suggestion", "recent"],
      description: "Visual variant of the skeleton",
    },
    width: {
      control: { type: "text" },
      description: "Set the width of the skeleton (e.g. 400px, 100%)",
    },
  },
  render: (args) => (
    <div style={{ width: args.width ?? "450px" }}>
      <CommunityCardSkeleton
        className={args.className}
        variant={args.variant ?? "explore"}
      />
    </div>
  ),
};
