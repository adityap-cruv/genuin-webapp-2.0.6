import type { Meta, StoryObj } from "@storybook/react";

import { AddButton } from "./add-linkout-button";

type AddLinksStories = StoryObj<typeof AddButton>;

const meta: Meta<typeof AddButton> = {
  title: "Organisms/Add Linkout Button",
  component: AddButton,
  tags: ["autodocs"],
};

export default meta;

export const Default: AddLinksStories = {
  args: {
    button: {
      url: "Enter button URL",
      text: "Enter button text",
    },
  },
};
