import type { Meta, StoryObj } from "@storybook/react-vite";

import { Container } from "./container";

const meta: Meta<typeof Container> = {
  title: "Layout/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    maxW: {
      control: "select",
      options: ["mobile", "tablet-sm", "tablet", "desktop", "desktop-wide", "full"],
    },
    px: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
    },
    asChild: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Container>;

const Body = () => (
  <div className="gencl:bg-secondary-100 gencl:p-6 gencl:text-center">
    Content stays inside the container; horizontal centering and inset padding are managed by the primitive.
  </div>
);

export const Default: Story = {
  args: {
    maxW: "desktop",
    px: "md",
  },
  render: (args) => (
    <Container {...args}>
      <Body />
    </Container>
  ),
};

export const Mobile: Story = {
  args: {
    maxW: "mobile",
    px: "sm",
  },
  render: (args) => (
    <Container {...args}>
      <Body />
    </Container>
  ),
};

export const DesktopWide: Story = {
  args: {
    maxW: "desktop-wide",
    px: "lg",
  },
  render: (args) => (
    <Container {...args}>
      <Body />
    </Container>
  ),
};

export const RawMaxWidthEscapeHatch: Story = {
  args: {
    maxW: "960px",
    px: "md",
  },
  render: (args) => (
    <Container {...args}>
      <Body />
    </Container>
  ),
};

export const AsMain: Story = {
  args: {
    asChild: true,
    maxW: "tablet",
    px: "md",
  },
  render: (args) => (
    <Container {...args}>
      <main>
        <Body />
      </main>
    </Container>
  ),
};
