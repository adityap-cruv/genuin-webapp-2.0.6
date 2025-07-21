import type { Meta, StoryObj } from "@storybook/react";

import { BaseLayout } from "@genuin/components/templates/base-layout";
import { SettingsPage } from "./settings";

const meta: Meta<typeof SettingsPage> = {
  title: "Organisms/Settings",
  component: SettingsPage,
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
    slug: "",
  },
};
