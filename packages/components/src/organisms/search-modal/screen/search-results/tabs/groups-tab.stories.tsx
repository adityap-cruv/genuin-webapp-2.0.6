import type { Meta, StoryObj } from "@storybook/react";
import { GroupsTab } from "./groups-tab";
import { LoopTopResultType } from "@genuin/components/react-query/api/search";

// Mock groups/loops data based on API response format
const mockGroups: LoopTopResultType[] = [
  {
    chat_id: "loop_1",
    slug: "product-development",
    group: {
      group_id: "group_1",
      slug: "product-development",
      group_name: "Product Development",
      group_description:
        "Discussing product development strategies and best practices",
      no_of_members: 25,
      no_of_videos: 150,
      no_of_views: 500,
      dp: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
    },
    is_view_allowed: true,
  },
  {
    chat_id: "loop_2",
    slug: "design-system",
    group: {
      group_id: "group_2",
      slug: "design-system",
      group_name: "Design System Discussion",
      group_description:
        "Collaborative space for design system development and implementation",
      no_of_members: 18,
      no_of_videos: 89,
      no_of_views: 300,
      dp: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=100&h=100&fit=crop",
    },
    is_view_allowed: true,
  },
  {
    chat_id: "loop_3",
    slug: "frontend-dev",
    group: {
      group_id: "group_3",
      slug: "frontend-dev",
      group_name: "Frontend Development",
      group_description:
        "Discussion group for frontend developers sharing tips and techniques",
      no_of_members: 42,
      no_of_videos: 234,
      no_of_views: 600,
      dp: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop",
    },
    is_view_allowed: true,
  },

  {
    chat_id: "loop_4",
    slug: "react-community",
    group: {
      group_id: "group_4",
      slug: "react-community",
      group_name: "React Community",
      group_description:
        "Share React tips, tricks, and best practices with fellow developers",
      no_of_members: 67,
      no_of_videos: 389,
      no_of_views: 1200,
      dp: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=100&h=100&fit=crop",
    },
    is_view_allowed: true,
  },
  {
    chat_id: "loop_5",
    slug: "startup-founders",
    group: {
      group_id: "group_5",
      slug: "startup-founders",
      group_name: "Startup Founders",
      group_description:
        "Community for startup founders to share experiences and advice",
      no_of_members: 31,
      no_of_videos: 112,
      no_of_views: 400,
      dp: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=100&fit=crop",
    },
    is_view_allowed: false, // Private group
  },
];

/**
 * The GroupsTab component displays search results filtered to show only groups/loops.
 * Shows group information including name, description, member count, and video count.
 */
const meta: Meta<typeof GroupsTab> = {
  title: "Organisms/Search/Tabs/GroupsTab",
  component: GroupsTab,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Groups tab displays search results filtered to show only groups/loops. Each result shows group information including name, description, member count, and video count.",
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
    groups: {
      description: "Array of group/loop search results to display",
      control: false,
    },
    onSelect: {
      description: "Called when a group is selected",
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
 * Default state showing multiple group results
 */
export const Default: Story = {
  args: {
    groups: mockGroups,
    onSelect: (group) => console.log("Selected group:", group),
  },
};

/**
 * Empty state when no groups match the search query
 */
export const Empty: Story = {
  args: {
    groups: [],
    onSelect: (group) => console.log("Selected group:", group),
  },
};

/**
 * Single group result
 */
export const SingleResult: Story = {
  args: {
    groups: [mockGroups[0]!],
    onSelect: (group) => console.log("Selected group:", group),
  },
};

/**
 * Two group results
 */
export const TwoResults: Story = {
  args: {
    groups: mockGroups.slice(0, 2),
    onSelect: (group) => console.log("Selected group:", group),
  },
};

/**
 * Large group with many members and videos
 */
export const LargeGroup: Story = {
  args: {
    groups: [
      {
        ...mockGroups[3]!,
        group: {
          ...mockGroups[3]!.group,
          no_of_members: 123456,
          no_of_videos: 7890,
          group_description:
            "A large community of React developers sharing knowledge and resources",
        },
      },
    ],
    onSelect: (group) => console.log("Selected group:", group),
  },
};

/**
 * Private group (not discoverable)
 */
export const PrivateGroup: Story = {
  args: {
    groups: [
      {
        ...mockGroups[4]!,
        is_view_allowed: false, // Simulating a private group
      },
    ],
    onSelect: (group) => console.log("Selected group:", group),
  },
};

/**
 * Group with no description
 */
export const NoDescription: Story = {
  args: {
    groups: [
      {
        ...mockGroups[0]!,
        group: {
          ...mockGroups[0]!.group,
          group_description: undefined, // Simulating no description
        },
      },
    ],
    onSelect: (group) => console.log("Selected group:", group),
  },
};

/**
 * Group with very long name and description
 */
export const LongContent: Story = {
  args: {
    groups: [
      {
        ...mockGroups[0]!,
        group: {
          ...mockGroups[0]!.group,
          group_name:
            "Extremely Long Group Name That Exceeds Normal Length Expectations",
          group_description:
            "This is a very long description that goes on and on, providing extensive details about the group's purpose, activities, and community guidelines. It is meant to test how the UI handles long text content without breaking the layout or causing overflow issues.",
        },
      },
    ],
    onSelect: (group) => console.log("Selected group:", group),
  },
};
