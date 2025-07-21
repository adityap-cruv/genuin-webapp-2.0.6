import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Type your message...",
    rows: 4,
  },
  argTypes: {
    className: { control: "text" },
    "aria-invalid": { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {},
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    placeholder: "This textarea is invalid",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled textarea",
  },
};

export const Required: Story = {
  args: {
    required: true,
    placeholder: "Required textarea",
  },
};

export const CustomClass: Story = {
  args: {
    className: "gencl::bg-primary/10 gencl::text-primary",
    placeholder: "Custom styled textarea",
  },
};
