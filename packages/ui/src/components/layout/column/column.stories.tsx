import type { Meta, StoryObj } from "@storybook/react-vite";

import { Column } from "./column";

const meta: Meta<typeof Column> = {
  title: "Layout/Column",
  component: Column,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    gap: {
      control: "select",
      options: ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "baseline", "stretch"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    wrap: { control: "boolean" },
    asChild: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Column>;

const Item = ({ children }: { children: React.ReactNode }) => (
  <div className="gencl:bg-secondary-100 gencl:px-3 gencl:py-2">{children}</div>
);

export const Default: Story = {
  args: {
    gap: "md",
  },
  render: (args) => (
    <Column {...args}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Column>
  ),
};

export const CenteredItems: Story = {
  args: {
    gap: "md",
    align: "center",
  },
  render: (args) => (
    <Column {...args} className="gencl:w-64 gencl:border gencl:border-secondary-150 gencl:p-3">
      <Item>Short</Item>
      <Item>Slightly longer</Item>
      <Item>Even longer item</Item>
    </Column>
  ),
};

export const SpaceBetween: Story = {
  args: {
    justify: "between",
  },
  render: (args) => (
    <Column {...args} className="gencl:h-64 gencl:border gencl:border-secondary-150 gencl:p-3">
      <Item>Top</Item>
      <Item>Bottom</Item>
    </Column>
  ),
};

export const AsArticle: Story = {
  args: {
    asChild: true,
    gap: "sm",
  },
  render: (args) => (
    <Column {...args}>
      <article>
        <Item>Inside an {"<article>"}</Item>
        <Item>via asChild</Item>
      </article>
    </Column>
  ),
};
