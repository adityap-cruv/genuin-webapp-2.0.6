import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Agent } from "@/types";

import { MockAgentsProvider } from "../../../.storybook/_story-helpers";

import AgentsDropdownSkeleton from "./skeleton";

import AgentsDropdown from "./index";

const meta: Meta<typeof AgentsDropdown> = {
  title: "GenAI/AgentsDropdown",
  component: AgentsDropdown,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof meta>;

const agents: Agent[] = [
  {
    id: "octo-head",
    type: "octo_head",
    name: "Octo Head",
    description: "Strategy",
    image: "https://picsum.photos/seed/octohead/64/64",
  },
  {
    id: "octo-leg",
    type: "octo_leg",
    name: "Octo Leg",
    description: "Tactical",
    image: "https://picsum.photos/seed/octoleg/64/64",
  },
];

export const MayaMode: Story = {
  render: () => (
    <MockAgentsProvider value={{ isMaya: true, currentAgent: "maya", agents: [] }}>
      <AgentsDropdown />
    </MockAgentsProvider>
  ),
};

export const InChat: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        isMaya: false,
        currentAgent: "octo-leg",
        enteredInChatMode: true,
        agents,
      }}>
      <AgentsDropdown />
    </MockAgentsProvider>
  ),
};

export const Skeleton: Story = {
  render: () => <AgentsDropdownSkeleton />,
};
