import type { Meta, StoryObj } from "@storybook/react-vite";
import { Settings } from "lucide-react";

import { Button } from "@components/button";
import { Input } from "@components/input";
import { Label } from "@components/label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button theme="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-gray-500">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button theme="outline" className="w-10 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-gray-500">
              Adjust application settings.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="analytics" defaultChecked />
              <Label htmlFor="analytics">Share analytics</Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const PositionedPopover: Story = {
  render: () => (
    <div className="flex items-center justify-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button theme="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent className="w-40" align="center" side="top">
          <p className="text-center">This popover appears on top</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button theme="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent className="w-40" align="center" side="bottom">
          <p className="text-center">This popover appears on bottom</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button theme="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent className="w-40" align="center" side="left">
          <p className="text-center">This popover appears on left</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button theme="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent className="w-40" align="center" side="right">
          <p className="text-center">This popover appears on right</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
