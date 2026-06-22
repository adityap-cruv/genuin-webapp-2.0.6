import { join, dirname, resolve } from "path";

import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@chromatic-com/storybook"),
    // Added accessibility addon
    getAbsolutePath("@storybook/addon-a11y"),
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      // Enable GitHub-flavoured markdown in MDX docs so component
      // doc pages (e.g. `*.doc.mdx`) can use pipe-style tables,
      // strikethrough, task lists, and autolinks. Without this the
      // MDX 3 pipeline only supports CommonMark and tables fall
      // through as raw pipe text.
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  viteFinal: (config) => {
    return {
      ...config,
      plugins: [...(config.plugins || []), tsconfigPaths()],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@genuin/ui/components": resolve(__dirname, "../src/components"),
          "@hooks": resolve(__dirname, "../src/hooks"),
        },
      },
    };
  },
};
export default config;
