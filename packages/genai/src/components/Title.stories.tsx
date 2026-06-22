import type { Meta, StoryObj } from "@storybook/react-vite";

import Title from "./Title";

const meta: Meta<typeof Title> = {
  title: "GenAI/Title",
  component: Title,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Headline shown above the agent picker on the dialog/page entry screen.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 760, padding: 32 }}>
      <Title />
    </div>
  ),
};
