import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "GenAI/UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {
  args: { className: "gai:h-5 gai:w-64" },
};

export const Avatar: Story = {
  args: { className: "gai:h-12 gai:w-12 gai:rounded-full" },
};

export const Card: Story = {
  render: () => (
    <div className="gai:flex gai:flex-col gai:gap-3" style={{ width: 320 }}>
      <div className="gai:flex gai:items-center gai:gap-3">
        <Skeleton className="gai:h-12 gai:w-12 gai:rounded-full" />
        <div className="gai:flex gai:flex-1 gai:flex-col gai:gap-2">
          <Skeleton className="gai:h-4 gai:w-2/3" />
          <Skeleton className="gai:h-3 gai:w-1/3" />
        </div>
      </div>
      <Skeleton className="gai:h-4 gai:w-full" />
      <Skeleton className="gai:h-4 gai:w-5/6" />
      <Skeleton className="gai:h-4 gai:w-3/4" />
    </div>
  ),
};
