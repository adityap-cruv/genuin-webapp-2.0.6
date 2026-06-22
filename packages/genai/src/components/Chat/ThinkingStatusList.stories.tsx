import type { Meta, StoryObj } from "@storybook/react-vite";

import ThinkingStatusList from "./ThinkingStatusList";

const meta: Meta<typeof ThinkingStatusList> = {
  title: "GenAI/Chat/ThinkingStatusList",
  component: ThinkingStatusList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Step-by-step status feed shown while the agent is reasoning — function " +
          "calls, tool invocations, intermediate metadata.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    steps: [
      { id: "1", type: "metadata", title: "Reading brand context" },
      {
        id: "2",
        type: "function_call",
        title: "Calling search_videos",
        detail: "query: short-form video commerce",
        functionName: "search_videos",
      },
      {
        id: "3",
        type: "function_response",
        title: "Got 12 candidate videos",
        detail: "Filtering by relevance score and recency",
      },
      { id: "4", type: "message", title: "Drafting response" },
    ],
  },
};

export const SingleStep: Story = {
  args: {
    steps: [{ id: "1", type: "metadata", title: "Bootstrapping session" }],
  },
};

export const Empty: Story = {
  args: { steps: [] },
};
