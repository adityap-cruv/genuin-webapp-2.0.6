import type { Meta, StoryObj } from "@storybook/react";
import { ProfilesTab } from "./profiles-tab";
import { PeopleTopResultType } from "@genuin/components/react-query/api/search";

// Mock profiles data
const mockProfiles: PeopleTopResultType[] = [
  {
    user_id: "user_1",
    nickname: "johndoe",
    name: "John Doe",
    bio: "Software Engineer passionate about React and TypeScript. Building amazing user experiences.",
    profile_image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
    is_avatar: false,
    no_of_communities: 5,
    no_of_loops: 12,
    no_of_videos: 85,
    brand: {
      brand_id: 1,
      brand_slug: "techcorp",
      brand_user_logo: 0,
    },
  },
  {
    user_id: "user_2",
    nickname: "janesmith",
    name: "Jane Smith",
    bio: "UX Designer and Product Manager. Love creating beautiful and functional designs.",
    profile_image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces",
    is_avatar: false,
    no_of_communities: 8,
    no_of_loops: 15,
    no_of_videos: 120,

    brand: {
      brand_id: 2,
      brand_slug: "designhub",
      brand_user_logo: 0,
    },
  },
  {
    user_id: "user_3",
    nickname: "alexchen",
    name: "Alex Chen",
    bio: "Entrepreneur and startup founder. Building the future of technology.",
    profile_image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    is_avatar: false,
    no_of_communities: 3,
    no_of_loops: 7,
    no_of_videos: 45,
    brand: {
      brand_id: 3,
      brand_slug: "startupville",
      brand_user_logo: 0,
    },
  },
];

/**
 * The ProfilesTab component displays search results filtered to show only user profiles.
 * Profiles represent individual users with their information and activity statistics.
 */
const meta: Meta<typeof ProfilesTab> = {
  title: "Organisms/Search/Tabs/ProfilesTab",
  component: ProfilesTab,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Profiles tab displays search results filtered to show only user profiles. Shows user information including bio, activity statistics, and profile images.",
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
    profiles: {
      description: "Array of user profiles to display",
      control: false,
    },
    onSelect: {
      description: "Called when a profile is selected",
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
 * Default profiles results
 */
export const Default: Story = {
  args: {
    profiles: mockProfiles,
    onSelect: (profile) => console.log("Selected profile:", profile),
  },
};

/**
 * Single profile result
 */
export const SingleProfile: Story = {
  args: {
    profiles: mockProfiles.slice(0, 1),
    onSelect: (profile) => console.log("Selected profile:", profile),
  },
  parameters: {
    docs: {
      description: {
        story: "Display when only one user profile matches the search query.",
      },
    },
  },
};

/**
 * Many profile results
 */
export const ManyProfiles: Story = {
  args: {
    profiles: [
      ...mockProfiles,
      ...mockProfiles.map((p, i) => ({
        ...p,
        id: `${p.user_id}_${i}`,
        name: `${p.name} ${i + 2}`,
        nickname: `${p.nickname}${i + 2}`,
        bio: `${p.bio} Updated bio ${i + 2}.`,
      })),
    ],
    onSelect: (profile) => console.log("Selected profile:", profile),
  },
  parameters: {
    docs: {
      description: {
        story: "Many profile results demonstrating scrollable behavior.",
      },
    },
  },
};

/**
 * Empty profiles results
 */
export const NoResults: Story = {
  args: {
    profiles: [],
    onSelect: (profile) => console.log("Selected profile:", profile),
  },
  parameters: {
    docs: {
      description: {
        story: "Empty state when no user profiles match the search query.",
      },
    },
  },
};
