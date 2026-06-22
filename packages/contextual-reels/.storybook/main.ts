import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Where Storybook looks for story files.
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding", // Shows the "Get started" checklist on first launch.
    "@storybook/addon-docs", // Adds the Docs tab that auto-generates component documentation.
  ],
  // Framework tells Storybook how to compile and render React components using Vite.
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
