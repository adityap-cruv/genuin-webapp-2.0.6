import type { Meta, StoryObj } from "@storybook/react-vite";

import Spinner from "./spinner";

const meta: Meta<typeof Spinner> = {
  title: "GenAI/UI/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    color: { control: "inline-radio", options: ["primary", "secondary"] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Medium: Story = {
  args: { size: "md", color: "primary" },
};

export const Small: Story = {
  args: { size: "sm", color: "primary" },
};

export const Large: Story = {
  args: { size: "lg", color: "primary" },
};

export const SecondaryOnDark: Story = {
  args: { size: "md", color: "secondary" },
  parameters: { backgrounds: { default: "dark" } },
  render: (args) => (
    <div style={{ background: "#1d1f20", padding: 32 }}>
      <Spinner {...args} />
    </div>
  ),
};
