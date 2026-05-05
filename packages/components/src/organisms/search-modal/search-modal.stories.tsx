import { Button } from "@genuin/ui/button";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { SearchModal } from "./search-modal";

const meta: Meta<typeof SearchModal> = {
  title: "Organisms/Search/SearchModal",
  component: SearchModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultStory(args: React.ComponentProps<typeof SearchModal>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Search</Button>
      <SearchModal {...args} open={open} onOpenChange={setOpen} />
    </>
  );
}

// Default story with trigger button
export const Default: Story = {
  render: (args) => <DefaultStory {...args} />,
  args: {
    placeholder: "Search...",
  },
};
