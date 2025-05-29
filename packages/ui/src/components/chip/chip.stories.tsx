import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./chip";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary"],
      description: "The variant of the chip",
    },
    rounded: {
      control: { type: "select" },
      options: ["full", "small"],
      description: "The border radius of the chip",
    },
    children: {
      control: { type: "text" },
      description: "The content inside the chip",
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// Primary story
export const Default: Story = {
  args: {
    children: "Owner",
    variant: "default",
    rounded: "full",
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    children: "Member",
    variant: "secondary",
    rounded: "full",
  },
};

// Small rounded variant
export const SmallRounded: Story = {
  args: {
    children: "Admin",
    variant: "default",
    rounded: "small",
  },
};

// Secondary with small rounded
export const SecondarySmallRounded: Story = {
  args: {
    children: "Guest",
    variant: "secondary",
    rounded: "small",
  },
};

// Custom content examples
export const LongText: Story = {
  args: {
    children: "Super Administrator",
    variant: "default",
    rounded: "full",
  },
};

export const ShortText: Story = {
  args: {
    children: "VIP",
    variant: "secondary",
    rounded: "small",
  },
};
