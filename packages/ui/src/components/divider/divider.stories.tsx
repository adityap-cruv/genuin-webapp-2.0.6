import type { Meta, StoryObj } from "@storybook/react-vite";

import { Divider } from "./divider";

const meta: Meta<typeof Divider> = {
  title: "Static Page Atoms/Divider",
  component: Divider,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    tone: {
      control: "select",
      options: ["subtle", "default", "strong"],
    },
    inset: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    asChild: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
    tone: "default",
    inset: "none",
  },
  render: (args) => (
    <div className="gencl:w-[480px]">
      <Divider {...args} />
    </div>
  ),
};

export const AllTones: Story = {
  render: () => (
    <div className="gencl:w-[480px] gencl:flex gencl:flex-col gencl:gap-8">
      {(["subtle", "default", "strong"] as const).map((tone) => (
        <div key={tone} className="gencl:flex gencl:flex-col gencl:gap-2">
          <span className="gencl:text-[10px] gencl:uppercase gencl:tracking-wider gencl:opacity-50">{tone}</span>
          <Divider tone={tone} />
        </div>
      ))}
    </div>
  ),
};

export const AllInsets: Story = {
  render: () => (
    <div className="gencl:w-[480px] gencl:flex gencl:flex-col gencl:gap-8 gencl:bg-secondary-50 gencl:p-4">
      {(["none", "sm", "md", "lg"] as const).map((inset) => (
        <div key={inset} className="gencl:flex gencl:flex-col gencl:gap-2">
          <span className="gencl:text-[10px] gencl:uppercase gencl:tracking-wider gencl:opacity-50">
            inset = {inset}
          </span>
          <Divider inset={inset} tone="strong" />
        </div>
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="gencl:flex gencl:items-center gencl:gap-4 gencl:h-12">
      <span>Item A</span>
      <Divider orientation="vertical" />
      <span>Item B</span>
      <Divider orientation="vertical" tone="strong" />
      <span>Item C</span>
    </div>
  ),
};

export const AsHr: Story = {
  render: () => (
    <div className="gencl:w-[480px]">
      <Divider asChild>
        <hr />
      </Divider>
    </div>
  ),
};

export const InComposition: Story = {
  render: () => (
    <div className="gencl:w-[480px] gencl:flex gencl:flex-col gencl:gap-4">
      <h3 className="gencl:text-[24px] gencl:leading-[28px] gencl:font-semibold">Section A</h3>
      <p>Some body content that lives above a divider.</p>
      <Divider />
      <h3 className="gencl:text-[24px] gencl:leading-[28px] gencl:font-semibold">Section B</h3>
      <p>Another paragraph, separated by the default-tone divider.</p>
    </div>
  ),
};
