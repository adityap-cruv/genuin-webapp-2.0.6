import type { Meta, StoryObj } from "@storybook/react";

import { SignIn } from "./signin";

/**
 * The SignIn component provides authentication options via email or phone number.
 * It includes a toggle between input methods and proper validation for each type.
 */
const meta: Meta<typeof SignIn> = {
  title: "Organisms/Authentication/SignIn",
  component: SignIn,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Authentication form supporting both email and phone number sign-in methods.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description: "Callback fired when form is submitted with value and type",
      control: false,
    },
    email: {
      description: "Whether to show email input by default",
      control: { type: "boolean" },
    },
    className: {
      description: "Additional CSS classes to apply",
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SignIn>;

/**
 * Default view with phone number input as initial state
 */
export const PhoneFirst: Story = {
  args: {
    email: false,
  },
};

/**
 * Email input as initial state
 */
export const EmailFirst: Story = {
  args: {
    email: true,
  },
};

/**
 * Custom styled variant with additional classes
 */
export const CustomStyled: Story = {
  args: {
    className: "gencl:bg-secondary-50 gencl:p-6 gencl:rounded-xl",
    email: true,
  },
};

/**
 * Interactive playground with all controls
 */
export const Playground: Story = {
  args: {
    email: false,
    className: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive playground with all available props configurable.",
      },
    },
  },
};
