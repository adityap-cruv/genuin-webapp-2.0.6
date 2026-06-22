import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta: Meta = {
  title: "GenAI/UI/Popover",
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="gai:font-body-1-med gai:text-secondary-gray-700">
        Choose an attachment, video style, or background music. Anchored to the
        trigger and portalled into <code>.genai-sdk-container</code>.
      </PopoverContent>
    </Popover>
  ),
};
