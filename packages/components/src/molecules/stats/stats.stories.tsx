import type { Meta, StoryObj } from "@storybook/react-vite";
import { LinkIcon, MessageCircle, Share2 } from "lucide-react";

import { Stats } from "./stats";

const meta: Meta<typeof Stats> = {
  title: "Molecules/Stats",
  component: Stats,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    stats: { control: "object" },
    valueFirst: { control: "boolean" },
    valueClassName: { control: "text" },
    labelClassName: { control: "text" },
    className: { control: "text" },
    separator: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof Stats>;

export const Default: Story = {
  args: {
    stats: {
      Members: 12345,
      Groups: 567,
      Posts: 120,
    },
    valueFirst: true,
    className: "gencl:flex gencl:gap-1",
    valueClassName: "gencl:text-black",
    labelClassName: "gencl:text-secondary-400",
    separator: "",
  },
};

export const WithCustomLabels: Story = {
  args: {
    stats: {
      Members: { value: 9876 },
      Videos: { value: 250 },
      Views: { value: 1500000 },
    },
    valueFirst: true,
    className: "gencl:flex gencl:gap-1",
    valueClassName: "gencl:text-black",
    labelClassName: "gencl:text-secondary-400",
  },
};

export const WithIcons: Story = {
  args: {
    stats: {
      Reactions: {
        value: 1200,
        icon: <LinkIcon className="gencl:size-4 gencl:text-secondary-600" />,
      },
      Comments: {
        value: 300,
        icon: <MessageCircle className="gencl:size-4 gencl:text-secondary-600" />,
      },
      Shares: {
        value: 150,
        icon: <Share2 className="gencl:size-4 gencl:text-secondary-600" />,
      },
    },
    valueFirst: true,
    className: "gencl:flex gencl:gap-1",
    valueClassName: "gencl:text-black",
    labelClassName: "gencl:text-secondary-400",
  },
};

export const LabelFirst: Story = {
  args: {
    stats: {
      Views: 7500,
      Communities: 12,
      Groups: { value: 5 },
    },
    valueFirst: false,
    className: "gencl:flex gencl:gap-1",
    valueClassName: "gencl:text-black",
    labelClassName: "gencl:text-secondary-400",
  },
};

export const WithCustomStyling: Story = {
  args: {
    stats: {
      Videos: { value: 50000 },
      Reactions: { value: 4 },
    },
    valueFirst: true,
    valueClassName: "gencl:text-black gencl:font-bold",
    labelClassName: "gencl:text-secondary-400 gencl:italic",
    className: "gencl:flex gencl:flex-col gencl:gap-2",
  },
};
