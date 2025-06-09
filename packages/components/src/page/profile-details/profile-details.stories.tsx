import type { Meta, StoryObj } from "@storybook/react";

import { BaseLayout } from "@templates/base-layout";

import { ProfileDetails } from "./profile-details";

const meta: Meta<typeof ProfileDetails> = {
  title: "Page/ProfileDetails",
  component: ProfileDetails,
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
  argTypes: {
    userName: {
      control: "text",
      description: "The username of the profile to display",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileDetails>;

export const Default: Story = {
  args: {
    userName: "lululemon",
    forBrand: true,
  },
};
