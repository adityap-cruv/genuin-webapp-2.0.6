import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { EditUserMessage } from "./EditUserMessage";

const meta: Meta<typeof EditUserMessage> = {
  title: "GenAI/Chat/EditUserMessage",
  component: EditUserMessage,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Inline editor that appears when the user clicks 'Edit' on their own message. " +
          "Submitting re-runs the conversation from that point.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Editing: Story = {
  render: () => {
    function Wrapper() {
      const [value, setValue] = useState("Tell me about Genuin's video stack");
      return (
        <div style={{ width: 560 }}>
          <EditUserMessage
            value={value}
            onChange={setValue}
            onCancel={() => console.log("[story] cancel")}
            onSubmit={() => console.log("[story] submit", value)}
          />
        </div>
      );
    }
    return <Wrapper />;
  },
};
