import type { Meta, StoryObj } from "@storybook/react";
import { BecomeCreator } from "./become-creator";

/**
 * The BecomeCreator component displays a carousel of steps and information
 * about becoming a creator on the platform. It includes auto-scrolling slides
 * with custom navigation dots.
 */
const meta: Meta<typeof BecomeCreator> = {
  title: "Organisms/Authentication/BecomeCreator",
  component: BecomeCreator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Interactive carousel showcasing creator onboarding steps with brand-specific content.",
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
  argTypes: {
    className: {
      description: "Additional CSS classes to apply",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BecomeCreator>;

/**
 * Default view with auto-scrolling carousel
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Shows the default carousel with automatic scrolling and dot navigation.",
      },
    },
  },
};

/**
 * Custom styled version with different background and spacing
 */
export const CustomStyled: Story = {
  args: {
    className: "gencl:bg-secondary-50 gencl:shadow-lg gencl:rounded-xl",
  },
  parameters: {
    docs: {
      description: {
        story: "Customized version with different styling and visual hierarchy.",
      },
    },
  },
};