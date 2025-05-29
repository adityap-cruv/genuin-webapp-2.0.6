import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Button } from "../button";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

export default {
  title: "Components/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "The controlled open state of the collapsible.",
    },
    defaultOpen: {
      control: "boolean",
      description:
        "The initial open state of the collapsible when uncontrolled.",
    },
    disabled: {
      control: "boolean",
      description:
        "When true, prevents the user from interacting with the collapsible.",
    },
    onOpenChange: {
      action: "onOpenChange",
      description:
        "Event handler called when the open state of the collapsible changes.",
    },
  },
} as Meta;

export function CollapsibleDemo() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="gencl:w-[350px] gencl:space-y-2"
    >
      <div className="gencl:flex gencl:items-center gencl:justify-between gencl:space-x-4 gencl:px-4">
        <h4 className="gencl:text-sm gencl:font-semibold">
          @peduarte starred 3 repositories
        </h4>
        <CollapsibleTrigger asChild>
          <Button size="sm">
            <p className="gencl:h-4 gencl:w-4">upd</p>
            <span className="gencl:sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="gencl:rounded-md gencl:border gencl:px-4 gencl:py-2 gencl:font-mono gencl:text-sm gencl:shadow-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent className="gencl:space-y-2">
        <div className="gencl:rounded-md gencl:border gencl:px-4 gencl:py-2 gencl:font-mono gencl:text-sm gencl:shadow-sm">
          @radix-ui/colors
        </div>
        <div className="gencl:rounded-md gencl:border gencl:px-4 gencl:py-2 gencl:font-mono gencl:text-sm gencl:shadow-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export const Default: StoryObj<typeof Collapsible> = {
  render: (args) => <CollapsibleDemo {...args} />,
  args: {
    defaultOpen: false,
  },
};

export const InitiallyOpen: StoryObj<typeof Collapsible> = {
  render: (args) => <CollapsibleDemo {...args} />,
  args: {
    defaultOpen: true,
  },
};
