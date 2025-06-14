import type { Meta, StoryObj } from "@storybook/react";

import { BaseLayout } from "@genuin/components/templates/base-layout";

import { GroupDetailsPage } from "./group-details";

const meta: Meta<typeof GroupDetailsPage> = {
  title: "Page/GroupDetailsPage",
  component: GroupDetailsPage,
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
    slug: "heritage-rides",
  },
};

export const ErrorPage: Story = {
  args: {
    slug: "invalid-slug-to-trigger-generic-error",
  },
};
