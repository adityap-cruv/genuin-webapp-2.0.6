import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { ReadMore } from "./read-more";

const meta: Meta<typeof ReadMore> = {
  title: "Molecules/ReadMore",
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
    display: {
      control: "radio",
      options: ["block", "inline"],
      description: "Display mode for the component",
    },
    expandable: {
      control: "boolean",
      description: "Allow users to expand/collapse the text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReadMore>;

// Sample data
const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const videoDescription = `October 2024 • 5:32 This episode explores the fascinating world of marine biology, diving deep into coral reef ecosystems and the incredible biodiversity they support. Learn about conservation efforts and the impact of climate change on these underwater paradises.`;

const productReview = `I've been using this product for 3 months now and I'm absolutely thrilled! The build quality is exceptional, and it has exceeded all my expectations. The customer service team was incredibly helpful when I had questions. Highly recommend to anyone looking for a reliable solution.`;

const newsArticle = `Breaking: Scientists at the University of Cambridge have discovered a groundbreaking method for carbon capture that could revolutionize climate change mitigation efforts. The new technique, which uses advanced nanotechnology, is 50% more efficient than existing methods and significantly more cost-effective. Researchers believe this could be deployed at scale within the next five years.`;

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
    className: "gencl:bg-black",
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

/**
 * Non-Expandable Text
 *
 * Displays a static, truncated preview without any inline expansion.
 * Ideal for showing short previews or locked summaries.
 */
export const NotExpandable: Story = {
  args: {
    text: longText,
    maxLines: 2,
    expandable: false,
    shouldAnimate: true,
    maxWidth: "500px",
  },
  render: (args) => (
    <div className="gencl:p-6 gencl:bg-white gencl:rounded-lg gencl:shadow-sm gencl:border gencl:border-gray-200">
      <h3 className="gencl:text-lg gencl:font-semibold gencl:mb-3 gencl:text-gray-900">
        Article Preview (Non-Expandable)
      </h3>
      <ReadMore {...args} />
      <p className="gencl:mt-4 gencl:text-sm gencl:text-gray-500 gencl:italic">
        Note: This text is truncated and cannot be expanded inline.
      </p>
    </div>
  ),
};

/**
 * Inline Display (Non-Expandable)
 *
 * Shows truncated inline text while preserving paragraph flow.
 * Use when the text should appear inline but not be expandable.
 */
export const InlineWithoutExpansion: Story = {
  args: {
    text: productReview,
    maxChars: 100,
    display: "inline",
    expandable: false,
    shouldAnimate: true,
  },
  render: (args) => (
    <div className="gencl:p-6 gencl:bg-gradient-to-br gencl:from-blue-50 gencl:to-indigo-50 gencl:rounded-lg gencl:max-w-2xl">
      <div className="gencl:flex gencl:items-start gencl:gap-4">
        {/* Avatar */}
        <div className="gencl:w-12 gencl:h-12 gencl:bg-indigo-600 gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:text-white gencl:font-bold">
          JD
        </div>

        {/* Content */}
        <div className="gencl:flex-1">
          <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:mb-2">
            <h4 className="gencl:font-semibold gencl:text-gray-900">
              John Doe
            </h4>
            <span className="gencl:text-yellow-500">★★★★★</span>
          </div>

          <p className="gencl:text-gray-700 gencl:leading-relaxed">
            <ReadMore {...args} />
          </p>

          <button className="gencl:mt-3 gencl:text-sm gencl:text-indigo-600 gencl:font-medium hover:gencl:underline">
            Read full review →
          </button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Inline Display (Expandable)
 *
 * Displays inline text that can expand and collapse smoothly.
 * Useful for compact paragraphs or article previews.
 */
export const InlineWithExpansion: Story = {
  args: {
    text: newsArticle,
    maxChars: 120,
    viewMoreText: "more",
    viewLessText: "less",
    expandable: true,
    shouldAnimate: true,
  },
  render: (args) => (
    <div className="gencl:p-6 gencl:bg-white gencl:rounded-lg gencl:shadow-md gencl:max-w-2xl gencl:border-l-4 gencl:border-red-500">
      <p className="gencl:text-gray-700 gencl:leading-relaxed">
        <ReadMore {...args} text={`Climate Change Breakthrough ${args.text}`} />
      </p>
    </div>
  ),
};
