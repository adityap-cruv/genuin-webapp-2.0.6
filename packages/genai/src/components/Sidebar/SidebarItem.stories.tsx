import type { Meta, StoryObj } from "@storybook/react-vite";

import { MockAgentsProvider, mockSession } from "../../../.storybook/_story-helpers";

import Item from "./SidebarItem";

const meta: Meta<typeof Item> = {
  title: "GenAI/Sidebar/SidebarItem",
  component: Item,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 280, padding: 8, background: "#fff", borderRadius: 8 }}>{children}</div>
);

export const Default: Story = {
  render: () => {
    const session = mockSession({ id: "s1", name: "How do I configure CSP?" });
    return (
      <MockAgentsProvider value={{ currentSessionId: null, sessions: [session] }}>
        <Frame>
          <Item session={session} />
        </Frame>
      </MockAgentsProvider>
    );
  },
};

export const Active: Story = {
  render: () => {
    const session = mockSession({ id: "s1", name: "Active session" });
    return (
      <MockAgentsProvider value={{ currentSessionId: "s1", sessions: [session] }}>
        <Frame>
          <Item session={session} />
        </Frame>
      </MockAgentsProvider>
    );
  },
};

export const LongName: Story = {
  render: () => {
    const session = mockSession({
      id: "s1",
      name: "A very long session name that should ellipsize gracefully when it overflows the available width",
    });
    return (
      <MockAgentsProvider value={{ currentSessionId: "s1", sessions: [session] }}>
        <Frame>
          <Item session={session} />
        </Frame>
      </MockAgentsProvider>
    );
  },
};
