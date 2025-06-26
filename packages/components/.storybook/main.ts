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
    getAbsolutePath("@storybook/addon-docs"),
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
          "@hooks": join(__dirname, "../src/hooks"),
        },
      },
      define: {
        ...config.define,
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY": JSON.stringify(
          process.env.NEXT_PUBLIC_RUDDERSTACK_KEY
        ),
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_RUDDERSTACK_URL
        ),
        "import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_MEDIA_BASE_URL
        ),
        "import.meta.env.NEXT_PUBLIC_HOST_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_HOST_URL
        ),
        "import.meta.env.NEXT_PUBLIC_API_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_API_URL
        ),
      },
    };
  },
};
export default config;
