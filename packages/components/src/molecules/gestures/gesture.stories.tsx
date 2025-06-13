import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { LazyGestureGuideOverlay } from "./gesture-guide-overlay";

// Optional wrapper for better visibility in Storybook
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-[300px] h-[600px] bg-gray-900">{children}</div>
);

const meta: Meta<typeof LazyGestureGuideOverlay> = {
  title: "Molecules/Gestures",
  component: LazyGestureGuideOverlay,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    gestureStep: {
      control: "radio",
      options: ["SWIPE", "PLAY_PAUSE"],
    },
    tapBehavior: {
      control: "radio",
      options: [1, 2, 3],
    },
    className: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof LazyGestureGuideOverlay>;

const Template = (args: any) => (
  <Wrapper>
    <LazyGestureGuideOverlay {...args} />
  </Wrapper>
);

// --- SWIPE Gesture ---
export const SwipeGesture: Story = {
  render: Template,
  args: {
    gestureStep: "SWIPE",
  },
};

// --- PLAY_PAUSE Gesture ---
export const PlayPauseGesture: Story = {
  render: Template,
  args: {
    gestureStep: "PLAY_PAUSE",
    tapBehavior: 2, // Try with 1, 2, 3 for variations
  },
};
