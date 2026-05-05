import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import type { Post } from "@genuin/components/react-query/api/posts/types";

import MyVideosTable from "./posted-videos";

// Mock data that matches the Post interface
const mockPosts: Post[] = [
  {
    video: {
      id: "1",
      slug: "sample-video-1",
      isPinned: false,
      shareUrl: "https://example.com/video/1",
      metaData: {
        size: "1.2MB",
        duration: "02:30",
        resolution: "1920x1080",
        aspect_ratio: "16:9",
      },
      thumbnail: "https://via.placeholder.com/300x200?text=Video+1",
      thumbnailS: "https://via.placeholder.com/150x100?text=Video+1",
      thumbnailL: "https://via.placeholder.com/600x400?text=Video+1",
      createdAt: "2024-01-15T10:30:00Z",
      descriptionText: "This is a sample video description for testing purposes.",
      descriptionData: "{}",
      linkouts: [],
      noOfPlays: 1250,
      noOfShares: 45,
      noOfLikes: 89,
      noOfReposts: 12,
      language: null,
      location: null,
    },
    community: {
      id: "comm1",
      handle: "sample-community",
      slug: "sample-community",
      name: "Sample Community",
      description: "A sample community for testing",
      colorCode: "#3B82F6",
      textColorCode: "#FFFFFF",
      groupsCount: 5,
      postsCount: 25,
      type: 1,
      profileImage: null,
      profileImageS: "https://via.placeholder.com/50x50?text=C",
      profileImageM: "https://via.placeholder.com/100x100?text=C",
      profileImageL: "https://via.placeholder.com/200x200?text=C",
    },
    group: {
      id: "loop1",
      name: "Sample Loop",
      slug: "sample-loop",
      description: "A sample loop for testing",
      shareUrl: "https://example.com/group/sample-loop",
    },
  },
  {
    video: {
      id: "2",
      slug: "sample-video-2",
      isPinned: true,
      shareUrl: "https://example.com/video/2",
      metaData: {
        size: "2.1MB",
        duration: "03:45",
        resolution: "1920x1080",
        aspect_ratio: "16:9",
      },
      thumbnail: "https://via.placeholder.com/300x200?text=Video+2",
      thumbnailS: "https://via.placeholder.com/150x100?text=Video+2",
      thumbnailL: "https://via.placeholder.com/600x400?text=Video+2",
      createdAt: "2024-01-10T14:20:00Z",
      descriptionText:
        "Another sample video with a longer description to test text wrapping and readmore functionality.",
      descriptionData: "{}",
      linkouts: [],
      noOfPlays: 3420,
      noOfShares: 156,
      noOfLikes: 234,
      noOfReposts: 67,
      language: null,
      location: null,
    },
    community: {
      id: "comm2",
      handle: "tech-community",
      slug: "tech-community",
      name: "Tech Community",
      description: "A community focused on technology",
      colorCode: "#10B981",
      textColorCode: "#FFFFFF",
      groupsCount: 12,
      postsCount: 78,
      type: 1,
      profileImage: null,
      profileImageS: "https://via.placeholder.com/50x50?text=T",
      profileImageM: "https://via.placeholder.com/100x100?text=T",
      profileImageL: "https://via.placeholder.com/200x200?text=T",
    },
    group: {
      id: "loop2",
      name: "Tech Discussions",
      slug: "tech-discussions",
      description: "Technical discussions and tutorials",
      shareUrl: "https://example.com/group/tech-discussions",
    },
  },
];

const mockVideoStats = {
  "1": {
    views: 1250,
    likes: 89,
    shares: 45,
    reposts: 12,
  },
  "2": {
    views: 3420,
    likes: 234,
    shares: 156,
    reposts: 67,
  },
};

const meta: Meta<typeof MyVideosTable> = {
  title: "Organisms/My Videos Table",
  component: MyVideosTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A table component for displaying user's videos with pagination, sorting, and statistics integration.",
      },
    },
    // Mock React Query for Storybook
    mockData: [
      {
        url: "/api/posts/paginated*",
        method: "GET",
        status: 200,
        response: {
          data: {
            posts: mockPosts,
            no_of_data: mockPosts.length,
          },
          code: 200,
          message: "Success",
        },
      },
      {
        url: "/api/posts/video-statistics*",
        method: "POST",
        status: 200,
        response: {
          data: mockVideoStats,
          code: 200,
          message: "Success",
        },
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof MyVideosTable>;

export const WithSearchQuery: Story = {
  args: {
    queryString: "tutorial",
  },
  name: "With Search Query",
  parameters: {
    docs: {
      description: {
        story:
          "My Videos Table filtered by a search query. In a real scenario, this would filter the results based on the query string.",
      },
    },
    mockData: [
      {
        url: "/api/posts/paginated*",
        method: "GET",
        status: 200,
        response: {
          data: {
            posts: mockPosts.filter((post) => post.video.descriptionText?.toLowerCase().includes("tutorial") ?? false),
            no_of_data: 1,
          },
          code: 200,
          message: "Success",
        },
      },
    ],
  },
};

export const EmptyState: Story = {
  name: "Empty State",
  parameters: {
    docs: {
      description: {
        story: "My Videos Table when no videos are found.",
      },
    },
    mockData: [
      {
        url: "/api/posts/paginated*",
        method: "GET",
        status: 200,
        response: {
          data: {
            posts: [],
            no_of_data: 0,
          },
          code: 200,
          message: "Success",
        },
      },
    ],
  },
};

export const LoadingState: Story = {
  name: "Loading State",
  parameters: {
    docs: {
      description: {
        story: "My Videos Table in loading state.",
      },
    },
    mockData: [
      {
        url: "/api/posts/paginated*",
        method: "GET",
        delay: 2000, // Simulate slow loading
        status: 200,
        response: {
          data: {
            posts: mockPosts,
            no_of_data: mockPosts.length,
          },
          code: 200,
          message: "Success",
        },
      },
    ],
  },
};
