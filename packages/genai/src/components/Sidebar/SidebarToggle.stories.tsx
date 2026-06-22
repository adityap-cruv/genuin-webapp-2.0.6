import type { Meta, StoryObj } from "@storybook/react-vite";

import { MockAgentsProvider } from "../../../.storybook/_story-helpers";

import Sidebar from "./index";

/**
 * Story 3 — toggle that opens the side panel.
 *
 * `Sidebar` uses early-return: when `isSidebarCollapsed === true` it renders
 * only a small icon-button. This story exercises that branch.
 */
const meta: Meta<typeof Sidebar> = {
  title: "GenAI/Sidebar/Toggle",
  component: Sidebar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Collapsed-state of `Sidebar` — only the expand toggle is visible. " +
          "Click to open the full panel (action is a no-op in stories).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  render: () => (
    <MockAgentsProvider value={{ isSidebarCollapsed: true }}>
      <Sidebar />
    </MockAgentsProvider>
  ),
};
