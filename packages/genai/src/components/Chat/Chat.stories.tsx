import type { Meta, StoryObj } from "@storybook/react-vite";

import { MockAgentsProvider, mockChatEvent, mockSession } from "../../../.storybook/_story-helpers";

import Chat from "./index";

const meta: Meta<typeof Chat> = {
  title: "GenAI/Chat/MessageList",
  component: Chat,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Scrollable list of user/agent messages for the active session. " +
          "Wraps each message in a `MessageItem` (markdown, feedback buttons, " +
          "carousel embeds, koah ad widgets).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const conversation = [
  mockChatEvent({
    id: "u1",
    role: "user",
    message: { content: "What is Genuin?" },
  }),
  mockChatEvent({
    id: "a1",
    role: "agent",
    parent_id: "u1",
    message: {
      content:
        "Genuin is a platform for short-form video commerce — brands embed " +
        "shoppable shorts on their own sites and capture first-party engagement.",
    },
  }),
  mockChatEvent({
    id: "u2",
    role: "user",
    parent_id: "a1",
    message: { content: "Can you write a 3-line product blurb?" },
  }),
  mockChatEvent({
    id: "a2",
    role: "agent",
    parent_id: "u2",
    message: {
      content:
        "Sure — here's a draft:\n\n" +
        "- Line 1: Catch eyes in 5 seconds.\n" +
        "- Line 2: Convert in 30.\n" +
        "- Line 3: Re-engage forever.",
    },
  }),
];

export const Conversation: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        currentSessionId: "s1",
        enteredInChatMode: true,
        sessions: [
          mockSession({
            id: "s1",
            chat: conversation,
          }),
        ],
      }}>
      <div style={{ height: "100vh", width: 720, margin: "0 auto", padding: 16 }}>
        <Chat />
      </div>
    </MockAgentsProvider>
  ),
};

export const SingleUserMessage: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        currentSessionId: "s1",
        enteredInChatMode: true,
        sessions: [
          mockSession({
            id: "s1",
            chat: [
              mockChatEvent({
                id: "u1",
                role: "user",
                message: { content: "Hello" },
              }),
            ],
          }),
        ],
      }}>
      <div style={{ height: "100vh", width: 720, margin: "0 auto", padding: 16 }}>
        <Chat />
      </div>
    </MockAgentsProvider>
  ),
};
