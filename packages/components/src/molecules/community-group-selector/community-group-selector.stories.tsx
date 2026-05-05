import type { Meta, StoryObj } from "@storybook/react";

import { CommunityGroupSelector } from "./community-group-selector";

const meta: Meta<typeof CommunityGroupSelector> = {
  title: "Molecules/Community Group Selector",
  component: CommunityGroupSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof CommunityGroupSelector>;

export const Default: Story = {
  render: () => (
    <div className="gencl:w-[80vw]">
      <CommunityGroupSelector onSelectChange={() => {}} />
    </div>
  ),
};
