import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: { type: "radio" },
      options: ["single", "multiple"],
      description:
        "Determines whether one or multiple items can be opened at the same time.",
    },
    collapsible: {
      control: "boolean",
      description:
        "When type is 'single', allows closing content by clicking trigger for an open item.",
      if: { arg: "type", eq: "single" }, // Only show if type is 'single'
    },
    defaultValue: {
      control: "text",
      description:
        "The value of the item to be initially open when type is 'single'.",
      if: { arg: "type", eq: "single" },
    },
    // defaultValue for type="multiple" would be string[] which is harder to control in Storybook args
    // value: { control: 'text', description: 'The controlled value of the open item(s).' },
    // onValueChange: { action: 'onValueChange', description: 'Event handler called when the open item(s) change.' },
    dir: {
      control: { type: "radio" },
      options: ["ltr", "rtl"],
      description: "The reading direction of the accordion.",
    },
    orientation: {
      control: { type: "radio" },
      options: ["vertical", "horizontal"],
      description: "The orientation of the accordion.",
    },
    className: {
      control: "text",
      description: "Optional CSS class names to apply to the accordion root.",
    },
    // It's also good to document props for sub-components if they are commonly customized
    // However, for argTypes at the main component level, focus on the Accordion props.
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic Accordion with single item expandable at a time.
 * Uses the `type="single"` prop to ensure only one section can be open at a time.
 * Uses default chevron icons that change based on state.
 */
export const Single: Story = {
  args: {
    type: "single",
    collapsible: true,
    className: "w-[400px]", // Ensure width is applied via args for clarity
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent>
          Learn the basics of our platform and how to get started with your
          first project.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Advanced Features</AccordionTrigger>
        <AccordionContent>
          Explore advanced features and techniques to enhance your workflow.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Best Practices</AccordionTrigger>
        <AccordionContent>
          Discover best practices and tips for optimal performance and user
          experience.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Multiple Accordion that allows multiple sections to be open simultaneously.
 * Uses the `type="multiple"` prop to enable multiple sections to be expanded.
 * Uses custom plus/minus icons for a different visual style.
 */
export const Multiple: Story = {
  args: {
    type: "multiple",
    className: "w-[400px]", // Ensure width is applied via args for clarity
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        {/* Note: The openIcon/closedIcon props are on AccordionTrigger, not Accordion itself.
            To make these configurable via Storybook args for this specific story,
            you might need a more complex render function or a wrapper component.
            For simplicity, they are hardcoded here as per the original story. */}
        <AccordionTrigger>Account Settings</AccordionTrigger>
        <AccordionContent>
          Manage your account preferences, security settings, and notification
          preferences.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Billing Information</AccordionTrigger>
        <AccordionContent>
          View and update your billing details, payment methods, and
          subscription plans.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>API Documentation</AccordionTrigger>
        <AccordionContent>
          Access comprehensive API documentation, examples, and integration
          guides.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Accordion with a default open item.
 * Uses the `defaultValue` prop to specify which item is open initially.
 */
export const WithDefaultValue: Story = {
  args: {
    type: "single",
    collapsible: true,
    defaultValue: "item-2",
    className: "w-[400px]",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Introduction</AccordionTrigger>
        <AccordionContent>
          This is the first section of the accordion.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Default Open Section</AccordionTrigger>
        <AccordionContent>
          This section is open by default because its value matches the
          `defaultValue` prop.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Another Section</AccordionTrigger>
        <AccordionContent>
          This is the third section of the accordion.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Custom Styled Accordion with additional styling and custom content.
 * Demonstrates how to customize the appearance and add rich content.
 * Uses custom chevron icons with different styling.
 */
export const CustomStyled: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <Accordion className="gencl:w-[500px] gencl:rounded-lg" {...args}>
      <AccordionItem
        value="item-1"
        className="gencl:border-b gencl:border-gray-200"
      >
        <AccordionTrigger
          className="gencl:text-lg gencl:font-semibold gencl:text-gray-800"
          openIcon={<ChevronUp className="gencl:text-gray-800" />}
          closedIcon={<ChevronDown className="gencl:text-gray-800" />}
        >
          Product Features
        </AccordionTrigger>
        <AccordionContent className="gencl:bg-gray-50">
          <div className="gencl:space-y-2">
            <h4 className="gencl:font-medium">Key Features:</h4>
            <ul className="gencl:list-disc gencl:list-inside gencl:text-gray-600">
              <li>Real-time collaboration</li>
              <li>Advanced analytics</li>
              <li>Custom integrations</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="item-2"
        className="gencl:border-b gencl:border-gray-200"
      >
        <AccordionTrigger
          className="gencl:text-lg gencl:font-semibold gencl:text-gray-800"
          openIcon={<ChevronUp className="gencl:text-gray-800" />}
          closedIcon={<ChevronDown className="gencl:text-gray-800" />}
        >
          Pricing Plans
        </AccordionTrigger>
        <AccordionContent className="gencl:bg-gray-50">
          <div className="gencl:space-y-2">
            <h4 className="gencl:font-medium">Available Plans:</h4>
            <ul className="gencl:list-disc gencl:list-inside gencl:text-gray-600">
              <li>Basic - $9/month</li>
              <li>Pro - $29/month</li>
              <li>Enterprise - Custom</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
