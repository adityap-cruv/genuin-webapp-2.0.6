import type { Meta, StoryObj } from "@storybook/react";

import { GroupDetailsTabs } from "./group-details-tabs";

const meta = {
  title: "templates/GroupDetailsTabs",
  component: GroupDetailsTabs,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {},
  decorators: [
    (Story) => (
      <div style={{ padding: "36px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GroupDetailsTabs>;

export default meta;
type Story = StoryObj<typeof GroupDetailsTabs>;

export const Default: Story = {
  args: {
    slug: "test-b1y0",
  },
};
