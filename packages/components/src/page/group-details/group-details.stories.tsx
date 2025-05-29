import type { Meta, StoryObj } from "@storybook/react";

import { GroupDetailsPage } from "./group-details";

const meta: Meta<typeof GroupDetailsPage> = {
  title: "Page/GroupDetailsPage",
  component: GroupDetailsPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    slug: "hshshs",
  },
};
