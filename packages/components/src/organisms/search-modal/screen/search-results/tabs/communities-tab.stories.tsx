import type { Meta, StoryObj } from "@storybook/react";
import { CommunitiesTab } from "./communities-tab";
import { CommunityTopResultType } from "@genuin/components/react-query/api/search";

// Mock communities data based on API response format
const mockCommunities: CommunityTopResultType[] = [
  {
    community_id: "comm_1",
    handle: "@reactdevs",
    slug: "react-developers",
    name: "React Developers",
    description:
      "A community for React developers to share knowledge and best practices",
    dp: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop",
    no_of_members: 15420,
    no_of_loops: 120,
    no_of_videos: 300,
    type: 1,
    brand: {
      brand_id: 1,
      name: "TechCorp",
      subdomain: "techcorp",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      created_at: Date.now(),
      brand_web_logo:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      favicon:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop",
      brand_system_user_id: "sys_1",
      brand_slug: "techcorp",
      brand_user_logo: 1,
    },
  },
  {
    community_id: "comm_2",
    handle: "@webdev",
    slug: "web-development",
    name: "Web Development Hub",
    description:
      "Community focused on modern web development technologies and best practices",
    dp: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop",
    no_of_members: 15420,
    no_of_loops: 120,
    no_of_videos: 300,
    type: 1,
    brand: {
      brand_id: 1,
      name: "TechCorp",
      subdomain: "techcorp",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      created_at: Date.now(),
      brand_web_logo:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      favicon:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop",
      brand_system_user_id: "sys_1",
      brand_slug: "techcorp",
      brand_user_logo: 1,
    },
  },
  {
    community_id: "comm_3",
    handle: "@javascript",
    slug: "javascript-community",
    name: "JavaScript Community",
    description:
      "Everything about JavaScript - from basics to advanced concepts",
    dp: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop",
    no_of_members: 15420,
    no_of_loops: 120,
    no_of_videos: 300,
    type: 1,
    brand: {
      brand_id: 1,
      name: "TechCorp",
      subdomain: "techcorp",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      created_at: Date.now(),
      brand_web_logo:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      favicon:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop",
      brand_system_user_id: "sys_1",
      brand_slug: "techcorp",
      brand_user_logo: 1,
    },
  },
  {
    community_id: "comm_4",
    handle: "@frontend",
    slug: "frontend-masters",
    name: "Frontend Masters",
    description: "Advanced frontend development techniques and frameworks",
    dp: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop",
    no_of_members: 15420,
    no_of_loops: 120,
    no_of_videos: 300,
    type: 1,
    brand: {
      brand_id: 1,
      name: "TechCorp",
      subdomain: "techcorp",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      created_at: Date.now(),
      brand_web_logo:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      favicon:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop",
      brand_system_user_id: "sys_1",
      brand_slug: "techcorp",
      brand_user_logo: 1,
    },
  },
  {
    community_id: "comm_5",
    handle: "@ui-ux",
    slug: "ui-ux-design",
    name: "UI/UX Design",
    description: "User interface and user experience design community",
    dp: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop",
    no_of_members: 15420,
    no_of_loops: 120,
    no_of_videos: 300,
    type: 1,
    brand: {
      brand_id: 1,
      name: "TechCorp",
      subdomain: "techcorp",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      created_at: Date.now(),
      brand_web_logo:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      favicon:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop",
      brand_system_user_id: "sys_1",
      brand_slug: "techcorp",
      brand_user_logo: 1,
    },
  },
];

/**
 * The CommunitiesTab component displays search results filtered to show only communities.
 * Shows community information including name, handle, member count, and description.
 */
const meta: Meta<typeof CommunitiesTab> = {
  title: "Organisms/Search/Tabs/CommunitiesTab",
  component: CommunitiesTab,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Communities tab displays search results filtered to show only communities. Each result shows community information including name, handle, member count, and description.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:w-[500px] gencl:max-w-[500px] gencl:h-[400px] gencl:border gencl:border-gray-200 gencl:rounded-lg gencl:p-4 gencl:bg-white gencl:overflow-auto">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    communities: {
      description: "Array of community search results to display",
      control: false,
    },
    onSelect: {
      description: "Called when a community is selected",
      control: false,
    },
    className: {
      description: "Additional CSS classes to apply",
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state showing multiple community results
 */
export const Default: Story = {
  args: {
    communities: mockCommunities,
    onSelect: (community) => console.log("Selected community:", community),
  },
};

/**
 * Empty state when no communities match the search query
 */
export const Empty: Story = {
  args: {
    communities: [],
    onSelect: (community) => console.log("Selected community:", community),
  },
};

/**
 * Single community result
 */
export const SingleResult: Story = {
  args: {
    communities: [mockCommunities[0]!],
    onSelect: (community) => console.log("Selected community:", community),
  },
};

/**
 * Two community results
 */
export const TwoResults: Story = {
  args: {
    communities: mockCommunities.slice(0, 2),
    onSelect: (community) => console.log("Selected community:", community),
  },
};

/**
 * Large member count community
 */
export const LargeCommunity: Story = {
  args: {
    communities: [
      {
        ...mockCommunities[2]!,
        no_of_members: 156789,
        description:
          "Massive JavaScript community with active discussions on all JS topics including React, Vue, Angular, Node.js, and the latest ECMAScript features",
      },
    ],
    onSelect: (community) => console.log("Selected community:", community),
  },
};

/**
 * Community with no description
 */
export const NoDescription: Story = {
  args: {
    communities: [
      {
        ...mockCommunities[0]!,
        description: undefined,
      },
    ],
    onSelect: (community) => console.log("Selected community:", community),
  },
};

/**
 * Community with very long name and description
 */
export const LongContent: Story = {
  args: {
    communities: [
      {
        ...mockCommunities[0]!,
        name: "Advanced React Development Patterns and Best Practices for Enterprise Applications",
        description:
          "This is a very comprehensive community focused on advanced React development patterns, enterprise-level application architecture, performance optimization techniques, testing strategies, deployment workflows, and collaborative development practices for large-scale projects.",
      },
    ],
    onSelect: (community) => console.log("Selected community:", community),
  },
};
