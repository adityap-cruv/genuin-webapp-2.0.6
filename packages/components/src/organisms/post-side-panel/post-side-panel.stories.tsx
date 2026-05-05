import type { Meta, StoryObj } from "@storybook/react-vite";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { testPostDetails } from "../../__test-data__/test-data";

import { PostSidePanel } from "./post-side-panel";

const meta: Meta<typeof PostSidePanel> = {
  title: "Components/PostSidePanel",
  component: PostSidePanel,
};

export default meta;

type Story = StoryObj<typeof PostSidePanel>;

const mockPostDetails = {
  video: {
    id: "75baab35-91ee-4def-a92d-9959b16d95c3",
    type: "video" as const,
    createdAt: 1744890203000,
    commentCount: 0,
    viewCount: 0,
    shareUrl: "https://example.com/video/abc123",
    attachedLink: null,
    source: "https://example.com/media/video.mp4",
    isSparked: false,
    sparkCount: 0,
    thumbnail: "https://example.com/media/thumbnail.png",
    thumbnailM: null,
    description: ["A sample video description for the side panel."],
    slug: "1f27928d0580141c",
    linkoutId: null,
    clickableUrl: null,
    linkouts: [],
    isPinned: false,
    thumbnailSprite: null,
  },
  group: {
    id: "f3088d1f-9603-4018-bf1a-0bf5d239a451",
    slug: "sample-group",
    description: "A sample group description.",
    shareUrl: "https://example.com/loop/sample-group",
    name: "Sample Group",
    isSubscribed: false,
    role: "UNJOINED",
    isPrivate: false,
  },
  community: {
    id: "98c089c1-f59f-48cc-bba9-21687723d691",
    shareUrl: "https://example.com/community/sample",
    slug: "sample-community",
    handle: "samplecommunity",
    isPrivate: false,
    userRole: "UNJOINED",
    name: "Sample Community",
    profileImage: null,
    membersCount: 0,
    groupsCount: 0,
    postsCount: 0,
    brand: null,
  },
  owner: {
    profileImage: "https://placehold.co/100x100",
    isAvatar: false,
    userName: "sampleuser",
    name: "Sample User",
    brand: null,
  },
} satisfies PostDetailsType;

export const Default: Story = {
  render: () => <PostSidePanel postDetails={testPostDetails as unknown as PostDetailsType} />,
};
