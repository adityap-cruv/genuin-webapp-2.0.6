import type { Meta, StoryObj } from "@storybook/react";
import { Suggestions } from "./suggestions";
import type { SuggestionItemType } from "@genuin/components/react-query/api/search";

// Mock suggestion data for communities, groups, and users (no videos in suggestions)
const mockSuggestions: SuggestionItemType[] = [
  {
    type: "community",
    match_score: 0.95,
    community: {
      community_id: "comm_1",
      handle: "@techcorp",
      slug: "techcorp",
      name: "Tech Corporation",
      description: "Leading technology company focused on innovation",
      color_code: "#3B82F6",
      text_color_code: "#FFFFFF",
      dp: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=faces",
      dp_s: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop&crop=faces",
      dp_m: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=faces",
      dp_l: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=faces",
      type: 1,
      brand: {
        brand_id: 1,
        name: "TechCorp",
        subdomain: "techcorp",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=faces",
        created_at: Date.now(),
        brand_web_logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=faces",
        favicon: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop&crop=faces",
        brand_system_user_id: "sys_1",
        brand_slug: "techcorp",
        brand_user_logo: 1,
      },
      no_of_members: 0,
      no_of_loops: 0,
      no_of_videos: 0
    },
  },
  {
    type: "loop",
    match_score: 0.88,
    loop: {
      chat_id: "loop_1",
      group: {
        group_id: "group_1",
        group_name: "Product Development",
        group_description: "Discussing product development strategies and best practices",
        color_code: "#10B981",
        text_color_code: "#FFFFFF",
        dp: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=faces",
        dp_s: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=50&h=50&fit=crop&crop=faces",
        dp_m: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=faces",
        dp_l: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop&crop=faces",
        slug: "product-development",
        no_of_members: 0,
        no_of_videos: 0,
        no_of_views: 0
      },
      settings: {
        discoverable: true,
      },
      share_url: "https://app.example.com/group/product-development",
      slug: "product-development",
      no_of_members: 25,
      no_of_videos: 150,
    },
  },
  {
    type: "user",
    match_score: 0.82,
    user: {
      name: "John Doe",
      nickname: "johndoe",
      is_avatar: false,
      bio: "Software Engineer passionate about React and TypeScript",
      user_id: "user_1",
      profile_image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
      profile_image_s:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=faces",
      profile_image_m:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
      profile_image_l:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces",
      brand: {
        brand_id: 1,
        brand_slug: "techcorp",
        brand_user_logo: 1,
      },
      no_of_communities: 5,
      no_of_loops: 12,
      no_of_videos: 85,
    },
  },
];

/**
 * The Suggestions component displays search suggestions based on user input
 * showing communities, groups, and users that match the search query.
 */
const meta: Meta<typeof Suggestions> = {
  title: "Organisms/Search/Screens/Suggestions",
  component: Suggestions,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays search suggestions including communities, groups, and users that match the current search query. Results are sorted by match score and relevance.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:w-[400px] gencl:max-w-[400px] gencl:max-h-[400px] gencl:border gencl:border-gray-200 gencl:rounded-lg gencl:p-4 gencl:bg-white gencl:overflow-auto">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    suggestions: {
      description: "Array of suggestion items to display",
      control: false,
    },
    onSelect: {
      description:
        "Called when a suggestion is selected (deprecated - now handled by DialogClose)",
      control: false,
    },
    isLoading: {
      description: "Whether suggestions are currently being loaded",
      control: { type: "boolean" },
    },
    searchQuery: {
      description: "Current search query to display in no results message",
      control: { type: "text" },
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
 * Default state showing mixed suggestion types
 */
export const Default: Story = {
  args: {
    suggestions: mockSuggestions,
    isLoading: false,
  },
};

/**
 * Loading state while fetching suggestions
 */
export const Loading: Story = {
  args: {
    suggestions: [],
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Loading state displayed while suggestions are being fetched based on the search query.",
      },
    },
  },
};

/**
 * Empty state when no suggestions match the search query
 */
export const NoResults: Story = {
  args: {
    suggestions: [],
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state shown when no suggestions match the current search query without a specific search term.",
      },
    },
  },
};

/**
 * No results state with specific search query
 */
export const NoResultsWithSearchQuery: Story = {
  args: {
    suggestions: [],
    searchQuery: "Elvis",
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state displayed when no suggestions match a specific search query, showing the search term in the message with helpful guidance and an alert icon.",
      },
    },
  },
};

/**
 * Multiple suggestions showing scrollable behavior
 */
export const WithManyResults: Story = {
  args: {
    suggestions: [
      ...mockSuggestions,
      ...mockSuggestions.map((s, i) => ({
        ...s,
        match_score: s.match_score - 0.1 * (i + 1),
        ...(s.type === "community" &&
          s.community && {
            community: {
              ...s.community,
              community_id: `${s.community.community_id}_${i}`,
              name: `${s.community.name} ${i + 2}`,
            },
          }),
        ...(s.type === "user" &&
          s.user && {
            user: {
              ...s.user,
              user_id: `${s.user.user_id}_${i}`,
              name: `${s.user.name} ${i + 2}`,
            },
          }),
        ...(s.type === "loop" &&
          s.loop && {
            loop: {
              ...s.loop,
              chat_id: `${s.loop.chat_id}_${i}`,
              group: {
                ...s.loop.group,
                group_name: `${s.loop.group.group_name} ${i + 2}`,
              },
            },
          }),
      })),
    ],
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multiple suggestion results demonstrating scrollable behavior and different content types.",
      },
    },
  },
};

/**
 * Only community suggestions
 */
export const CommunitiesOnly: Story = {
  args: {
    suggestions: mockSuggestions.filter((s) => s.type === "community"),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Suggestions containing only community results.",
      },
    },
  },
};

/**
 * Only user suggestions
 */
export const UsersOnly: Story = {
  args: {
    suggestions: mockSuggestions.filter((s) => s.type === "user"),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Suggestions containing only user profile results.",
      },
    },
  },
};

/**
 * Only group/loop suggestions
 */
export const GroupsOnly: Story = {
  args: {
    suggestions: mockSuggestions.filter((s) => s.type === "loop"),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Suggestions containing only group/loop results.",
      },
    },
  },
};
