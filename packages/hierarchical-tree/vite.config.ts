import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Vite config for the standalone dev surface used to QA emitted `Page`
 * artifacts. Decoupled from `apps/webapp` so the agent's iteration
 * loop never has to boot Next.js.
 *
 * - Root is `src/dev/` so library source under `src/*.ts(x)` is not
 *   served as part of the dev bundle entry; the dev tree only imports
 *   from the package via relative paths.
 * - No library build target — `pnpm build` (defined in package.json
 *   via `tsc --build`) still produces the runtime walker artifacts;
 *   `pnpm build:preview` produces the static dev surface for
 *   inspection.
 * - The Genuin SDK is loaded via the production CDN bundle in
 *   `src/dev/index.html`, NOT imported from `@genuin/web-sdk` source.
 *   This avoids dragging `process.env`-dependent SDK source and its
 *   transitive `@genuin/components` aliases into the dev bundle.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: path.resolve(__dirname, 'src/dev'),
  resolve: {
    alias: [
      // `@genuin/components/styles` is a *built CSS artifact* (the
      // package exports field maps it to `dist/index.css`). The dev
      // linkout renderer pulls `ResponsiveLinkCard` from
      // `@genuin/components/molecules/...` which resolves through the
      // package's own wildcard `exports` entry; the *styles* subpath
      // needs this explicit alias so Tailwind's Vite plugin picks up
      // the built CSS without resolving to a non-existent `src/styles`
      // directory.
      {
        find: '@genuin/components/styles',
        replacement: path.resolve(__dirname, '../components/dist/index.css'),
      },
    ],
  },
  build: {
    // Shares `dist/` with the tsc build, which emits to `dist/types`.
    // `emptyOutDir` stays off so the preview build does not wipe those
    // declaration artifacts.
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: false,
  },
  server: {
    cors: true,
  },
});
