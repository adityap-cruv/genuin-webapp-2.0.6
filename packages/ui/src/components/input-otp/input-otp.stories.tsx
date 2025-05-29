import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp";

const meta: Meta<typeof InputOTP> = {
  title: "Components/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  render: function DefaultOTP() {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-2">
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-sm text-gray-500">Value: {value || "Empty"}</div>
      </div>
    );
  },
};

export const WithSeparators: Story = {
  render: function SeparatedOTP() {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-2">
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSeparator />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-sm text-gray-500">Value: {value || "Empty"}</div>
      </div>
    );
  },
};

export const CustomStyling: Story = {
  render: function CustomStyledOTP() {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-2">
        <InputOTP maxLength={4} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot
              index={0}
              className="rounded-md border-2 border-blue-500 w-12 h-12"
            />
            <InputOTPSlot
              index={1}
              className="rounded-md border-2 border-blue-500 w-12 h-12"
            />
            <InputOTPSlot
              index={2}
              className="rounded-md border-2 border-blue-500 w-12 h-12"
            />
            <InputOTPSlot
              index={3}
              className="rounded-md border-2 border-blue-500 w-12 h-12"
            />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-sm text-gray-500">Value: {value || "Empty"}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: function DisabledOTP() {
    return (
      <InputOTP maxLength={6} value="123456" disabled>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSeparator />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    );
  },
};
