import type { Meta, StoryObj } from "@storybook/react-vite";

import type { PostTileDataType } from "src/molecules/post-tile";

import { PostsGrid } from "./index"; // Assuming the component is in index.ts

// Create an array of fake posts
const FAKE_POSTS: PostTileDataType[] = Array.from({ length: 20 }, (_, i) => ({
  postId: (i + 1).toString(),
  title: `Post Title ${i + 1}`,
  imageUrl:
    "https://media.qa.begenuin.com/uploads/thumbnails/1691038031235.png",
  author: `Author ${i + 1}`,
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0], // Generates dates decrementing from today
  isPinned: i < 5,
  linkouts: Math.random() > 0.5 ? "https://example.com" : undefined,
  stats: {
    views: Math.floor(Math.random() * 10000000),
    comments: Math.floor(Math.random() * 10000),
    shares: Math.floor(Math.random() * 50),
  },
}));

const meta: Meta<typeof PostsGrid> = {
  title: "Organisms/PostsGrid",
  component: PostsGrid,
  // Add parameters, argTypes, decorators, etc. as needed
  // parameters: {
  //   layout: 'fullscreen',
  // },
  tags: ["autodocs"], // Enables automatic documentation generation
};

export default meta;
type Story = StoryObj<typeof PostsGrid>;

// Default story: Renders the PostsGrid with default props
export const Default: Story = {
  args: {
    // Add default props for PostsGrid here if any
    // For example:
    posts: FAKE_POSTS,
    className: "gencl:w-full gencl:mx-auto gencl:justify-center",
  },
};

// Story for an empty state: Renders PostsGrid with no posts
// export const Empty: Story = {
//   args: {
//     posts: [],
//   },
// };

// Add more stories here to showcase different states and props
// For example:
// export const WithLoading: Story = {
//   args: {
//     isLoading: true,
//     posts: [],
//   },
// };

// export const WithError: Story = {
//   args: {
//     error: 'Failed to load posts.',
//     posts: [],
//   },
// };
