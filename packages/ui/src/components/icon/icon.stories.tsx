import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon, type IconName } from "./icon";

const ALL_NAMES: IconName[] = [
  "arrow-right",
  "arrow-left",
  "arrow-up",
  "arrow-down",
  "chevron-right",
  "chevron-left",
  "chevron-up",
  "chevron-down",
  "check",
  "x",
  "plus",
  "minus",
  "search",
  "menu",
  "more-horizontal",
  "more-vertical",
  "share",
  "bookmark",
  "heart",
  "star",
  "external-link",
  "link",
  "copy",
  "play",
  "pause",
  "info",
  "alert-circle",
  "help-circle",
];

const meta: Meta<typeof Icon> = {
  title: "Static Page Atoms/Icon",
  component: Icon,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    name: {
      control: "select",
      options: ALL_NAMES,
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    tone: {
      control: "select",
      options: ["currentColor", "default", "subtle", "inverted"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: "check",
    size: "md",
    tone: "currentColor",
    "aria-label": "Done",
  },
};

export const AllNames: Story = {
  render: () => (
    <div className="gencl:grid gencl:grid-cols-6 gencl:gap-4">
      {ALL_NAMES.map((name) => (
        <div
          key={name}
          className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2 gencl:p-2 gencl:border gencl:border-secondary-150 gencl:rounded">
          <Icon name={name} size="lg" aria-label={name} />
          <span className="gencl:text-[10px] gencl:opacity-60">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="gencl:flex gencl:items-center gencl:gap-6">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2">
          <Icon name="star" size={size} aria-label={`star ${size}`} />
          <span className="gencl:text-[10px] gencl:opacity-60">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllTones: Story = {
  render: () => (
    <div className="gencl:flex gencl:items-center gencl:gap-6">
      <Icon name="heart" tone="currentColor" aria-label="heart" />
      <Icon name="heart" tone="default" aria-label="heart" />
      <Icon name="heart" tone="subtle" aria-label="heart" />
      <div className="gencl:bg-secondary-900 gencl:p-2 gencl:rounded">
        <Icon name="heart" tone="inverted" aria-label="heart" />
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <button
      type="button"
      className="gencl:flex gencl:items-center gencl:gap-2 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:px-3 gencl:py-2">
      {/* Decorative — the button text labels the action. */}
      <Icon name="plus" aria-label="" tone="inverted" />
      <span>Add item</span>
    </button>
  ),
};

export const StandaloneIcon: Story = {
  render: () => (
    <button type="button" className="gencl:rounded gencl:p-2 gencl:hover:bg-secondary-100" aria-label="Search">
      {/* Standalone — the icon is the only label for the button. */}
      <Icon name="search" size="lg" aria-label="" />
    </button>
  ),
};
