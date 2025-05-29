import type { Meta, StoryObj } from "@storybook/react";

import { GroupCard } from "./group-card";

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
  },
};

export default meta;
type Story = StoryObj<typeof GroupCard>;

// Default story - Public group
export const Default: Story = {
  args: {
    isPinned: false,
    owner: {
      userName: "john_doe",
      url: "https://example.com/john_doe",
    },
    group: {
      name: "Tech Enthusiasts",
      isPrivate: false,
      url: "https://example.com/groups/tech-enthusiasts",
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
    owner: {
      userName: "jane_smith",
      url: "https://example.com/jane_smith",
    },
    group: {
      name: "Design Community",
      url: "https://example.com/groups/design-community",
      isPrivate: false,
      stats: {
        members: 2850,
        posts: 1200,
        views: 15400,
      },
    },
  },
};

// Private group story
export const PrivateGroup: Story = {
  args: {
    isPinned: false,
    owner: {
      url: "https://example.com/alex_dev",
      userName: "alex_dev",
    },
    group: {
      name: "Exclusive Developer Circle",
      url: "https://example.com/groups/exclusive-developer-circle",
      isPrivate: true,
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
    owner: {
      userName: "sarah_ceo",
      url: "https://example.com/sarah_ceo",
    },
    group: {
      name: "Executive Board",
      url: "https://example.com/groups/executive-board",
      isPrivate: true,
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
    owner: {
      userName: "community_admin",
      url: "https://example.com/community_admin",
    },
    group: {
      name: "Global React Developers",
      url: "https://example.com/groups/global-react-developers",
      isPrivate: false,
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
    owner: {
      userName: "startup_founder",
      url: "https://example.com/startup_founder",
    },
    group: {
      name: "Early Stage Startups",
      isPrivate: false,
      url: "https://example.com/groups/early-stage-startups",
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
    owner: {
      userName: "academic_researcher",
      url: "https://example.com/academic_researcher",
    },
    group: {
      name: "Advanced Machine Learning and Artificial Intelligence Research Community for PhD Students and Industry Professionals",
      url: "https://example.com/groups/advanced-ml-ai-research",
      isPrivate: true,
      stats: {
        members: 890,
        posts: 234,
        views: 5670,
      },
    },
  },
};
