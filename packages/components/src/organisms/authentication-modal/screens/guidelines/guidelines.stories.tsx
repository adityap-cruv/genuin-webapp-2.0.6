import type { Meta, StoryObj } from "@storybook/react";
import { Guidelines } from "./guidelines";
import { BaseContextProvider } from "src/context/base";

/**
 * Guidelines component displays brand-specific guidelines and rules
 * with proper brand logo and formatting. It handles loading states
 * and integrates with the brand context.
 */
const meta: Meta<typeof Guidelines> = {
  title: "Organisms/Authentication/Guidelines",
  component: Guidelines,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Displays brand guidelines with proper branding and layout.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:max-w-2xl gencl:w-full">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Guidelines>;

/**
 * Default view of the Guidelines component with brand context
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Shows guidelines with brand logo and standard layout.",
      },
    },
  },
};
