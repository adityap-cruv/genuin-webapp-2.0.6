import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: {
      control: "text",
    },
    htmlFor: {
      control: "text",
    },
    className: {
      control: "text",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Email address",
    htmlFor: "email",
  },
};

export const Required: Story = {
  args: {
    children: "Password (required)",
    htmlFor: "password",
    className: "text-red-500",
  },
};

export const WithHelper: Story = {
  render: () => (
    <div className="space-y-1">
      <Label htmlFor="username">Username</Label>
      <p className="text-xs text-gray-500">
        Enter your username or email address
      </p>
    </div>
  ),
};
