import type { Meta, StoryObj } from "@storybook/react";
import { HorizontalScrollContainer } from "./horizontal-scroll-container";

const meta: Meta<typeof HorizontalScrollContainer> = {
  title: "Molecules/HorizontalScrollContainer",
  component: HorizontalScrollContainer,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    gap: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Gap between scroll items",
    },
    scrollAmount: {
      control: "number",
      description: "Amount to scroll on button click",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock content for examples
const mockItems = Array.from({ length: 15 }, (_, i) => (
  <div
    key={i}
    className="gencl:flex-shrink-0 gencl:w-40 gencl:h-24 gencl:bg-gradient-to-br gencl:from-primary-100 gencl:to-primary-200 gencl:rounded-lg gencl:flex gencl:items-center gencl:justify-center gencl:text-primary-700 gencl:font-medium"
  >
    Item {i + 1}
  </div>
));

const mockCards = Array.from({ length: 8 }, (_, i) => (
  <div
    key={i}
    className="gencl:flex-shrink-0 gencl:w-72 gencl:h-40 gencl:bg-white gencl:border gencl:border-secondary-200 gencl:rounded-lg gencl:p-4 gencl:shadow-sm"
  >
    <div className="gencl:h-full gencl:flex gencl:flex-col gencl:justify-between">
      <div>
        <h3 className="gencl:font-semibold gencl:text-black">Card {i + 1}</h3>
        <p className="gencl:text-sm gencl:text-secondary-600 gencl:mt-1">
          This is a sample card with some content to demonstrate the horizontal
          scroll container.
        </p>
      </div>
      <div className="gencl:text-xs gencl:text-secondary-500">
        Sample footer
      </div>
    </div>
  </div>
));

export const Default: Story = {
  args: {
    gap: "md",
    scrollAmount: 300,
  },
  render: (args) => (
    <div className="gencl:w-full gencl:max-w-4xl">
      <HorizontalScrollContainer {...args}>
        {mockItems}
      </HorizontalScrollContainer>
    </div>
  ),
};

export const SmallGap: Story = {
  args: {
    gap: "sm",
    scrollAmount: 200,
  },
  render: (args) => (
    <div className="gencl:w-full gencl:max-w-4xl">
      <HorizontalScrollContainer {...args}>
        {mockItems}
      </HorizontalScrollContainer>
    </div>
  ),
};

export const LargeGap: Story = {
  args: {
    gap: "lg",
    scrollAmount: 400,
  },
  render: (args) => (
    <div className="gencl:w-full gencl:max-w-4xl">
      <HorizontalScrollContainer {...args}>
        {mockCards}
      </HorizontalScrollContainer>
    </div>
  ),
};

export const FewItems: Story = {
  args: {
    gap: "md",
    scrollAmount: 300,
  },
  render: (args) => (
    <div className="gencl:w-full gencl:max-w-4xl">
      <HorizontalScrollContainer {...args}>
        {mockItems.slice(0, 3)}
      </HorizontalScrollContainer>
    </div>
  ),
};

export const ManyItems: Story = {
  args: {
    gap: "md",
    scrollAmount: 300,
  },
  render: (args) => (
    <div className="gencl:w-full gencl:max-w-4xl">
      <HorizontalScrollContainer {...args}>
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className="gencl:flex-shrink-0 gencl:w-32 gencl:h-20 gencl:bg-gradient-to-br gencl:from-secondary-100 gencl:to-secondary-200 gencl:rounded-lg gencl:flex gencl:items-center gencl:justify-center gencl:text-secondary-700 gencl:font-medium gencl:text-sm"
          >
            #{i + 1}
          </div>
        ))}
      </HorizontalScrollContainer>
    </div>
  ),
};
