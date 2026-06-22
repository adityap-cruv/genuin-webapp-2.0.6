import type { Meta, StoryObj } from "@storybook/react-vite";

import Add from "@/assets/SvgIcons/Add";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "GenAI/UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "preset",
        "objective",
        "tools",
        "tools_active",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "feedback", "tools"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Send message" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete chat" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Cancel" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Skip" },
};

export const PresetPill: Story = {
  args: { variant: "preset", size: "sm", children: "Generate taglines" },
};

export const ObjectivePill: Story = {
  args: { variant: "objective", size: "sm", children: "Write a product blurb" },
};

export const IconOnly: Story = {
  args: { size: "icon", children: <Add /> },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};
