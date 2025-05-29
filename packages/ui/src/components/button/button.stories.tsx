import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon } from "lucide-react";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    theme: {
      control: "select",
      options: ["primary", "secondary", "outline", "text"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    asChild: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    theme: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    theme: "secondary",
    children: "Secondary",
  },
};

export const Outline: Story = {
  args: {
    theme: "outline",
    children: "Outline",
  },
};

export const Text: Story = {
  args: {
    theme: "text",
    children: "Text",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Medium",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PlusIcon className="gencl:size-6" />
        With Icon
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    children: <PlusIcon className="gencl:size-6" />,
    size: "md",
    theme: "primary",
  },
};

export const AsChild: Story = {
  args: {
    asChild: true,
    children: <a href="#">Button as Link</a>,
  },
};
