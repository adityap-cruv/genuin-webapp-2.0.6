import type { Meta, StoryObj } from "@storybook/react";
import { FeedSkeleton } from "./feed-skeleton";

/**
 * FeedSkeleton provides a loading state visualization for the feed layout,
 * showing placeholder content while the actual feed data is being loaded.
 */
const meta: Meta<typeof FeedSkeleton> = {
  title: "Templates/FeedSkeleton",
  component: FeedSkeleton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "A skeleton loader component that represents the loading state of the feed view, including video player, comments, and interaction buttons.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:min-h-screen gencl:w-full gencl:bg-secondary-50 gencl:p-4">
        <div className="gencl:mx-auto gencl:max-w-7xl">
          <Story />
        </div>
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FeedSkeleton>;

/**
 * Default view of the feed skeleton showing all placeholder elements
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Shows the complete feed skeleton layout including:
- Video player placeholder
- Interaction buttons skeleton
- Comments section loading state
- Input field placeholder
- Proper spacing and layout matching the actual feed view
        `,
      },
    },
  },
};

/**
 * Mobile responsive view of the feed skeleton
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: "Mobile-optimized layout of the feed skeleton with proper responsive adjustments.",
      },
    },
  },
};