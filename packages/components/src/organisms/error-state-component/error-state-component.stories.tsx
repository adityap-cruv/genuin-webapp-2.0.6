import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ComponentErrorState } from "./error-state-component";

// Define valid types based on available states
const TYPES = [
  "NO_POSTS",
  "NO_GROUPS",
  "NO_COMMUNITIES",
  "NO_POSTS_ITEM",
  "WARNING",
] as const;

type ComponentErrorStateStories = StoryObj<typeof ComponentErrorState>;

const meta: Meta<typeof ComponentErrorState> = {
  title: "Organisms/ErrorState",
  component: ComponentErrorState,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: [...TYPES],
      description: "Error state type to display",
    },
  },
};

export default meta;

export const Default: ComponentErrorStateStories = {
  args: {
    type: "NO_POSTS",
  },
};
