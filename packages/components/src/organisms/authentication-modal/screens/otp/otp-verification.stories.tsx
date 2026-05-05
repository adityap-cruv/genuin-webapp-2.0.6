import type { Meta, StoryObj } from "@storybook/react";

import { OtpVerification } from "./otp-verfication";

/**
 * The OTP Verification component provides a secure way to verify users through
 * a one-time password sent via email or phone. It includes an OTP input field,
 * timer for resend functionality, and verification button.
 */
const meta: Meta<typeof OtpVerification> = {
  title: "Organisms/Authentication/OtpVerification",
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
    verificationType: {
      description: "The type of verification flow: LOGIN, EMAIL, or PHONE",
      control: { type: "select" },
      options: ["LOGIN", "EMAIL", "PHONE"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof OtpVerification>;

/**
 * Default login OTP verification
 */
export const LoginVerification: Story = {
  args: {
    verificationType: "LOGIN",
  },
};

/**
 * Email OTP verification
 */
export const EmailVerification: Story = {
  args: {
    verificationType: "EMAIL",
  },
};

/**
 * Phone number OTP verification
 */
export const PhoneVerification: Story = {
  args: {
    verificationType: "PHONE",
  },
};
