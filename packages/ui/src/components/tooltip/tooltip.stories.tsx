import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Button, type ButtonProps } from "../button/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  subcomponents: { TooltipContent, TooltipProvider, TooltipTrigger },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description:
        "The open state of the tooltip when it is initially rendered.",
    },
    open: {
      control: "boolean",
      description:
        "The controlled open state of the tooltip. Must be used in conjunction with `onOpenChange`.",
    },
    onOpenChange: {
      action: "onOpenChange",
      description:
        "Event handler called when the open state of the tooltip changes.",
    },
    delayDuration: {
      control: { type: "number", min: 0, step: 50 },
      description:
        "The duration from when the mouse enters the trigger until the tooltip opens (applied via TooltipProvider).",
    },
  },
};

export default meta;

interface TooltipStoryArgs extends React.ComponentProps<typeof Tooltip> {
  delayDuration?: number;
  triggerContent?: React.ReactElement<ButtonProps>;
  tooltipContent?: React.ReactNode;
  contentProps?: Partial<React.ComponentProps<typeof TooltipContent>>;
}

type Story = StoryObj<TooltipStoryArgs>;

const TooltipTemplate: Story["render"] = (args) => (
  <TooltipProvider delayDuration={args.delayDuration ?? 0}>
    <Tooltip
      defaultOpen={args.defaultOpen}
      open={args.open}
      onOpenChange={args.onOpenChange}
    >
      <TooltipTrigger asChild>
        {args.triggerContent || <Button variant="outline">Hover me</Button>}
      </TooltipTrigger>
      <TooltipContent {...args.contentProps}>
        {args.tooltipContent || <p>This is a tooltip.</p>}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const Default: Story = {
  render: TooltipTemplate,
  args: {
    delayDuration: 200,
    triggerContent: <Button variant="outline">Hover for Default</Button>,
    tooltipContent: <p>This is a default tooltip.</p>,
    contentProps: {},
  },
};

export const LightTheme: Story = {
  render: TooltipTemplate,
  args: {
    delayDuration: 0,
    triggerContent: <Button variant="outline">Hover for Light Tooltip</Button>,
    tooltipContent: <p>This tooltip uses the light theme.</p>,
    contentProps: { theme: "light" },
  },
};

export const DarkTheme: Story = {
  render: TooltipTemplate,
  args: {
    delayDuration: 0,
    triggerContent: <Button variant="secondary">Hover for Dark Tooltip</Button>,
    tooltipContent: <p>This tooltip uses the dark theme.</p>,
    contentProps: { theme: "dark" },
  },
};

export const PositionedRight: Story = {
  render: TooltipTemplate,
  args: {
    delayDuration: 100,
    triggerContent: <Button>Tooltip on Right</Button>,
    tooltipContent: <p>This tooltip appears on the right.</p>,
    contentProps: { side: "right", sideOffset: 5 },
  },
};

export const PositionedTop: Story = {
  render: TooltipTemplate,
  args: {
    delayDuration: 100,
    triggerContent: <Button>Tooltip on Top</Button>,
    tooltipContent: <p>This tooltip appears on the top.</p>,
    contentProps: { side: "top", sideOffset: 5 },
  },
};

export const WithLongText: Story = {
  render: TooltipTemplate,
  args: {
    delayDuration: 300,
    triggerContent: <Button variant="link">Hover for more info</Button>,
    tooltipContent: (
      <p>
        This is a tooltip with a longer piece of text to demonstrate how it
        handles content that might wrap or require more space.
      </p>
    ),
    contentProps: { className: "max-w-xs" },
  },
};

export const CustomDelay: Story = {
  render: TooltipTemplate,
  args: {
    delayDuration: 1000,
    triggerContent: <Button variant="destructive">Hover (1s delay)</Button>,
    tooltipContent: <p>This tooltip appears after a 1-second delay.</p>,
    contentProps: { theme: "dark" },
  },
};
