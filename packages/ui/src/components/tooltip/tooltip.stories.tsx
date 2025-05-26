import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { TooltipProvider } from "./tooltip";

export default {
  title: "Components/Tooltip",
  component: TooltipProvider,
} as Meta;

export const Default: StoryObj = {
  render: (args) => (
    <TooltipProvider {...args}>
      <div>Hover over me</div>
    </TooltipProvider>
  ),
};
