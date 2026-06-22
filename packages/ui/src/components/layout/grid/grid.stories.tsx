import type { Meta, StoryObj } from "@storybook/react-vite";

import { Grid } from "./grid";

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    gap: {
      control: "select",
      options: [undefined, "none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"],
    },
    colGap: {
      control: "select",
      options: [undefined, "none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"],
    },
    rowGap: {
      control: "select",
      options: [undefined, "none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"],
    },
    asChild: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Grid>;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="gencl:bg-secondary-100 gencl:px-3 gencl:py-3 gencl:text-center">{children}</div>
);

export const ThreeEqualColumns: Story = {
  args: {
    cols: 3,
    gap: "md",
  },
  render: (args) => (
    <Grid {...args}>
      <Cell>1</Cell>
      <Cell>2</Cell>
      <Cell>3</Cell>
    </Grid>
  ),
};

export const TwelveColumnGrid: Story = {
  args: {
    cols: 12,
    gap: "sm",
  },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Cell key={i}>{i + 1}</Cell>
      ))}
    </Grid>
  ),
};

export const StringTracks: Story = {
  args: {
    cols: "746px 320px",
    gap: "md",
  },
  render: (args) => (
    <Grid {...args}>
      <Cell>746px track</Cell>
      <Cell>320px track</Cell>
    </Grid>
  ),
};

export const AsymmetricGaps: Story = {
  args: {
    cols: 3,
    colGap: "xl",
    rowGap: "xs",
  },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Cell key={i}>{i + 1}</Cell>
      ))}
    </Grid>
  ),
};

export const RowsAndCols: Story = {
  args: {
    cols: 3,
    rows: 2,
    gap: "md",
  },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Cell key={i}>{i + 1}</Cell>
      ))}
    </Grid>
  ),
};

export const AsSection: Story = {
  args: {
    asChild: true,
    cols: 2,
    gap: "md",
  },
  render: (args) => (
    <Grid {...args}>
      <section>
        <Cell>Inside a {"<section>"}</Cell>
        <Cell>via asChild</Cell>
      </section>
    </Grid>
  ),
};
