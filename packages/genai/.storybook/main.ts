import { dirname, join, resolve } from "path";

import type { StorybookConfig } from "@storybook/react-vite";

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  // pnpm resolves two Vite copies (via terser and via tsx) so the Plugin
  // types of `@tailwindcss/vite` don't unify with Storybook's `ViteFinal`.
  // Functionally fine — cast at the boundary.
  viteFinal: async (config) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    return {
      ...config,
      plugins: [...(config.plugins ?? []), tailwindcss() as never],
      resolve: {
        ...config.resolve,
        dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
        alias: {
          ...config.resolve?.alias,
          "@": resolve(__dirname, "../src"),
        },
      },
      define: {
        ...config.define,
        "import.meta.env.VITE_GENAI_RUDDERSTACK_KEY": JSON.stringify(process.env.VITE_GENAI_RUDDERSTACK_KEY ?? ""),
        "import.meta.env.VITE_GENAI_RUDDERSTACK_URL": JSON.stringify(process.env.VITE_GENAI_RUDDERSTACK_URL ?? ""),
        "import.meta.env.VITE_GENAI_API_URL": JSON.stringify(process.env.VITE_GENAI_API_URL ?? ""),
        "import.meta.env.VITE_GENAI_BCC_URL": JSON.stringify(process.env.VITE_GENAI_BCC_URL ?? ""),
        "import.meta.env.VITE_GENAI_BCC_API_URL": JSON.stringify(process.env.VITE_GENAI_BCC_API_URL ?? ""),
        "import.meta.env.VITE_GENAI_GEN_SDK_URL": JSON.stringify(process.env.VITE_GENAI_GEN_SDK_URL ?? ""),
        "import.meta.env.VITE_GENAI_ASSETS_BASE_URL": JSON.stringify(process.env.VITE_GENAI_ASSETS_BASE_URL ?? ""),
        "import.meta.env.VITE_GENAI_API_KEY": JSON.stringify(process.env.VITE_GENAI_API_KEY ?? ""),
        "import.meta.env.VITE_GENAI_DS_BACKEND_API_URL": JSON.stringify(process.env.VITE_GENAI_DS_BACKEND_API_URL ?? ""),
      },
    };
  },
};

export default config;
