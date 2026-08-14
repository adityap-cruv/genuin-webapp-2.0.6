import type { Meta, StoryObj } from "@storybook/react-vite";

import { SectionHeader } from "./section-header";

const HEADER_IMAGE =
  "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png";

const meta = {
  title: "Molecules/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    imageUrl: HEADER_IMAGE,
    imageAlt: "Sailing podcast",
    heading: "Top Categories in Sailing",
    subHeading: "You might like",
  },
  argTypes: {
    headingAs: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "p"],
    },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutImage: Story = {
  args: {
    imageUrl: undefined,
    imageAlt: undefined,
  },
};

export const HeadingOnly: Story = {
  args: {
    imageUrl: undefined,
    imageAlt: undefined,
    subHeading: undefined,
  },
};
