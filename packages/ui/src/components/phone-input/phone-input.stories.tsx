import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { PhoneInput } from "./phone-input";

const meta: Meta<typeof PhoneInput> = {
  title: "Components/PhoneInput",
  component: PhoneInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof PhoneInput>;

export const Default: Story = {
  render: function DefaultPhoneInput() {
    const [value, setValue] = useState("");

    return (
      <div className="w-[300px]">
        <PhoneInput value={value} onChange={setValue} />
        <p className="mt-2 text-sm text-gray-500">
          Value: {value || "(no number entered)"}
        </p>
      </div>
    );
  },
};

export const WithInitialValue: Story = {
  render: function PrefilledPhoneInput() {
    const [value, setValue] = useState("+14155552671");

    return (
      <div className="w-[300px]">
        <PhoneInput value={value} onChange={setValue} />
        <p className="mt-2 text-sm text-gray-500">Value: {value}</p>
      </div>
    );
  },
};

export const WithPlaceholder: Story = {
  render: function PlaceholderPhoneInput() {
    const [value, setValue] = useState("");

    return (
      <div className="w-[300px]">
        <PhoneInput
          value={value}
          onChange={setValue}
          placeholder="Enter your phone number"
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: function DisabledPhoneInput() {
    const [value, setValue] = useState("+14155552671");

    return (
      <div className="w-[300px]">
        <PhoneInput value={value} onChange={setValue} disabled />
      </div>
    );
  },
};

export const WithDefaultCountry: Story = {
  render: function DefaultCountryPhoneInput() {
    const [value, setValue] = useState("");

    return (
      <div className="w-[300px]">
        <PhoneInput value={value} onChange={setValue} defaultCountry="GB" />
        <p className="mt-2 text-sm text-gray-500">
          Default country set to United Kingdom (GB)
        </p>
      </div>
    );
  },
};

export const WithInternationalValue: Story = {
  render: function InternationalPhoneInput() {
    const [value, setValue] = useState("+33123456789");

    return (
      <div className="w-[300px]">
        <PhoneInput value={value} onChange={setValue} international />
        <p className="mt-2 text-sm text-gray-500">
          French number with international format: {value}
        </p>
      </div>
    );
  },
};
