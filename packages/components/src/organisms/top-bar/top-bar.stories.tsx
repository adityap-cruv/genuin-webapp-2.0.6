import type { Meta, StoryObj } from "@storybook/react-vite";

import { TopBar } from "./top-bar";

const meta: Meta<typeof TopBar> = {
  title: "Organisms/TopBar",
  component: TopBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: { type: "radio" },
      options: ["light", "dark"],
      description: "Controls the visual theme of the top bar. Dark is intended for mobile overlays.",
    },
    variant: {
      control: { type: "radio" },
      options: [undefined, "embed-expand-view"],
      description: "Controls the layout variant. Use 'embed-expand-view' for wider horizontal padding.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the top bar container.",
    },
  },
  args: {
    theme: "light",
    variant: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof TopBar>;

/**
 * The default top bar with a light background, border, and standard horizontal padding.
 * Renders brand logo, brand slogan, and CTA buttons.
 */
export const Default: Story = {
  name: "Default (Light Theme)",
  args: {
    theme: "light",
    variant: undefined,
  },
};

/**
 * Dark-themed top bar intended for mobile use where the bar overlays video content.
 * On desktop it falls back to the light bordered style.
 */
export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    theme: "dark",
    variant: undefined,
  },
};

/**
 * Embed expand-view variant that adds wider horizontal padding (`xl:px-21`) for
 * the expanded embed player layout.
 */
export const EmbedExpandView: Story = {
  name: "Embed Expand View",
  args: {
    theme: "light",
    variant: "embed-expand-view",
  },
};
