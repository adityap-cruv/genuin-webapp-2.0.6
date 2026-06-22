import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Agent } from "@/types";

import { MockAgentsProvider } from "../../../.storybook/_story-helpers";

import AgentsSectionSkeleton from "./skeleton";

import AgentsSection from "./index";

const meta: Meta<typeof AgentsSection> = {
  title: "GenAI/AgentsSection/Section",
  component: AgentsSection,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof meta>;

const agents: Agent[] = [
  {
    id: "agent-1",
    type: "octo_leg",
    name: "Brand voice",
    description: "Drafts copy that matches your tone and audience.",
    image: "https://picsum.photos/seed/brandvoice/96/96",
  },
  {
    id: "agent-2",
    type: "octo_leg",
    name: "Product analyst",
    description: "Pulls insights from your catalog and engagement data.",
    image: "https://picsum.photos/seed/analyst/96/96",
  },
  {
    id: "agent-3",
    type: "octo_leg",
    name: "Video maker",
    description: "Generates short-form content from a prompt.",
    image: "https://picsum.photos/seed/videomaker/96/96",
  },
  {
    id: "agent-4",
    type: "octo_leg",
    name: "Social planner",
    description: "Schedules and adapts posts across channels.",
    image: "https://picsum.photos/seed/social/96/96",
  },
];

export const WithAgents: Story = {
  render: () => (
    <MockAgentsProvider value={{ agents, isMaya: false }}>
      <div style={{ padding: 24, background: "#fff" }}>
        <AgentsSection />
      </div>
    </MockAgentsProvider>
  ),
};

export const Skeleton: Story = {
  render: () => (
    <MockAgentsProvider value={{ agents: [], isMaya: false }}>
      <div style={{ padding: 24, background: "#fff", display: "flex", gap: 16 }}>
        <AgentsSectionSkeleton />
      </div>
    </MockAgentsProvider>
  ),
};
