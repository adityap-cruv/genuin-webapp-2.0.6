import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    min: { control: "number", defaultValue: 0 },
    max: { control: "number", defaultValue: 100 },
    step: { control: "number", defaultValue: 1 },
    disabled: { control: "boolean", defaultValue: false },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: function DefaultSlider() {
    const [value, setValue] = useState([50]);

    return (
      <div className="w-[300px]">
        <Slider value={value} onValueChange={setValue} className="w-full" />
        <p className="mt-2 text-center">Value: {value}</p>
      </div>
    );
  },
};

export const Range: Story = {
  render: function RangeSlider() {
    const [value, setValue] = useState([25, 75]);

    return (
      <div className="w-[300px]">
        <Slider value={value} onValueChange={setValue} className="w-full" />
        <p className="mt-2 text-center">
          Range: {value[0]} - {value[1]}
        </p>
      </div>
    );
  },
};

export const WithSteps: Story = {
  render: function SteppedSlider() {
    const [value, setValue] = useState([25]);

    return (
      <div className="w-[300px]">
        <Slider
          value={value}
          onValueChange={setValue}
          step={25}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <p className="mt-2 text-center">Value: {value}%</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [70],
    disabled: true,
  },
  render: (args) => (
    <div className="w-[300px]">
      <Slider {...args} className="w-full" />
      <p className="mt-2 text-center text-sm text-gray-500">Disabled slider</p>
    </div>
  ),
};

export const CustomRange: Story = {
  render: function CustomRangeSlider() {
    const [value, setValue] = useState([30]);

    return (
      <div className="w-[300px]">
        <Slider
          value={value}
          onValueChange={setValue}
          min={-50}
          max={50}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>-50</span>
          <span>-25</span>
          <span>0</span>
          <span>25</span>
          <span>50</span>
        </div>
        <p className="mt-2 text-center">Value: {value}</p>
      </div>
    );
  },
};

export const Vertical: Story = {
  render: function VerticalSlider() {
    const [value, setValue] = useState([50]);

    return (
      <div className="h-[200px]">
        <Slider
          value={value}
          onValueChange={setValue}
          orientation="vertical"
          className="h-full"
        />
      </div>
    );
  },
};
