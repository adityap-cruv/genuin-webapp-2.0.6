import type { Meta, StoryObj } from "@storybook/react-vite";
import { LinkThumbnail } from "./link-thumbnail";

const meta: Meta<typeof LinkThumbnail> = {
  title: "Molecules/LinkThumbnail",
  component: LinkThumbnail,
  tags: ["autodocs"],
  argTypes: {
    width: { control: { type: "number" }, defaultValue: 128 },
    height: { control: { type: "number" }, defaultValue: 128 },
    scale: {
      control: {
        type: "select",
      },
      options: [0, 0.5, 0.75, 0.9, 0.95, 1, 1.05, 1.1, 1.25, 1.5],
      defaultValue: 1,
    },
    src: {
      control: "text",
    },
    title: { control: "text" },
    className: { control: "text" },
    fileTypes: { control: "text", defaultValue: ".jpg, .png, .jpeg" },
    fileDimension: { control: "text", defaultValue: "16 × 16" },
  },
};

export default meta;

type Story = StoryObj<typeof LinkThumbnail>;

export const Default: Story = {
  args: {
    width: 128,
    height: 128,
    scale: 1,
    // no src provided
    title: "Upload image",
    className: "gencl:rounded-xl",
    fileTypes: ".jpg, .png, .jpeg",
    fileDimension: "16 × 16",
  },
};

export const WithImage: Story = {
  args: {
    width: 128,
    height: 128,
    scale: 1,
    src: "https://picsum.photos/400/300",
    title: "Headphones",
    className: "gencl:rounded-xl",
    fileTypes: ".jpg, .png, .jpeg",
    fileDimension: "16 × 16",
  },
};
