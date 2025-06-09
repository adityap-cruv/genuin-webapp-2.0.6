import type { Meta, StoryObj } from "@storybook/react";
import { OtpVerification } from "./otp-verfication";

/**
 * The OTP Verification component provides a secure way to verify users through 
 * a one-time password sent via email or phone. It includes an OTP input field,
 * timer for resend functionality, and verification button.
 */
const meta: Meta<typeof OtpVerification> = {
  title: "Molecules/Authentication/OtpVerification",
  component: OtpVerification,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "OTP verification form with 4-digit input, timer, and resend functionality.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isEmail: {
      description: "Whether the OTP was sent to email or phone",
      control: { type: "boolean" },
    },
    authValue: {
      description: "Email address or phone number where OTP was sent",
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OtpVerification>;

/**
 * Default view showing email OTP verification
 */
export const EmailVerification: Story = {
  args: {
    isEmail: true,
    authValue: "user@example.com",
  },
};

/**
 * Phone number OTP verification
 */
export const PhoneVerification: Story = {
  args: {
    isEmail: false,
    authValue: "+1 (555) 123-4567",
  },
};

/**
 * Example with masked email address
 */
export const MaskedEmailVerification: Story = {
  args: {
    isEmail: true,
    authValue: "u***r@example.com",
  },
  parameters: {
    docs: {
      description: {
        story: "Shows OTP verification with a masked email address for privacy.",
      },
    },
  },
};

/**
 * Example with masked phone number
 */
export const MaskedPhoneVerification: Story = {
  args: {
    isEmail: false,
    authValue: "***-***-4567",
  },
  parameters: {
    docs: {
      description: {
        story: "Shows OTP verification with a masked phone number for privacy.",
      },
    },
  },
};

/**
 * Interactive playground with all controls
 */
export const Playground: Story = {
  args: {
    isEmail: true,
    authValue: "user@example.com",
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive playground to test different OTP verification scenarios.",
      },
    },
  },
};