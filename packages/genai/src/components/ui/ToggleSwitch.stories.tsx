import type { Meta, StoryObj } from "@storybook/react-vite";

import ToggleSwitch from "./toggle-switch";

const meta: Meta<typeof ToggleSwitch> = {
  title: "GenAI/UI/ToggleSwitch",
  component: ToggleSwitch,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: { defaultChecked: false },
};

export const On: Story = {
  args: { defaultChecked: true },
};

export const Controlled: Story = {
  render: () => (
    <div className="gai:flex gai:items-center gai:gap-3">
      <ToggleSwitch checked={false} />
      <span className="gai:text-secondary-gray-600 gai:text-sm">controlled — always off</span>
    </div>
  ),
};
