import type { Meta, StoryObj } from "@storybook/react-vite";

import { MockProviders, mockSession } from "../../../.storybook/_story-helpers";

import MessageInput from "./index";

/**
 * Story 5 — the send / stop / cancel button.
 *
 * `MessageInput` swaps the trailing button between three visual states
 * driven by `creatingSession` and the current session's `thinking` flag.
 * This story toggles those flags so the button appears in each state.
 *
 * Idle      → arrow-up send button (disabled until input has text)
 * Sending   → spinner while creatingSession is true
 * Stoppable → red stop square while a session is mid-stream
 */
const meta: Meta<typeof MessageInput> = {
  title: "GenAI/MessageInput/SendButton",
  component: MessageInput,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Three visual states of the send action: idle, sending (spinner), " +
          "and streaming (stop button).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

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

export const Idle: Story = {
  render: () => (
    <MockProviders inputValue="Ready to send">
      <Frame>
        <MessageInput />
      </Frame>
    </MockProviders>
  ),
};

export const Sending: Story = {
  render: () => (
    <MockProviders
      inputValue=""
      agents={{
        creatingSession: true,
      }}>
      <Frame>
        <MessageInput />
      </Frame>
    </MockProviders>
  ),
};

export const StreamingResponse: Story = {
  render: () => (
    <MockProviders
      inputValue=""
      agents={{
        currentSessionId: "s-streaming",
        sessions: [mockSession({ id: "s-streaming", thinking: true })],
      }}>
      <Frame>
        <MessageInput />
      </Frame>
    </MockProviders>
  ),
};
