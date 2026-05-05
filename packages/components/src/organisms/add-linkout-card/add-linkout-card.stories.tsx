import type { Meta, StoryObj } from "@storybook/react-vite";

import { AddLinkCard } from "./add-linkout-card";

const meta: Meta<typeof AddLinkCard> = {
  title: "Organisms/Linkout Card",
  component: AddLinkCard,
  tags: ["autodocs"],
  argTypes: {
    onEdit: { action: "edit clicked" },
    onDelete: { action: "delete clicked" },
  },
};

export default meta;

type Story = StoryObj<typeof AddLinkCard>;

export const Default: Story = {
  args: {
    item: {
      image: "https://media.qa.begenuin.com/webapp_assets/assets/avatar/jack_o_lantern.gif",
      title: "Buy Headset",
      link: "https://example.com/product",
      position: 1,
    },
  },
};
