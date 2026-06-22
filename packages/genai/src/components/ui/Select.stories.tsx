import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const meta: Meta = {
  title: "GenAI/UI/Select",
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Select defaultValue="maya">
      <SelectTrigger>
        <SelectValue placeholder="Pick an agent" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="maya">Maya</SelectItem>
        <SelectItem value="octo-leg">Octo Leg</SelectItem>
        <SelectItem value="octo-head">Octo Head</SelectItem>
      </SelectContent>
    </Select>
  ),
};
