import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeProvider, type ThemeName } from "./theme-provider";

const meta: Meta<typeof ThemeProvider> = {
  title: "Static Page Atoms/ThemeProvider",
  component: ThemeProvider,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    theme: {
      control: "select",
      options: ["genuin", "iheart", "mcclatchy", "us-weekly"],
    },
    mode: {
      control: "radio",
      options: ["light", "dark"],
    },
    asChild: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ThemeProvider>;

/**
 * A small swatch + button block that reads from `--gencl-primary*` so any
 * ancestor `<ThemeProvider>` is immediately visible.
 */
function ThemeSwatchDemo({ label }: { label: string }) {
  return (
    <div className="gencl:flex gencl:flex-col gencl:gap-3 gencl:p-4 gencl:rounded-md gencl:bg-secondary-50">
      <span className="gencl:text-[10px] gencl:uppercase gencl:tracking-wider gencl:opacity-60">{label}</span>
      <div className="gencl:flex gencl:gap-1">
        {[100, 200, 300, 400, undefined, 600, 700].map((step, idx) => (
          <div
            key={idx}
            className="gencl:h-8 gencl:w-8 gencl:rounded-sm"
            style={{
              backgroundColor: step ? `var(--gencl-primary-${step})` : "var(--gencl-primary)",
            }}
          />
        ))}
      </div>
      <button
        type="button"
        className="gencl:px-3 gencl:py-2 gencl:rounded-md gencl:text-white gencl:text-sm gencl:font-semibold"
        style={{ backgroundColor: "var(--gencl-primary)" }}>
        Primary button
      </button>
    </div>
  );
}

export const Default: Story = {
  args: {
    theme: "genuin",
    mode: "light",
  },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeSwatchDemo label={`theme=${args.theme} mode=${args.mode}`} />
    </ThemeProvider>
  ),
};

/**
 * All four named themes side-by-side. Each block wraps the same swatch in
 * its own `<ThemeProvider>` so the per-theme palette is visible.
 */
export const AllThemes: Story = {
  render: () => {
    const themes: ThemeName[] = ["genuin", "iheart", "mcclatchy", "us-weekly"];
    return (
      <div className="gencl:grid gencl:grid-cols-2 gencl:gap-4 gencl:w-[640px]">
        {themes.map((theme) => (
          <ThemeProvider key={theme} theme={theme}>
            <ThemeSwatchDemo label={theme} />
          </ThemeProvider>
        ))}
      </div>
    );
  },
};

/**
 * Same theme in light vs dark mode. The `dark` class toggles whether
 * `@custom-variant dark` rules elsewhere in the design system take effect.
 */
export const DarkMode: Story = {
  render: () => (
    <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:w-[480px]">
      <ThemeProvider theme="iheart" mode="light">
        <ThemeSwatchDemo label="iheart · light" />
      </ThemeProvider>
      <ThemeProvider theme="iheart" mode="dark">
        <ThemeSwatchDemo label="iheart · dark" />
      </ThemeProvider>
    </div>
  ),
};

/**
 * `asChild` lets the provider attach its theme/mode classes to a host
 * element (e.g. a `<section>` or layout primitive) instead of wrapping it
 * in an extra `<div>`.
 */
export const AsChild: Story = {
  render: () => (
    <ThemeProvider theme="us-weekly" asChild>
      <section className="gencl:p-4 gencl:rounded-md gencl:bg-secondary-50">
        <ThemeSwatchDemo label="rendered as <section>" />
      </section>
    </ThemeProvider>
  ),
};
