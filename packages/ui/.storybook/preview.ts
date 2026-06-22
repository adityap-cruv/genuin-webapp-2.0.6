import type { Preview } from "@storybook/react-vite";

import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      // Right-side table of contents on every Docs page, built from
      // the H2/H3 headings in `*.doc.mdx`. Sections like "Examples",
      // "When to use", and per-story headings become clickable anchors
      // that scroll the page and update the URL hash.
      toc: {
        title: "On this page",
        headingSelector: "h2, h3",
        // Skip headings rendered *inside* a `<Canvas>` block so the
        // TOC stays scoped to the doc narrative.
        ignoreSelector: ".docs-story h2, .docs-story h3",
      },
    },
  },
};

export default preview;
