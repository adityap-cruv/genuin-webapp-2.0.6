import type { Meta, StoryObj } from "@storybook/react";

import { BaseLayout } from "src/templates/base-layout";

import { CommunityDetails } from "./community-details";

const meta: Meta<typeof CommunityDetails> = {
  title: "Page/CommunityDetails",
  component: CommunityDetails,
  decorators: [
    (Story) => (
      <BaseLayout>
        <Story />
      </BaseLayout>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // slug: "dhruv-2-new",
    slug: "koda-lovers",
  },
};
