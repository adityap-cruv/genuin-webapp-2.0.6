import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    onCheckedChange: { action: "checked change" },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: function DefaultSwitch(args) {
    const [checked, setChecked] = useState(args.checked ?? false);

    return <Switch {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
};

export const CheckedDisabled: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: function WithLabelSwitch(args) {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Switch {...args} checked={checked} onCheckedChange={setChecked} />
        <span>Enable feature</span>
      </label>
    );
  },
  args: {
    checked: false,
    disabled: false,
  },
};
