import type { Meta, StoryObj } from "@storybook/react";

import { AddLoactionPanel } from "./add-location-panel";

// Default export for metadata
const meta: Meta<typeof AddLoactionPanel> = {
  title: "Organisms/AddLocationPanel",
  component: AddLoactionPanel,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AddLoactionPanel>;

// Default story (base appearance)
export const Default: Story = {
  name: "Default",
};
