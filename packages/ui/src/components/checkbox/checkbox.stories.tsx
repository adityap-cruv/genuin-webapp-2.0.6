import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./checkbox";

/**
 * Checkbox component provides a customizable checkbox input with different variants and sizes.
 * Built on top of Radix UI's Checkbox primitive with custom styling and animations.
 */
const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A customizable checkbox component with different variants and sizes.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "Style variant of the checkbox",
      control: "select",
      options: ["default", "secondary"],
    },
    size: {
      description: "Size of the checkbox",
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      description: "Whether the checkbox is disabled",
      control: "boolean",
    },
    checked: {
      description: "Controlled checked state",
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:flex gencl:items-center gencl:gap-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/**
 * Default checkbox with label
 */
export const Default: Story = {
  render: (args) => (
    <div className="gencl:flex gencl:items-center gencl:space-x-2">
      <Checkbox {...args} id="terms" />
      <label 
        htmlFor="terms" 
        className="gencl:text-sm gencl:font-medium gencl:leading-none"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

/**
 * Secondary variant with different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="gencl:flex gencl:items-center gencl:space-x-8">
      <div className="gencl:flex gencl:items-center gencl:space-x-2">
        <Checkbox id="small" size="sm" variant="secondary" />
        <label htmlFor="small">Small</label>
      </div>
      <div className="gencl:flex gencl:items-center gencl:space-x-2">
        <Checkbox id="medium" size="md" variant="secondary" />
        <label htmlFor="medium">Medium</label>
      </div>
      <div className="gencl:flex gencl:items-center gencl:space-x-2">
        <Checkbox id="large" size="lg" variant="secondary" />
        <label htmlFor="large">Large</label>
      </div>
    </div>
  ),
};

/**
 * Different states of the checkbox
 */
export const States: Story = {
  render: () => (
    <div className="gencl:flex gencl:items-center gencl:space-x-8">
      <div className="gencl:flex gencl:items-center gencl:space-x-2">
        <Checkbox id="default" defaultChecked />
        <label htmlFor="default">Checked</label>
      </div>
      <div className="gencl:flex gencl:items-center gencl:space-x-2">
        <Checkbox id="disabled" disabled />
        <label htmlFor="disabled">Disabled</label>
      </div>
      <div className="gencl:flex gencl:items-center gencl:space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <label htmlFor="disabled-checked">Disabled Checked</label>
      </div>
    </div>
  ),
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    variant: "default",
    size: "md",
    disabled: false,
  },
};