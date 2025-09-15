import { Meta, StoryObj } from "@storybook/react";
import { AddLinkOut } from "./add-linkout";

type AddLinksStories = StoryObj<typeof AddLinkOut>;

const meta: Meta<typeof AddLinkOut> = {
  title: "Organisms/Add Links",
  component: AddLinkOut,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AddLinkOut>;

export const Default: Story = {
  args: {
    onPayload: (payload) => {
      console.log("Storybook Payload:", payload);
    },
  },
};
