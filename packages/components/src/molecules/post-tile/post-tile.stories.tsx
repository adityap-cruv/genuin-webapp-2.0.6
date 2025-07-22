import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostTile, PostTileSkeleton } from "./post-tile";

const meta: Meta<typeof PostTile> = {
  title: "Molecules/PostTile",
  component: PostTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    showHover: { control: "boolean" },
    size: { control: "select", options: ["sm", "lg"] },
    onClick: { action: "clicked" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PostTile>;

export const Default: Story = {
  args: {
    postData: {
      postId: "1",
      imageUrl:
        "https://media.qa.begenuin.com/uploads/thumbnails/1691038031235.png",
      linkouts: "ldjfl",
      stats: {
        views: 12345,
        comments: 678,
        reactions: 90,
      },
      isPinned: true,
    },
    size: "sm",
    showHover: true,
    imageCompProps: {
      useWebp: false,
    },
  },
};

export const Skeleton: Story = {
  parameters: {
    docs: {
      source: {
        code: `
          <div className="gencl:flex gencl:gap-4"> 
            <PostTileSkeleton />
          </div>`,
        language: "tsx",
        type: "auto",
      },
    },
  },
  render: (args) => {
    return (
      <div className="gencl:flex gencl:gap-4">
        <PostTileSkeleton />
      </div>
    );
  },
  argTypes: {
    showHover: { table: { disable: true } },
    postData: { table: { disable: true } },
    imageCompProps: { table: { disable: true } },
  },
};

export const WithNavigation: Story = {
  args: {
    postData: {
      postId: "2",
      imageUrl:
        "https://media.qa.begenuin.com/uploads/thumbnails/1691038031235.png",
      url: "https://example.com", // External URL
      linkouts: "ldjfl",
      stats: {
        views: 54321,
        comments: 987,
        reactions: 123,
      },
      isPinned: false,
    },
    size: "sm",
    showHover: true,
    imageCompProps: {
      useWebp: false,
    },
  },
};
