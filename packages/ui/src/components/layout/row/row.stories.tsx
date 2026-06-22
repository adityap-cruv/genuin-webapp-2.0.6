import type { Meta, StoryObj } from "@storybook/react-vite";

import { Row } from "./row";

const meta: Meta<typeof Row> = {
  title: "Layout/Row",
  component: Row,
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

type Story = StoryObj<typeof Row>;

const Item = ({ children }: { children: React.ReactNode }) => (
  <div className="gencl:bg-secondary-100 gencl:px-3 gencl:py-2">{children}</div>
);

export const Default: Story = {
  args: {
    gap: "md",
  },
  render: (args) => (
    <Row {...args}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Row>
  ),
};

export const Centered: Story = {
  args: {
    gap: "md",
    align: "center",
    justify: "center",
  },
  render: (args) => (
    <Row {...args} className="gencl:h-32 gencl:border gencl:border-secondary-150">
      <Item>Centered</Item>
      <Item>Items</Item>
    </Row>
  ),
};

export const SpaceBetween: Story = {
  args: {
    justify: "between",
    align: "center",
  },
  render: (args) => (
    <Row {...args}>
      <Item>Left</Item>
      <Item>Right</Item>
    </Row>
  ),
};

export const Wrapping: Story = {
  args: {
    gap: "sm",
    wrap: true,
  },
  render: (args) => (
    <Row {...args} className="gencl:max-w-[300px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <Item key={i}>Item {i + 1}</Item>
      ))}
    </Row>
  ),
};

export const AsNav: Story = {
  args: {
    asChild: true,
    gap: "md",
  },
  render: (args) => (
    <Row {...args}>
      <nav>
        <Item>Inside a {"<nav>"}</Item>
        <Item>via asChild</Item>
      </nav>
    </Row>
  ),
};
