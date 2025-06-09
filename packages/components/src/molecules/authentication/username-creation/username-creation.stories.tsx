import type { Meta, StoryObj } from "@storybook/react";
import { UsernameCreation } from "./username-creation";

/**
 * The Username Creation component allows users to set their display name.
 * It includes input validation, character count, and a continue button.
 */
const meta: Meta<typeof UsernameCreation> = {
  title: "Molecules/Authentication/UsernameCreation",
  component: UsernameCreation,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Username creation form with character limit and validation.",
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
};

export default meta;
type Story = StoryObj<typeof UsernameCreation>;

/**
 * Default empty state
 */
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: "Initial state of the username creation form.",
      },
    },
  },
};