import type { Meta, StoryObj } from "@storybook/react-vite";

import { MockAgentsProvider, mockSession } from "../../../.storybook/_story-helpers";

import Sidebar from "./index";

const meta: Meta<typeof Sidebar> = {
  title: "GenAI/Sidebar/Panel",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Left-side chat list. Renders today/yesterday/older session groups, " +
          "the new-chat button, and a collapse toggle. Pulls everything from " +
          "`useAgentsContext`.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

export const WithSessions: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        isSidebarCollapsed: false,
        enteredInChatMode: true,
        sessionsFetched: true,
        sessions: [
          mockSession({
            id: "s1",
            name: "How do I configure CSP for video?",
            updatedAt: today.toISOString(),
          }),
          mockSession({
            id: "s2",
            name: "Generate a product description",
            updatedAt: today.toISOString(),
          }),
          mockSession({
            id: "s3",
            name: "Yesterday's draft",
            updatedAt: yesterday.toISOString(),
          }),
          mockSession({
            id: "s4",
            name: "Older session from last week",
            updatedAt: lastWeek.toISOString(),
          }),
        ],
      }}>
      <div style={{ height: "100vh", width: 280, borderRight: "1px solid #eee" }}>
        <Sidebar />
      </div>
    </MockAgentsProvider>
  ),
};

export const Empty: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        isSidebarCollapsed: false,
        sessionsFetched: true,
        sessions: [],
      }}>
      <div style={{ height: "100vh", width: 280, borderRight: "1px solid #eee" }}>
        <Sidebar />
      </div>
    </MockAgentsProvider>
  ),
};

export const Loading: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        isSidebarCollapsed: false,
        sessionsFetched: false,
        sessions: [],
      }}>
      <div style={{ height: "100vh", width: 280, borderRight: "1px solid #eee" }}>
        <Sidebar />
      </div>
    </MockAgentsProvider>
  ),
};
