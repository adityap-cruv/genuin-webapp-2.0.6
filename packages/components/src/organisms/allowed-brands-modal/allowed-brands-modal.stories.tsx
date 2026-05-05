import type { Meta, StoryObj } from "@storybook/react";

import { AllowedBrandModal } from "./allowed-brands-modal";

const meta: Meta<typeof AllowedBrandModal> = {
  title: "Organisms/Allowed Brand Modal",
  component: AllowedBrandModal,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AllowedBrandModal>;

export const Default: Story = {
  args: {
    setOpen: () => null,
  },
};
