import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stack } from "./stack";

const meta: Meta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    gap: {
      control: "select",
      options: ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"],
    },
    asChild: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Stack>;

const Item = ({ children }: { children: React.ReactNode }) => (
  <div className="gencl:bg-secondary-100 gencl:px-3 gencl:py-2">{children}</div>
);

export const Default: Story = {
  args: {
    gap: "md",
  },
  render: (args) => (
    <Stack {...args}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Stack>
  ),
};

export const TightGap: Story = {
  args: {
    gap: "xs",
  },
  render: (args) => (
    <Stack {...args}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Stack>
  ),
};

export const LooseGap: Story = {
  args: {
    gap: "xl",
  },
  render: (args) => (
    <Stack {...args}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Stack>
  ),
};

export const AsSection: Story = {
  args: {
    asChild: true,
    gap: "sm",
  },
  render: (args) => (
    <Stack {...args}>
      <section>
        <Item>I am inside a {"<section>"} root</Item>
        <Item>(via asChild)</Item>
      </section>
    </Stack>
  ),
};
