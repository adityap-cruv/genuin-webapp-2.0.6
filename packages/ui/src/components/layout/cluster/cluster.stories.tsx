import type { Meta, StoryObj } from "@storybook/react-vite";

import { Cluster } from "./cluster";

const meta: Meta<typeof Cluster> = {
  title: "Layout/Cluster",
  component: Cluster,
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
      options: ["start", "center", "end", "baseline"],
    },
    asChild: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Cluster>;

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="gencl:bg-primary-100 gencl:text-primary gencl:px-2 gencl:py-0.5 gencl:rounded-full gencl:text-body-2-semi-bold">
    {children}
  </span>
);

export const Default: Story = {
  args: {
    gap: "xs",
  },
  render: (args) => (
    <Cluster {...args}>
      <Tag>react</Tag>
      <Tag>typescript</Tag>
      <Tag>tailwind</Tag>
      <Tag>vite</Tag>
    </Cluster>
  ),
};

export const ManyChips: Story = {
  args: {
    gap: "xs",
  },
  render: (args) => (
    <Cluster {...args} className="gencl:max-w-[260px]">
      {Array.from({ length: 12 }).map((_, i) => (
        <Tag key={i}>tag {i + 1}</Tag>
      ))}
    </Cluster>
  ),
};

export const AlignBaseline: Story = {
  args: {
    gap: "sm",
    align: "baseline",
  },
  render: (args) => (
    <Cluster {...args}>
      <span className="gencl:text-2xl gencl:font-bold">Title</span>
      <span className="gencl:text-sm gencl:text-secondary">subtitle</span>
      <Tag>v2</Tag>
    </Cluster>
  ),
};

export const AsList: Story = {
  args: {
    asChild: true,
    gap: "xs",
  },
  render: (args) => (
    <Cluster {...args}>
      <ul>
        <li>
          <Tag>chip</Tag>
        </li>
        <li>
          <Tag>list</Tag>
        </li>
      </ul>
    </Cluster>
  ),
};
