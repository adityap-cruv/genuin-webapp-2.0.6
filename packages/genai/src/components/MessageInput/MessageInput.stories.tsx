import type { Meta, StoryObj } from "@storybook/react-vite";

import { MockProviders } from "../../../.storybook/_story-helpers";

import MessageInput from "./index";

const meta: Meta<typeof MessageInput> = {
  title: "GenAI/MessageInput/Field",
  component: MessageInput,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The chat input. Holds the textarea, attachment button, preset " +
          "prompts, uploaded-files list, and the send/stop button.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Pin the input to the bottom of a tall frame so suggested prompts (which
// render above the textarea in real usage) have room to show without
// clipping.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      width: "100%",
      maxWidth: 720,
      minHeight: "90vh",
      margin: "0 auto",
      padding: 16,
      background: "#f7f7f8",
    }}>
    {children}
  </div>
);

export const Empty: Story = {
  render: () => (
    <MockProviders>
      <Frame>
        <MessageInput />
      </Frame>
    </MockProviders>
  ),
};

export const WithDraftText: Story = {
  render: () => (
    <MockProviders inputValue="Tell me about Genuin's video stack">
      <Frame>
        <MessageInput />
      </Frame>
    </MockProviders>
  ),
};

export const WithSuggestedPrompts: Story = {
  render: () => (
    <MockProviders
      agents={{
        suggestedPrompts: [
          "Summarize this product page",
          "Generate three taglines",
          "Draft a social post",
        ],
      }}>
      <Frame>
        <MessageInput />
      </Frame>
    </MockProviders>
  ),
};
