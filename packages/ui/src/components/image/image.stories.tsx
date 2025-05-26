import type { Meta, StoryObj } from "@storybook/react";

import { Image } from "./image";

const meta: Meta<typeof Image> = {
  title: "Components/Image",
  component: Image,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Random image",
    width: 400,
    height: 300,
  },
};

export const WithAspectRatio: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Square image",
    width: 400,
    height: 300,
    aspectRatio: "square",
  },
};

export const WithRadius: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Rounded image",
    width: 400,
    height: 300,
    radius: "lg",
  },
};

export const Scaled: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Scaled image",
    width: 400,
    height: 300,
    scale: 1.2,
  },
};

export const Portrait: Story = {
  args: {
    src: "https://picsum.photos/300/400",
    alt: "Portrait image",
    width: 300,
    height: 400,
    aspectRatio: "portrait",
  },
};

export const WithObjectFit: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Contained image",
    width: 400,
    height: 300,
    objectFit: "contain",
  },
};
