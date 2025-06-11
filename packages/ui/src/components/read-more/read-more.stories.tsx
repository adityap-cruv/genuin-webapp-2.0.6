import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { ReadMore } from "./read-more";

const meta: Meta<typeof ReadMore> = {
  title: "Components/ReadMore",
  component: ReadMore,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["overlay", "outside"],
      description: "The position of the text relative to its container",
    },
    showExpandText: {
      control: "boolean",
      description: 'Whether to show the "View more/less" button',
    },
    shouldAnimate: {
      control: "boolean",
      description: "Whether to animate the expansion/collapse",
    },
    maxLines: {
      control: { type: "number", min: 1, max: 10 },
      description: "Maximum number of lines to show before truncation",
    },
    maxChars: {
      control: { type: "number", min: 10, max: 500 },
      description: "Maximum number of characters to show before truncation",
    },
    maxWidth: {
      control: "text",
      description: "Maximum width of the component container",
    },
    viewMoreText: {
      control: "text",
      description: 'Custom text for the "View more" button',
    },
    viewLessText: {
      control: "text",
      description: 'Custom text for the "View less" button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReadMore>;

const longText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet dictum, massa erat ultricies enim, nec dictum ex enim eu sem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl. Proin euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.";

// Basic usage with line truncation
export const Basic: Story = {
  args: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    maxLines: 5,
    maxWidth: "400px",
  },
};

// Character-based truncation
export const CharacterBased: Story = {
  args: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    maxChars: 100,
    maxWidth: "700px",
  },
};

// Overlay position
export const OverlayPosition: Story = {
  args: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    maxLines: 2,
    position: "overlay",
    className : "gencl:bg-black"
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

// Long text with multiple paragraphs
export const MultipleParagraphs: Story = {
  args: {
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    maxLines: 3,
    maxWidth: "400px",
  },
};

// With external state control
export const WithExternalState: Story = {
  render: (args) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    return (
      <ReadMore
        {...args}
        defaultExpand={isExpanded}
        onExpandChange={setIsExpanded}
      />
    );
  },
  args: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    maxLines: 2,
    maxWidth: "400px",
  },
};

// Dynamic collapsed state
export const DynamicCollapsed: Story = {
  args: {
    text: longText,
    maxLines: 2,
    showExpandText: true,
    position: "outside",
    maxWidth: "400px",
  },
};

// Dynamic expanded state
export const DynamicExpandedWithAnimation: Story = {
  args: {
    text: longText,
    maxLines: 2,
    showExpandText: false,
    position: "outside",
    maxWidth: "400px",
    shouldAnimate: true,
  },
  render: (args) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    return (
      <ReadMore
        {...args}
        open={isExpanded}
        onExpandChange={setIsExpanded}
        shouldAnimate={true}
      />
    );
  },
};

// Dynamic with mentions
export const DynamicWithMentions: Story = {
  args: {
    text: [
      "Hello ",
      { member_id: "1", text: "@john" },
      ", welcome to ",
      { slug: "react", text: "#react" },
      ". Visit ",
      { url: "example.com", text: "our site" },
      ".",
    ],
    maxLines: 2,
    showExpandText: false,
    position: "outside",
    maxWidth: "400px",
  },
};

// Width comparison stories
export const WidthComparison: Story = {
  render: () => (
    <div className="gencl:space-y-4">
      <h1 className="gencl:font-bold">First</h1>
      <ReadMore
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        maxLines={2}
        maxWidth="200px"
      />
      <h1 className="gencl:font-bold">Second</h1>
      <ReadMore
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        maxLines={2}
        maxWidth="500px"
      />
      <h1 className="gencl:font-bold">Third</h1>
      <ReadMore
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        maxLines={2}
        maxWidth="1000px"
      />
    </div>
  ),
};
