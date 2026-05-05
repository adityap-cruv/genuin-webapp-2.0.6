import { Dialog } from "@genuin/ui/components/dialog";
import type { Meta, StoryObj } from "@storybook/react";

import type { VideoTopResultType } from "@genuin/components/react-query/api/search";

import { PostsTab } from "./posts-tab";

const mockMeta = {
  contains_external_videos: false,
  aspect_ratio: "16:9",
  resolution: "1920x1080",
  duration: "1245",
  size: "50MB",
};

// Mock video/posts data matching VideoTopResultType
const mockVideos: VideoTopResultType[] = [
  {
    chat_id: "chat_1",
    message_id: "msg_1",
    slug: "building-react-apps-typescript",
    description: "Learn how to build scalable React applications using TypeScript and modern development practices",
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=320&h=180&fit=crop",
    thumbnail_url_s: null,
    thumbnail_url_l: null,
    attached_link: "",
    media_url: "https://example.com/media/video1.mp4",
    media_url_m3u8: "https://example.com/media/video1.m3u8",
    message_at: 1700000000,
    no_of_views: 15420,
    no_of_comments: 142,
    no_of_reactions: 892,
    linkouts_id: null,
    message_summary: "Building React Applications with TypeScript",
    meta_data: mockMeta,
    is_ai_generated: false,
    share_url: "https://example.com/video/building-react-apps-typescript",
    owner: {
      member_id: "user_1",
      username: "reactdev",
      name: "Sarah Chen",
      bio: null,
      phone: null,
      is_avatar: false,
      is_brand_system_user: false,
      profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
      profile_image_s: null,
      profile_image_m: null,
      profile_image_l: null,
    },
  },
  {
    chat_id: "chat_2",
    message_id: "msg_2",
    slug: "advanced-state-management",
    description: "Explore advanced patterns for managing state in complex React applications",
    thumbnail_url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=320&h=180&fit=crop",
    thumbnail_url_s: null,
    thumbnail_url_l: null,
    attached_link: "",
    media_url: "https://example.com/media/video2.mp4",
    media_url_m3u8: "https://example.com/media/video2.m3u8",
    message_at: 1700000100,
    no_of_views: 8934,
    no_of_comments: 76,
    no_of_reactions: 456,
    linkouts_id: null,
    message_summary: "Advanced State Management Patterns",
    meta_data: mockMeta,
    is_ai_generated: false,
    share_url: "https://example.com/video/advanced-state-management",
    owner: {
      member_id: "user_2",
      username: "statemaster",
      name: "Alex Rodriguez",
      bio: null,
      phone: null,
      is_avatar: false,
      is_brand_system_user: false,
      profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      profile_image_s: null,
      profile_image_m: null,
      profile_image_l: null,
    },
  },
  {
    chat_id: "chat_3",
    message_id: "msg_3",
    slug: "performance-optimization-techniques",
    description: "Optimize your React apps for better performance and user experience",
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=320&h=180&fit=crop",
    thumbnail_url_s: null,
    thumbnail_url_l: null,
    attached_link: "",
    media_url: "https://example.com/media/video3.mp4",
    media_url_m3u8: "https://example.com/media/video3.m3u8",
    message_at: 1700000200,
    no_of_views: 12567,
    no_of_comments: 98,
    no_of_reactions: 723,
    linkouts_id: null,
    message_summary: "Performance Optimization Techniques",
    meta_data: mockMeta,
    is_ai_generated: false,
    share_url: "https://example.com/video/performance-optimization-techniques",
    owner: {
      member_id: "user_3",
      username: "perfguru",
      name: "Emily Johnson",
      bio: null,
      phone: null,
      is_avatar: false,
      is_brand_system_user: false,
      profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      profile_image_s: null,
      profile_image_m: null,
      profile_image_l: null,
    },
  },
  {
    chat_id: "chat_4",
    message_id: "msg_4",
    slug: "css-grid-flexbox-mastery",
    description: "Master modern CSS layout techniques with Grid and Flexbox",
    thumbnail_url: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=320&h=180&fit=crop",
    thumbnail_url_s: null,
    thumbnail_url_l: null,
    attached_link: "",
    media_url: "https://example.com/media/video4.mp4",
    media_url_m3u8: "https://example.com/media/video4.m3u8",
    message_at: 1700000300,
    no_of_views: 9876,
    no_of_comments: 54,
    no_of_reactions: 567,
    linkouts_id: null,
    message_summary: "CSS Grid and Flexbox Mastery",
    meta_data: mockMeta,
    is_ai_generated: false,
    share_url: "https://example.com/video/css-grid-flexbox-mastery",
    owner: {
      member_id: "user_4",
      username: "csswizard",
      name: "Michael Kim",
      bio: null,
      phone: null,
      is_avatar: false,
      is_brand_system_user: false,
      profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      profile_image_s: null,
      profile_image_m: null,
      profile_image_l: null,
    },
  },
  {
    chat_id: "chat_5",
    message_id: "msg_5",
    slug: "nodejs-backend-development",
    description: "Build robust backend APIs with Node.js and Express",
    thumbnail_url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=320&h=180&fit=crop",
    thumbnail_url_s: null,
    thumbnail_url_l: null,
    attached_link: "",
    media_url: "https://example.com/media/video5.mp4",
    media_url_m3u8: "https://example.com/media/video5.m3u8",
    message_at: 1700000400,
    no_of_views: 14532,
    no_of_comments: 112,
    no_of_reactions: 834,
    linkouts_id: null,
    message_summary: "Node.js Backend Development",
    meta_data: mockMeta,
    is_ai_generated: false,
    share_url: "https://example.com/video/nodejs-backend-development",
    owner: {
      member_id: "user_5",
      username: "nodeguru",
      name: "Lisa Wang",
      bio: null,
      phone: null,
      is_avatar: false,
      is_brand_system_user: false,
      profile_image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100&h=100&fit=crop",
      profile_image_s: null,
      profile_image_m: null,
      profile_image_l: null,
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
      // Dialog context is required because PostsTab renders DialogClose around each item
      <Dialog type="storybook-posts-tab" open>
        <div className="gencl:w-[500px] gencl:max-w-[500px] gencl:h-[400px] gencl:border gencl:border-gray-200 gencl:rounded-lg gencl:p-4 gencl:bg-white gencl:overflow-auto">
          <Story />
        </div>
      </Dialog>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    posts: {
      description: "Array of video/post search results to display",
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
  },
};

/**
 * Empty state when no videos match the search query
 */
export const Empty: Story = {
  args: {
    posts: [],
  },
};

/**
 * Single video result
 */
export const SingleResult: Story = {
  args: {
    posts: [mockVideos[0]!],
  },
};

/**
 * Two video results
 */
export const TwoResults: Story = {
  args: {
    posts: mockVideos.slice(0, 2),
  },
};
