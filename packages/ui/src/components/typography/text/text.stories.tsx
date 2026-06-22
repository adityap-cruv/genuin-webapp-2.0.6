import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from "../heading/heading";

import { Text } from "./text";

const meta: Meta<typeof Text> = {
  title: "Typography/Text",
  component: Text,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["body-0", "body-1", "body-2", "body-3", "body-4"],
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
      options: ["p", "span", "div", "label"],
    },
    asChild: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    size: "body-1",
    children: "The quick brown fox jumps over the lazy dog. Body copy is the workhorse of the design system.",
  },
};

const SIZES = ["body-0", "body-1", "body-2", "body-3", "body-4"] as const;

export const AllSizes: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-4">
      {SIZES.map((size) => (
        <div key={size} className="gencl:flex gencl:flex-col gencl:gap-1">
          <span className="gencl:text-[10px] gencl:uppercase gencl:tracking-wider gencl:opacity-50">{size}</span>
          <Text size={size}>The quick brown fox jumps over the lazy dog.</Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * Weight matrix — only the size × weight combos Figma actually ships.
 * Per node `1821:46389`:
 * - `body-0` ships semibold (canonical).
 * - `body-1` ships medium, semibold, and bold.
 * - `body-2` ships medium and bold.
 * - `body-3` / `body-4` ship medium and semibold.
 */
const WEIGHT_MATRIX: Array<{ size: (typeof SIZES)[number]; weights: ReadonlyArray<"medium" | "semibold" | "bold"> }> = [
  { size: "body-0", weights: ["semibold"] },
  { size: "body-1", weights: ["medium", "semibold", "bold"] },
  { size: "body-2", weights: ["medium", "bold"] },
  { size: "body-3", weights: ["medium", "semibold"] },
  { size: "body-4", weights: ["medium", "semibold"] },
];

export const WeightMatrix: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-6">
      {WEIGHT_MATRIX.map(({ size, weights }) => (
        <div key={size} className="gencl:flex gencl:flex-col gencl:gap-2">
          <span className="gencl:text-[10px] gencl:uppercase gencl:tracking-wider gencl:opacity-50">{size}</span>
          {weights.map((weight) => (
            <Text key={weight} size={size} weight={weight}>
              {weight} — The quick brown fox jumps over the lazy dog.
            </Text>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const AsSpanInline: Story = {
  render: () => (
    <p>
      Sentence with an{" "}
      <Text as="span" weight="bold">
        inline span
      </Text>{" "}
      embedded in a paragraph.
    </p>
  ),
};

export const AsChildLink: Story = {
  render: () => (
    <Text asChild size="body-2">
      <a href="https://genuin.io" className="gencl:underline">
        I am a linked piece of body copy
      </a>
    </Text>
  ),
};

export const Composition: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-3">
      <Heading level="headline-2">Section heading</Heading>
      <Text size="body-1">
        Body copy that follows a section heading. Use this combination wherever you would otherwise write a raw{" "}
        <code>{"<h3>"}</code> + <code>{"<p>"}</code> pair.
      </Text>
    </div>
  ),
};

export const Alignments: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-3">
      <Text align="left">Left aligned paragraph.</Text>
      <Text align="center">Center aligned paragraph.</Text>
      <Text align="right">Right aligned paragraph.</Text>
    </div>
  ),
};
