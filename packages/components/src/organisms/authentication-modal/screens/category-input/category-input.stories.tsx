import type { Meta, StoryObj } from "@storybook/react";

import { CategoryInput } from "./category-input";

/**
 * CategoryInput component allows users to select their interests from categorized options.
 * Fetches categories from the API and handles selection state internally.
 */
const meta: Meta<typeof CategoryInput> = {
  title: "Organisms/Authentication/CategoryInput",
  component: CategoryInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A component for selecting user interests during onboarding. Fetches categories from the API.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:max-w-2xl gencl:w-full gencl:bg-white gencl:shadow-sm">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof CategoryInput>;

export default meta;

type Story = StoryObj<typeof CategoryInput>;

export const Default: Story = {
  args: {},
};
