import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { RadioGroup, RadioGroupItem, RadioItem } from "./radio-input";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioButton",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
**RadioButton** is a UI atom for selecting a single option from a set.  
It supports both primitive usage (with \`RadioGroupItem\`) and labeled usage (with \`RadioItem\`).  
You can arrange options vertically or horizontally, disable options, and fully control the group state.

**Usage:**
- Use \`RadioGroup\` to wrap your radio options.
- Use \`RadioGroupItem\` for primitive radio buttons (manual label association).
- Use \`RadioItem\` for labeled options (label and radio are grouped).
- Control the group with \`defaultValue\`, \`value\`, and \`onValueChange\`.

**Props:**
- \`RadioGroup\`: \`defaultValue\`, \`value\`, \`onValueChange\`, \`className\`, etc.
- \`RadioGroupItem\`: \`value\`, \`id\`, \`disabled\`, \`className\`, etc.
- \`RadioItem\`: \`value\`, \`label\`, \`disabled\`, \`className\`, etc.

All styling uses the \`gencl\` Tailwind prefix for consistency.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "The selected value (for controlled usage)",
    },
    defaultValue: {
      control: "text",
      description: "The default selected value (for uncontrolled usage)",
    },
    disabled: {
      control: "boolean",
      description: "Disable the radio group or item",
    },
    className: {
      control: "text",
      description: "Custom className for styling",
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// 1. Basic vertical radio group with manual labels
export const Basic: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" aria-label="Basic radio group" className="gencl:flex gencl:flex-col gencl:gap-4 gencl:bg-secondary-50 gencl:p-6 gencl:rounded-lg gencl:shadow-md gencl:w-80">
      <div className="gencl:flex gencl:items-center gencl:gap-3">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="gencl:text-body-1-medium gencl:cursor-pointer">Option 1</label>
      </div>
      <div className="gencl:flex gencl:items-center gencl:gap-3">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="gencl:text-body-1-medium gencl:cursor-pointer">Option 2</label>
      </div>
      <div className="gencl:flex gencl:items-center gencl:gap-3">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="gencl:text-body-1-medium gencl:cursor-pointer">Option 3</label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "A basic vertical radio group using primitive items and manual labels.",
      },
    },
  },
};

// 2. Labeled options with disabled state and helper text
export const WithLabelsAndDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="b" aria-label="Labeled radio group" className="gencl:space-y-4 gencl:bg-white gencl:p-6 gencl:rounded-lg gencl:shadow-md gencl:w-80">
      <RadioItem value="a" label={
        <span>
          Active Option
          <span className="gencl:block gencl:text-body-2-regular gencl:text-secondary-400">You can select this.</span>
        </span>
      } />
      <RadioItem value="b" label={
        <span>
          Selected Option
          <span className="gencl:block gencl:text-body-2-regular gencl:text-secondary-400">This is currently selected.</span>
        </span>
      } />
      <RadioItem value="c" label={
        <span>
          Disabled Option
          <span className="gencl:block gencl:text-body-2-regular gencl:text-secondary-300">You cannot select this.</span>
        </span>
      } disabled />
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows labeled options, helper text, and a disabled state.",
      },
    },
  },
};

// 3. Horizontal radio group with custom colors and icons
export const HorizontalCustom: Story = {
  render: () => (
    <RadioGroup defaultValue="left" aria-label="Horizontal radio group" className="gencl:flex gencl:flex-row gencl:gap-8 gencl:bg-secondary-100 gencl:p-6 gencl:rounded-lg gencl:shadow-md gencl:w-fit">
      <RadioItem value="left" label={
        <span className="gencl:flex gencl:items-center gencl:gap-2">
          <span className="gencl:w-4 gencl:h-4 gencl:bg-primary-300 gencl:rounded-full" />
          Left
        </span>
      } />
      <RadioItem value="center" label={
        <span className="gencl:flex gencl:items-center gencl:gap-2">
          <span className="gencl:w-4 gencl:h-4 gencl:bg-primary-500 gencl:rounded-full" />
          Center
        </span>
      } />
      <RadioItem value="right" label={
        <span className="gencl:flex gencl:items-center gencl:gap-2">
          <span className="gencl:w-4 gencl:h-4 gencl:bg-primary-700 gencl:rounded-full" />
          Right
        </span>
      } />
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "A horizontal radio group with custom colored icons for each option.",
      },
    },
  },
};

// 4. Controlled radio group with external state
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("option2");
    return (
      <div className="gencl:space-y-4 gencl:bg-secondary-50 gencl:p-6 gencl:rounded-lg gencl:shadow-md gencl:w-80">
        <div className="gencl:mb-2 gencl:text-body-1-bold">Controlled Radio Group</div>
        <RadioGroup value={value} onValueChange={setValue} className="gencl:flex gencl:flex-col gencl:gap-4">
          <RadioItem value="option1" label="Option 1" />
          <RadioItem value="option2" label="Option 2" />
          <RadioItem value="option3" label="Option 3" />
        </RadioGroup>
        <div className="gencl:mt-2 gencl:text-body-2-regular">
          Selected: <span className="gencl:font-semibold">{value}</span>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A controlled radio group with external state and a display of the selected value.",
      },
    },
  },
};

// 5. Radio group with many options and scroll
export const ManyOptionsScrollable: Story = {
  render: () => (
    <RadioGroup defaultValue="opt5" aria-label="Scrollable radio group" className="gencl:flex gencl:flex-col gencl:gap-2 gencl:bg-white gencl:p-6 gencl:rounded-lg gencl:shadow-md gencl:w-80 gencl:max-h-64 gencl:overflow-y-auto">
      {Array.from({ length: 10 }).map((_, i) => (
        <RadioItem key={i} value={`opt${i + 1}`} label={`Option ${i + 1}`} />
      ))}
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "A radio group with many options and a scrollable container.",
      },
    },
  },
};