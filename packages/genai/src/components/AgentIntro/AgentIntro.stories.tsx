import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Agent } from "@/types";

import { MockAgentsProvider, MockInputProvider } from "../../../.storybook/_story-helpers";

import AgentIntro from "./index";

const meta: Meta<typeof AgentIntro> = {
  title: "GenAI/AgentIntro",
  component: AgentIntro,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof meta>;

const agent: Agent = {
  id: "brand-voice",
  type: "octo_leg",
  name: "Brand voice",
  description:
    "Drafts copy that matches your tone, audience, and category. Powered by your brand guidelines and recent posts.",
  image: "https://picsum.photos/seed/brandvoice/96/96",
  question: "What would you like to write today?",
  presets: [
    { prompt: "Write a 3-line product blurb", objective: "Generate a tagline" },
    { prompt: "Draft a launch tweet" },
  ],
};

export const Default: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        agents: [agent],
        currentAgent: agent.id,
        enteredInChatMode: false,
        showAllObjectives: true,
      }}>
      <MockInputProvider>
        <div style={{ padding: 32, background: "#fff" }}>
          <AgentIntro />
        </div>
      </MockInputProvider>
    </MockAgentsProvider>
  ),
};
