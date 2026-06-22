import type { Meta, StoryObj } from "@storybook/react-vite";

import { SplitView } from "./split-view";

const meta: Meta<typeof SplitView> = {
  title: "Layout/SplitView",
  component: SplitView,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    gap: {
      control: "select",
      options: ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
    },
    asChild: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof SplitView>;

const Pane = ({ children }: { children: React.ReactNode }) => (
  <div className="gencl:bg-secondary-100 gencl:p-4">{children}</div>
);

export const Websitev5Ratio: Story = {
  name: "Websitev5 ratio (746/320)",
  args: {
    tracks: [746, 320],
    gap: "lg",
  },
  render: (args) => (
    <SplitView {...args}>
      <Pane>Video player (746 px)</Pane>
      <Pane>Linkout stack (320 px)</Pane>
    </SplitView>
  ),
};

export const TwoEqualColumns: Story = {
  args: {
    tracks: 2,
    gap: "md",
  },
  render: (args) => (
    <SplitView {...args}>
      <Pane>1fr</Pane>
      <Pane>1fr</Pane>
    </SplitView>
  ),
};

export const ThreeEqualColumns: Story = {
  args: {
    tracks: 3,
    gap: "md",
  },
  render: (args) => (
    <SplitView {...args}>
      <Pane>1fr</Pane>
      <Pane>1fr</Pane>
      <Pane>1fr</Pane>
    </SplitView>
  ),
};

export const StringRatio: Story = {
  args: {
    tracks: "2fr 1fr",
    gap: "md",
  },
  render: (args) => (
    <SplitView {...args}>
      <Pane>2fr</Pane>
      <Pane>1fr</Pane>
    </SplitView>
  ),
};

export const AsSection: Story = {
  args: {
    asChild: true,
    tracks: [200, 400],
    gap: "md",
  },
  render: (args) => (
    <SplitView {...args}>
      <section>
        <Pane>Inside a {"<section>"}</Pane>
        <Pane>via asChild</Pane>
      </section>
    </SplitView>
  ),
};
