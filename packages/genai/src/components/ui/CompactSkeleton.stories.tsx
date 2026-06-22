import type { Meta, StoryObj } from "@storybook/react-vite";

import { CompactSkeleton } from "./compact-skeleton";

const meta: Meta<typeof CompactSkeleton> = {
  title: "GenAI/UI/CompactSkeleton",
  component: CompactSkeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pill-shaped placeholder used inside web-sdk compact mode where the " +
          "background may be a video/image, hence the white-on-translucent shimmer.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { width: 220 },
  render: (args) => (
    <div
      style={{
        background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
        padding: 24,
        borderRadius: 12,
        width: 320,
      }}>
      <CompactSkeleton {...args} />
    </div>
  ),
};

export const Stack: Story = {
  render: () => (
    <div
      style={{
        background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
        padding: 24,
        borderRadius: 12,
        width: 320,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
      <CompactSkeleton width="60%" />
      <CompactSkeleton width="80%" />
      <CompactSkeleton width="40%" />
    </div>
  ),
};
