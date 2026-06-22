import type { Meta, StoryObj } from "@storybook/react-vite";

import ThinkingIndicator from "./ThinkingIndicator";

const meta: Meta<typeof ThinkingIndicator> = {
  title: "GenAI/Chat/ThinkingIndicator",
  component: ThinkingIndicator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Shimmer skeleton displayed while the agent's response is streaming. " +
          "No props — purely presentational.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 480, padding: 16 }}>
      <ThinkingIndicator />
    </div>
  ),
};
