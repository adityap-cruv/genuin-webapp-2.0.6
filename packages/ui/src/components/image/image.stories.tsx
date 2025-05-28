import type { Meta, StoryObj } from "@storybook/react";

import { Image } from "./image";

const meta: Meta<typeof Image> = {
  title: "Components/Image",
  component: Image,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text", description: "The source URL of the image." },
    alt: { control: "text", description: "Alternative text for the image." },
    width: { control: "number", description: "Width of the image in pixels." },
    height: {
      control: "number",
      description: "Height of the image in pixels.",
    },
    aspectRatio: {
      control: "select",
      options: ["auto", "square", "video", "portrait", "landscape"],
      description:
        "Defines the aspect ratio of the image. The image will be cropped to fit.",
    },
    radius: {
      control: "select",
      options: ["none", "sm", "md", "lg", "full"],
      description: "Applies a border radius to the image.",
    },
    scale: {
      control: "select",
      options: [0, 0.5, 0.75, 0.9, 0.95, 1, 1.05, 1.1, 1.25, 1.5],
      description:
        "CSS transform scale factor for the image. Select a predefined scale value.",
    },
    useWebp: {
      control: "boolean",
      description:
        "Whether to attempt to convert the image source to WebP format.",
      defaultValue: true,
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the image container.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Random image",
    width: 400,
    height: 300,
    scale: 1,
  },
};

export const WithAspectRatio: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Square image",
    width: 400,
    height: 300,
    aspectRatio: "square",
    scale: 1,
  },
};

export const WithRadius: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Rounded image",
    width: 400,
    height: 300,
    radius: "lg",
    scale: 1,
  },
};

export const Scaled: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Scaled image",
    width: 400,
    height: 300,
    scale: 1.25,
  },
};

export const Portrait: Story = {
  args: {
    src: "https://picsum.photos/300/400", // Corrected typo
    alt: "Portrait image",
    width: 300,
    height: 400,
    aspectRatio: "portrait",
    scale: 1,
  },
};

export const WithObjectFitStory: Story = {
  name: "With Object Fit (Applied via props)",
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Contained image",
    width: 400,
    height: 300,
    style: { objectFit: "contain", width: "100%", height: "100%" }, // Applied via style prop for demonstration
    scale: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `objectFit` CSS property can be applied directly via the `style` prop or a `className`. It is not an explicit prop of the `Image` component itself but is passed to the underlying `<img>` element.",
      },
    },
  },
};

export const WebpDisabled: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "No WebP conversion",
    width: 400,
    height: 300,
    useWebp: false,
    scale: 1,
  },
};
