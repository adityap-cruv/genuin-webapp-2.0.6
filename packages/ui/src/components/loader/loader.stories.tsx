import type { Meta, StoryObj } from "@storybook/react-vite";

import { Loader } from "./loader";

const meta: Meta<typeof Loader> = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      defaultValue: "sm",
    },
    className: {
      control: "text",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    size: "sm",
  },
};

export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    size: "xl",
  },
};

export const CustomColor: Story = {
  args: {
    size: "md",
    className: "stroke-blue-500",
  },
};

export const LoaderGroup: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Loader size="xs" />
      <Loader size="sm" />
      <Loader size="md" />
      <Loader size="lg" />
      <Loader size="xl" />
    </div>
  ),
};
