import { createRequire } from "module";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";
import tsconfigPaths from "vite-tsconfig-paths";

const localRequire = createRequire(import.meta.url);
const storybookDir = dirname(fileURLToPath(import.meta.url));

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(localRequire.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "!../src/**/__wip__/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  // VAST XML + MP4 fixtures + 9:16 content clip the FeedPlayer ad-QA story
  // requests via `/ad-tags/vast-*.xml` and `/videos/*` at this Storybook
  // origin. Dev-only, never shipped. See:
  // packages/components/docs/linkouts/SAMPLE_AD_TAGS.md
  staticDirs: ["./qa-fixtures"],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      // Enable GitHub-flavoured markdown in `*.doc.mdx` pages so
      // pipe-style tables, strikethrough, task lists, and autolinks
      // render. Mirrors `packages/ui/.storybook/main.ts`.
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
      plugins: [
        ...(config.plugins || []),
        tsconfigPaths({ projects: [join(storybookDir, "../tsconfig.storybook.json")] }),
      ],
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          external: [...((config.build?.rollupOptions?.external ?? []) as any[]), /.*\/__wip__\/.*/],
        },
      },
      resolve: {
        ...config.resolve,
        dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
        alias: {
          ...config.resolve?.alias,
          "@hooks": join(storybookDir, "../src/hooks"),
          // Swap the production GenAd container for a storybook-only
          // stub that renders the Figma banner creative directly,
          // so stories exercise the real `<DynamicLinkouts content>`
          // -> `<LinkoutItem bannerAd>` code path without
          // lazy-loading `gen_ad.min.js` or hitting ad networks.
          // See `_gen-ad-container-mock.tsx`.
          "@genuin/components/molecules/feed-player/gen-ad-container": join(
            storybookDir,
            "../src/organisms/linkouts/_gen-ad-container-mock.tsx"
          ),
        },
      },
      define: {
        ...config.define,
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY": JSON.stringify(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY),
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_URL": JSON.stringify(process.env.NEXT_PUBLIC_RUDDERSTACK_URL),
        "import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL": JSON.stringify(process.env.NEXT_PUBLIC_MEDIA_BASE_URL),
        "import.meta.env.NEXT_PUBLIC_HOST_URL": JSON.stringify(process.env.NEXT_PUBLIC_HOST_URL),
        "import.meta.env.NEXT_PUBLIC_API_URL": JSON.stringify(process.env.NEXT_PUBLIC_API_URL),
        "import.meta.env.NEXT_PUBLIC_AES_IV": JSON.stringify(process.env.NEXT_PUBLIC_AES_IV),
        "import.meta.env.NEXT_PUBLIC_AES_KEY": JSON.stringify(process.env.NEXT_PUBLIC_AES_KEY),
        "import.meta.env.NEXT_PUBLIC_SECRET_STRING": JSON.stringify(process.env.NEXT_PUBLIC_SECRET_STRING),
        "import.meta.env.NEXT_PUBLIC_REDIRECT_URI": JSON.stringify(process.env.NEXT_PUBLIC_REDIRECT_URI),
      },
    };
  },
};
export default config;
