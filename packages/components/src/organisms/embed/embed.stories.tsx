import type { Meta, StoryObj } from "@storybook/react";
import { Embed } from "./embed";

const meta: Meta<typeof Embed> = {
  title: "Organisms/Web-SDK/Embed",
  component: Embed,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Embed>;

export const Basic: Story = {
  name: "Embed for sdk",
  args: {
    // Provide minimal required props if any
  },
};
