import type { Meta, StoryObj } from "@storybook/react";

import { AddLinks } from "./add-linkout-form";

type AddLinksStories = StoryObj<typeof AddLinks>;

const meta: Meta<typeof AddLinks> = {
  title: "Organisms/Add Thumbnail Linkout",
  component: AddLinks,
  tags: ["autodocs"],
  argTypes: {
    url: { control: "text" },
    title: { control: "text" },
  },
};

export default meta;

export const Default: AddLinksStories = {
  args: {
    url: "Enter URL",
    title: "Enter Title",
  },
};
