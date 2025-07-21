import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Avatar } from "./avatar";

export default {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"],
    },
    isAvatar: { control: "boolean" },
    imageUrl: { control: "text" },
    alt: { control: "text" },
  },
} as Meta;

// Use Story type for all stories

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    isAvatar: false,
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    alt: "John Doe",
    size: "sm",
  },
};

export const WithFallback: Story = {
  args: {
    isAvatar: false,
    imageUrl: "", // No image, fallback to initials
    alt: "Jane Smith",
    size: "md",
  },
};

export const CustomAvatarUrl: Story = {
  args: {
    isAvatar: true,
    imageUrl: "avatar1", // Will use getAvatarUrl logic
    alt: "Alex Johnson",
    size: "lg",
  },
};

export const AllSizes: Story = {
  render: (args) => {
    const {
      isAvatar = false,
      imageUrl = "https://randomuser.me/api/portraits/women/44.jpg",
      alt = "User",
    } = args;
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map(
          (size) => (
            <Avatar
              key={size}
              size={size}
              isAvatar={isAvatar}
              imageUrl={imageUrl}
              alt={`${alt} ${size}`}
            />
          )
        )}
      </div>
    );
  },
  args: {
    isAvatar: false,
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    alt: "User",
  },
};

export const NoAlt: Story = {
  args: {
    isAvatar: false,
    imageUrl: "", // No image
    alt: "", // No alt, fallback to 'U'
    size: "sm",
  },
};
