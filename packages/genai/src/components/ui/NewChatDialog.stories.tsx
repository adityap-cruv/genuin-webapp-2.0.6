import type { Meta, StoryObj } from "@storybook/react-vite";

import { NewChatDialog } from "./new-chat-dialog";

const meta: Meta<typeof NewChatDialog> = {
  title: "GenAI/UI/NewChatDialog",
  component: NewChatDialog,
  // `centered` breaks `position: fixed` on the dialog overlay — see the
  // matching note in Dialog.stories.tsx.
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NoActiveSession: Story = {
  args: {
    currentSessionId: null,
    onNewChat: () => console.log("[story] onNewChat"),
  },
};

export const WithActiveSession: Story = {
  args: {
    currentSessionId: "session-abc-123",
    onNewChat: () => console.log("[story] onNewChat"),
  },
};
