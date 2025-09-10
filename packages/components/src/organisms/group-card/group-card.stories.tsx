import type { Meta, StoryObj } from "@storybook/react-vite";

import { GroupCard, GroupCardSkeleton } from "./group-card";

const meta: Meta<typeof GroupCard> = {
  title: "Organisms/GroupCard",
  component: GroupCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isPinned: {
      control: "boolean",
      description: "Whether the group is pinned",
    },
    owner: {
      control: "object",
      description: "Information about the group owner",
    },
    group: {
      control: "object",
      description: "Information about the group",
    },
    variant: {
      control: "select",
      options: ["explore", "search", "suggestion", "recent"],
      description: "Visual variant of the group card",
    },
  },
};

export default meta;
type Story = StoryObj<typeof GroupCard>;

// Default story - Public group
export const Default: Story = {
  args: {
    isPinned: false,
    variant: "explore",
    owner: {
      userName: "john_doe",
      url: "https://example.com/john_doe",
    },
    group: {
      chat_id: "group_1",
      name: "Tech Enthusiasts",
      isPrivate: false,
      url: "https://example.com/groups/tech-enthusiasts",
      slug: "tech-enthusiasts",
      role: "UNJOINED",
      stats: {
        members: 1250,
        posts: 346,
        views: 8920,
      },
    },
  },
};

// Pinned group story
export const Pinned: Story = {
  args: {
    isPinned: true,
    variant: "explore",
    owner: {
      userName: "jane_smith",
      url: "https://example.com/jane_smith",
    },
    group: {
      chat_id: "group_2",
      name: "Design Community",
      url: "https://example.com/groups/design-community",
      slug: "design-community",
      isPrivate: false,
      role: "JOINED",
      stats: {
        members: 2850,
        posts: 1200,
        views: 15400,
      },
    },
  },
};

// Search variant story
export const SearchVariant: Story = {
  args: {
    isPinned: false,
    variant: "search",
    owner: {
      userName: "john_doe",
      url: "https://example.com/john_doe",
    },
    group: {
      chat_id: "group_3",
      name: "Tech Enthusiasts",
      isPrivate: false,
      url: "https://example.com/groups/tech-enthusiasts",
      slug: "tech-enthusiasts",
      role: "UNJOINED",
      description:
        "A group for tech enthusiasts to share knowledge and ideas. A group for tech enthusiasts to share knowledge and ideas. A group for tech enthusiasts to share knowledge and ideas.",
      stats: {
        members: 1250,
        posts: 346,
        views: 8920,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px" }}>
        <Story />
      </div>
    ),
  ],
};

// Search variant with private group
export const SearchVariantPrivate: Story = {
  args: {
    isPinned: false,
    variant: "search",
    owner: {
      userName: "sarah_ceo",
      url: "https://example.com/sarah_ceo",
    },
    group: {
      chat_id: "group_4",
      name: "Executive Board",
      url: "https://example.com/groups/executive-board",
      slug: "executive-board",
      isPrivate: true,
      role: "REQUESTED",
      stats: {
        members: 12,
        posts: 25,
        views: 340,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px" }}>
        <Story />
      </div>
    ),
  ],
};

// Private group story
export const PrivateGroup: Story = {
  args: {
    isPinned: false,
    variant: "explore",
    owner: {
      url: "https://example.com/alex_dev",
      userName: "alex_dev",
    },
    group: {
      chat_id: "group_5",
      name: "Exclusive Developer Circle",
      url: "https://example.com/groups/exclusive-developer-circle",
      slug: "exclusive-developer-circle",
      isPrivate: true,
      role: "UNJOINED",
      stats: {
        members: 45,
        posts: 89,
        views: 1250,
      },
    },
  },
};

// Pinned private group story
export const PinnedPrivateGroup: Story = {
  args: {
    isPinned: true,
    variant: "explore",
    owner: {
      userName: "sarah_ceo",
      url: "https://example.com/sarah_ceo",
    },
    group: {
      chat_id: "group_6",
      name: "Executive Board",
      url: "https://example.com/groups/executive-board",
      slug: "executive-board",
      isPrivate: true,
      role: "JOINED",
      stats: {
        members: 12,
        posts: 25,
        views: 340,
      },
    },
  },
};

// Large group with high stats
export const LargeGroup: Story = {
  args: {
    isPinned: false,
    variant: "explore",
    owner: {
      userName: "community_admin",
      url: "https://example.com/community_admin",
    },
    group: {
      chat_id: "group_7",
      name: "Global React Developers",
      url: "https://example.com/groups/global-react-developers",
      slug: "global-react-developers",
      isPrivate: false,
      role: "JOINED",
      stats: {
        members: 45800,
        posts: 12600,
        views: 1250000,
      },
    },
  },
};

// Small new group
export const SmallGroup: Story = {
  args: {
    isPinned: false,
    variant: "explore",
    owner: {
      userName: "startup_founder",
      url: "https://example.com/startup_founder",
    },
    group: {
      chat_id: "group_8",
      name: "Early Stage Startups",
      isPrivate: false,
      url: "https://example.com/groups/early-stage-startups",
      slug: "early-stage-startups",
      role: "UNJOINED",
      stats: {
        members: 3,
        posts: 1,
        views: 15,
      },
    },
  },
};

// Group with long name
export const LongNameGroup: Story = {
  args: {
    isPinned: true,
    variant: "explore",
    owner: {
      userName: "academic_researcher",
      url: "https://example.com/academic_researcher",
    },
    group: {
      chat_id: "group_9",
      name: "Advanced Machine Learning and Artificial Intelligence Research Community for PhD Students and Industry Professionals",
      url: "https://example.com/groups/advanced-ml-ai-research",
      slug: "advanced-ml-ai-research",
      isPrivate: true,
      role: "REQUESTED",
      stats: {
        members: 890,
        posts: 234,
        views: 5670,
      },
    },
  },
};

// Search variant story
export const SuggestionVariant: Story = {
  args: {
    isPinned: false,
    variant: "suggestion",
    owner: {
      userName: "john_doe",
      url: "https://example.com/john_doe",
    },
    group: {
      chat_id: "group_10",
      name: "Tech Enthusiasts",
      isPrivate: false,
      url: "https://example.com/groups/tech-enthusiasts",
      slug: "tech-enthusiasts",
      role: "UNJOINED",
      description:
        "A group for tech enthusiasts to share knowledge and ideas about the latest technologies.",
      stats: {
        members: 1250,
        posts: 346,
        views: 8920,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Suggestion variant with private group
export const SuggestionVariantPrivate: Story = {
  args: {
    isPinned: false,
    variant: "suggestion",
    owner: {
      userName: "sarah_ceo",
      url: "https://example.com/sarah_ceo",
    },
    group: {
      chat_id: "group_11",
      name: "Executive Board",
      url: "https://example.com/groups/executive-board",
      slug: "executive-board",
      isPrivate: true,
      role: "UNJOINED",
      description: "Private executive discussions and strategic planning.",
      stats: {
        members: 12,
        posts: 25,
        views: 340,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Suggestion variant with long group name
export const SuggestionVariantLongName: Story = {
  args: {
    isPinned: false,
    variant: "suggestion",
    owner: {
      userName: "academic_researcher",
      url: "https://example.com/academic_researcher",
    },
    group: {
      chat_id: "group_12",
      name: "Advanced Machine Learning and Artificial Intelligence Research Community for PhD Students",
      url: "https://example.com/groups/advanced-ml-ai-research",
      slug: "advanced-ml-ai-research",
      isPrivate: false,
      role: "JOINED",
      description:
        "Research community focused on cutting-edge ML and AI topics including deep learning, neural networks, and more.",
      stats: {
        members: 890,
        posts: 234,
        views: 5670,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Suggestion variant with minimal stats
export const SuggestionVariantSmall: Story = {
  args: {
    isPinned: false,
    variant: "suggestion",
    owner: {
      userName: "startup_founder",
      url: "https://example.com/startup_founder",
    },
    group: {
      chat_id: "group_13",
      name: "Early Stage Startups",
      isPrivate: false,
      url: "https://example.com/groups/early-stage-startups",
      slug: "early-stage-startups",
      role: "UNJOINED",
      description: "New startup community for founders and entrepreneurs.",
      stats: {
        members: 3,
        posts: 1,
        views: 15,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Multiple suggestion cards to show in a list
export const SuggestionList: Story = {
  render: () => (
    <div className="gencl:space-y-2 gencl:max-w-md">
      <GroupCard
        variant="suggestion"
        owner={{ userName: "tech_lead", url: "https://example.com/tech_lead" }}
        group={{
          chat_id: "group_14",
          name: "React Developers",
          isPrivate: false,
          url: "https://example.com/groups/react-developers",
          slug: "react-developers",
          role: "UNJOINED",
          description:
            "Community for React developers to share tips and tricks.",
          stats: { members: 2340, posts: 567, views: 8920 },
        }}
      />
      <GroupCard
        variant="suggestion"
        owner={{ userName: "designer", url: "https://example.com/designer" }}
        group={{
          chat_id: "group_15",
          name: "UX/UI Design",
          isPrivate: false,
          url: "https://example.com/groups/ux-ui-design",
          slug: "ux-ui-design",
          role: "JOINED",
          description: "Design community for UX/UI professionals.",
          stats: { members: 1890, posts: 234, views: 5670 },
        }}
      />
      <GroupCard
        variant="suggestion"
        owner={{ userName: "ceo", url: "https://example.com/ceo" }}
        group={{
          chat_id: "group_16",
          name: "Leadership Circle",
          isPrivate: true,
          url: "https://example.com/groups/leadership-circle",
          slug: "leadership-circle",
          role: "REQUESTED",
          description:
            "Private group for executive leadership discussions which matters the most",
          stats: { members: 45, posts: 89, views: 1250 },
        }}
        style={{ width: "400px" }}
      />
    </div>
  ),
  parameters: {
    layout: "centered",
  },
};

// Recent variant story
export const RecentVariant: Story = {
  args: {
    isPinned: false,
    variant: "recent",
    owner: {
      userName: "john_doe",
      url: "https://example.com/john_doe",
    },
    group: {
      chat_id: "group_17",
      name: "Tech Enthusiasts",
      isPrivate: false,
      url: "https://example.com/groups/tech-enthusiasts",
      slug: "tech-enthusiasts",
      role: "JOINED",
      description: "A group for tech enthusiasts to share knowledge and ideas.",
      stats: {
        members: 1250,
        posts: 346,
        views: 8920,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Recent variant with private group
export const RecentVariantPrivate: Story = {
  args: {
    isPinned: false,
    variant: "recent",
    owner: {
      userName: "sarah_ceo",
      url: "https://example.com/sarah_ceo",
    },
    group: {
      chat_id: "group_18",
      name: "Executive Board",
      url: "https://example.com/groups/executive-board",
      slug: "executive-board",
      isPrivate: true,
      role: "JOINED",
      description: "Private group for executive members.",
      stats: {
        members: 12,
        posts: 25,
        views: 340,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Recent variant with long group name
export const RecentVariantLongName: Story = {
  args: {
    isPinned: false,
    variant: "recent",
    owner: {
      userName: "community_lead",
      url: "https://example.com/community_lead",
    },
    group: {
      chat_id: "group_19",
      name: "Frontend Masters – The Ultimate Community for Frontend Engineers, Designers, and Web Enthusiasts Worldwide",
      url: "https://example.com/groups/frontend-masters-ultimate",
      slug: "frontend-masters-ultimate",
      isPrivate: false,
      role: "JOINED",
      description:
        "An incredibly comprehensive community for all things frontend development, design patterns, and emerging web technologies.",
      stats: {
        members: 8500,
        posts: 2340,
        views: 45600,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Multiple recent cards to show in a list
export const RecentList: Story = {
  render: () => (
    <div style={{ width: "400px" }} className="gencl:space-y-2">
      <GroupCard
        variant="recent"
        owner={{ userName: "john_doe", url: "https://example.com/john_doe" }}
        group={{
          chat_id: "group_20",
          name: "Tech Enthusiasts",
          isPrivate: false,
          url: "https://example.com/groups/tech-enthusiasts",
          slug: "tech-enthusiasts",
          role: "JOINED",
          description: "A group for tech enthusiasts to share knowledge.",
          stats: { members: 1250, posts: 346, views: 8920 },
        }}
      />
      <GroupCard
        variant="recent"
        owner={{ userName: "jane_dev", url: "https://example.com/jane_dev" }}
        group={{
          chat_id: "group_21",
          name: "React Developers",
          isPrivate: false,
          url: "https://example.com/groups/react-devs",
          slug: "react-devs",
          role: "JOINED",
          description: "Community for React developers and enthusiasts.",
          stats: { members: 3200, posts: 890, views: 15600 },
        }}
      />
      <GroupCard
        variant="recent"
        owner={{
          userName: "design_guru",
          url: "https://example.com/design_guru",
        }}
        group={{
          chat_id: "group_22",
          name: "UI/UX Design Hub",
          isPrivate: true,
          url: "https://example.com/groups/design-hub",
          slug: "design-hub",
          role: "JOINED",
          stats: { members: 450, posts: 230, views: 5800 },
        }}
      />
    </div>
  ),
};

// Skeleton Stories
const skeletonMeta: Meta<typeof GroupCardSkeleton> = {
  title: "Organisms/GroupCard/Skeleton",
  component: GroupCardSkeleton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["explore", "search", "suggestion", "recent"],
      description: "Visual variant of the skeleton",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

type SkeletonStory = StoryObj<typeof GroupCardSkeleton>;

export const Skeleton: SkeletonStory = {
  render: (args) => {
    const getDefaultWidth = (variant?: string | null) => {
      switch (variant) {
        case "explore":
          return "750px";
        case "search":
        case "suggestion":
        case "recent":
          return "400px";
        default:
          return "600px";
      }
    };

    const width = getDefaultWidth(args.variant);
    const shouldShowBorder = args.variant === "explore";

    return (
      <div
        style={{ width: "600px" }}
        className={
          shouldShowBorder
            ? "gencl:border gencl:border-secondary-150 gencl:p-4 gencl:rounded-xl"
            : ""
        }
      >
        <GroupCardSkeleton variant={args.variant} className={args.className} />
      </div>
    );
  },
  args: { variant: "explore" },
};
