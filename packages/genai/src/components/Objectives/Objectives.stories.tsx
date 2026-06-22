import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Agent } from "@/types";

import { MockAgentsProvider, MockInputProvider } from "../../../.storybook/_story-helpers";

import Objectives from "./index";

const meta: Meta<typeof Objectives> = {
  title: "GenAI/Objectives",
  component: Objectives,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof meta>;

const agent: Agent = {
  id: "brand-voice",
  type: "octo_leg",
  name: "Brand voice",
  description: "Drafts copy that matches your tone and audience.",
  image: "https://picsum.photos/seed/brandvoice/96/96",
  presets: [
    { prompt: "Write a 3-line product blurb", objective: "Product blurb" },
    { prompt: "Draft a launch tweet", objective: "Social post" },
    { prompt: "Generate three taglines", objective: "Tagline ideas" },
    { prompt: "Summarize this product page", objective: "Page summary" },
  ],
};

export const Default: Story = {
  render: () => (
    <MockAgentsProvider
      value={{
        agents: [agent],
        currentAgent: agent.id,
        showAllObjectives: true,
        enteredInChatMode: false,
      }}>
      <MockInputProvider>
        <div style={{ padding: 32, background: "#fff", maxWidth: 920, margin: "0 auto" }}>
          <Objectives />
        </div>
      </MockInputProvider>
    </MockAgentsProvider>
  ),
};
