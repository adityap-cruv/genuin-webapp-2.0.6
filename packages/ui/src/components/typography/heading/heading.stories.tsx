import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from "./heading";

const meta: Meta<typeof Heading> = {
  title: "Typography/Heading",
  component: Heading,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    level: {
      control: "select",
      options: ["h1", "h2", "h3", "headline-0", "headline-1", "headline-2", "headline-3", "headline-4"],
    },
    weight: {
      control: "select",
      options: ["medium", "semibold", "bold"],
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
    },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
    asChild: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    level: "headline-2",
    children: "The quick brown fox",
  },
};

const LEVELS = ["h1", "h2", "h3", "headline-0", "headline-1", "headline-2", "headline-3", "headline-4"] as const;

export const AllLevels: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-6">
      {LEVELS.map((level) => (
        <div key={level} className="gencl:flex gencl:flex-col gencl:gap-1">
          <span className="gencl:text-[10px] gencl:uppercase gencl:tracking-wider gencl:opacity-50">{level}</span>
          <Heading level={level}>The quick brown fox</Heading>
        </div>
      ))}
    </div>
  ),
};

/**
 * Weight matrix — only the level × weight combos Figma actually ships.
 * Per node `1821:46389`:
 * - `h2`, `headline-2`, `headline-3` ship both semibold and bold.
 * - `headline-4` ships both medium and semibold.
 */
const WEIGHT_MATRIX: Array<{ level: (typeof LEVELS)[number]; weights: ReadonlyArray<"medium" | "semibold" | "bold"> }> =
  [
    { level: "h1", weights: ["bold"] },
    { level: "h2", weights: ["semibold", "bold"] },
    { level: "h3", weights: ["semibold"] },
    { level: "headline-0", weights: ["bold"] },
    { level: "headline-1", weights: ["semibold"] },
    { level: "headline-2", weights: ["semibold", "bold"] },
    { level: "headline-3", weights: ["semibold", "bold"] },
    { level: "headline-4", weights: ["medium", "semibold"] },
  ];

export const WeightMatrix: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-6">
      {WEIGHT_MATRIX.map(({ level, weights }) => (
        <div key={level} className="gencl:flex gencl:flex-col gencl:gap-2">
          <span className="gencl:text-[10px] gencl:uppercase gencl:tracking-wider gencl:opacity-50">{level}</span>
          {weights.map((weight) => (
            <Heading key={weight} level={level} weight={weight}>
              {weight} — The quick brown fox
            </Heading>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const AsOverride: Story = {
  args: {
    level: "h1",
    as: "h2",
    children: "Visually h1, semantically h2",
  },
};

export const AsChildLink: Story = {
  render: () => (
    <Heading asChild level="headline-2">
      <a href="https://genuin.io" className="gencl:underline">
        I am a linked heading
      </a>
    </Heading>
  ),
};

export const Alignments: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-3">
      <Heading level="headline-3" align="left">
        Left aligned
      </Heading>
      <Heading level="headline-3" align="center">
        Center aligned
      </Heading>
      <Heading level="headline-3" align="right">
        Right aligned
      </Heading>
    </div>
  ),
};
