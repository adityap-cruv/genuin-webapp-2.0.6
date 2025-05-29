import { join, dirname } from "path";
import type { StorybookConfig } from "@storybook/react-vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "!../src/**/__wip__/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-docs")
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  viteFinal: (config) => {
    return {
      ...config,
      plugins: [...(config.plugins || []), tsconfigPaths()],
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          external: [
            ...((config.build?.rollupOptions?.external ?? []) as any[]),
            /.*\/__wip__\/.*/,
            ,
          ],
        },
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@components": join(__dirname, "../src/components"),
          "@hooks": join(__dirname, "../src/hooks"),
          "@lib": join(__dirname, "../src/lib"),
        },
      },
    };
  },
};
export default config;
