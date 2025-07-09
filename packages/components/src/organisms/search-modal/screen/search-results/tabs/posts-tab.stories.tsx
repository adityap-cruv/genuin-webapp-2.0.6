import type { Meta, StoryObj } from "@storybook/react";
import { PostsTab } from "./posts-tab";
import type { ParsedVideoType } from "@genuin/components/react-query/api/search";

// Mock video/posts data based on API response format
const mockVideos: ParsedVideoType[] = [
  {
    id: "vid_1",
    title: "Building React Applications with TypeScript",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=320&h=180&fit=crop",
    description:
      "Learn how to build scalable React applications using TypeScript and modern development practices",
    duration: 1245, // 20:45 in seconds
    viewCount: 15420,
    likeCount: 892,
    creator: {
      id: "user_video_1",
      nickname: "reactdev",
      name: "Sarah Chen",
      profileImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces",
    },
  },
  {
    id: "vid_2",
    title: "Advanced State Management Patterns",
    thumbnail:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=320&h=180&fit=crop",
    description:
      "Explore advanced patterns for managing state in complex React applications",
    duration: 892, // 14:52 in seconds
    viewCount: 8934,
    likeCount: 456,
    creator: {
      id: "user_video_2",
      nickname: "statemaster",
      name: "Alex Rodriguez",
      profileImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    },
  },
  {
    id: "vid_3",
    title: "Performance Optimization Techniques",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=320&h=180&fit=crop",
    description:
      "Optimize your React apps for better performance and user experience",
    duration: 1678, // 27:58 in seconds
    viewCount: 12567,
    likeCount: 723,
    creator: {
      id: "user_video_3",
      nickname: "perfguru",
      name: "Emily Johnson",
      profileImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
    },
  },
  {
    id: "vid_4",
    title: "CSS Grid and Flexbox Mastery",
    thumbnail:
      "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=320&h=180&fit=crop",
    description: "Master modern CSS layout techniques with Grid and Flexbox",
    duration: 2134, // 35:34 in seconds
    viewCount: 9876,
    likeCount: 567,
    creator: {
      id: "user_video_4",
      nickname: "csswizard",
      name: "Michael Kim",
      profileImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
    },
  },
  {
    id: "vid_5",
    title: "Node.js Backend Development",
    thumbnail:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=320&h=180&fit=crop",
    description: "Build robust backend APIs with Node.js and Express",
    duration: 1876, // 31:16 in seconds
    viewCount: 14532,
    likeCount: 834,
    creator: {
      id: "user_video_5",
      nickname: "nodeguru",
      name: "Lisa Wang",
      profileImage:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100&h=100&fit=crop&crop=faces",
    },
  },
];

/**
 * The PostsTab component displays search results filtered to show only videos/posts.
 * Shows video information including title, thumbnail, duration, view count, and creator.
 */
const meta: Meta<typeof PostsTab> = {
  title: "Organisms/Search/Tabs/PostsTab",
  component: PostsTab,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Posts/Videos tab displays search results filtered to show only video content. Each result shows video information including title, thumbnail, duration, view count, and creator details.",
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
    posts: {
      description: "Array of video/post search results to display",
      control: false,
    },
    onSelect: {
      description: "Called when a video/post is selected",
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
 * Default state showing multiple video results
 */
export const Default: Story = {
  args: {
    posts: mockVideos,
    onSelect: (post) => console.log("Selected video:", post),
  },
};

/**
 * Empty state when no videos match the search query
 */
export const Empty: Story = {
  args: {
    posts: [],
    onSelect: (post) => console.log("Selected video:", post),
  },
};

/**
 * Single video result
 */
export const SingleResult: Story = {
  args: {
    posts: [mockVideos[0]!],
    onSelect: (post) => console.log("Selected video:", post),
  },
};

/**
 * Two video results
 */
export const TwoResults: Story = {
  args: {
    posts: mockVideos.slice(0, 2),
    onSelect: (post) => console.log("Selected video:", post),
  },
};
