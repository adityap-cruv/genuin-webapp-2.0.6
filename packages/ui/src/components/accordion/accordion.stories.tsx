import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";

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
  },
  render: (args) => (
    <Accordion className="gencl:w-[400px]" {...args}>
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
  },
  render: (args) => (
    <Accordion className="gencl:w-[400px]" {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger openIcon={<Minus />} closedIcon={<Plus />}>
          Account Settings
        </AccordionTrigger>
        <AccordionContent>
          Manage your account preferences, security settings, and notification
          preferences.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger openIcon={<Minus />} closedIcon={<Plus />}>
          Billing Information
        </AccordionTrigger>
        <AccordionContent>
          View and update your billing details, payment methods, and
          subscription plans.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger openIcon={<Minus />} closedIcon={<Plus />}>
          API Documentation
        </AccordionTrigger>
        <AccordionContent>
          Access comprehensive API documentation, examples, and integration
          guides.
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
