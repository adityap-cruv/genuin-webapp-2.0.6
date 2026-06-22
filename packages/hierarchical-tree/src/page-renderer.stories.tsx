import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { PageRenderer } from "./page-renderer";
import type { Page } from "./schema";

/**
 * Storybook stories for `<PageRenderer>`. Each story authors a
 * synthetic `Page` artifact inline and renders it via the walker.
 *
 * The "Forced Width" story demos atomic breakpoint swap by toggling
 * `forcedWidth` between the two breakpoints in the same artifact.
 */
const meta = {
  title: "Hierarchical Tree / PageRenderer",
  component: PageRenderer,
  parameters: { layout: "padded" },
} satisfies Meta<typeof PageRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const HEADLINE_PAGE: Page = {
  id: "story-headline",
  breakpoints: [
    {
      id: "only",
      minWidth: 0,
      root: {
        type: "ui",
        uiVariant: "container",
        props: { maxW: "tablet", px: "lg" },
        children: [
          {
            type: "ui",
            uiVariant: "stack",
            props: { gap: "md" },
            children: [
              {
                type: "ui",
                uiVariant: "heading",
                props: { level: "h1", as: "h1", text: "Welcome" },
              },
            ],
          },
        ],
      },
    },
  ],
};

export const Basic: Story = {
  args: {
    page: HEADLINE_PAGE,
  },
};

const RESPONSIVE_PAGE: Page = {
  id: "story-responsive",
  breakpoints: [
    {
      id: "mobile",
      minWidth: 0,
      root: {
        type: "ui",
        uiVariant: "stack",
        props: { gap: "md" },
        children: [
          { type: "ui", uiVariant: "chip", props: { text: "mobile" } },
          { type: "slot", name: "body", kind: "content", props: { body: "Mobile **body**." } },
        ],
      },
    },
    {
      id: "desktop",
      minWidth: 1024,
      root: {
        type: "ui",
        uiVariant: "split-view",
        props: { tracks: [746, 320], gap: "lg" },
        children: [
          { type: "slot", name: "body", kind: "content", props: { body: "Desktop **body**." } },
          { type: "slot", name: "linkouts", kind: "linkout" },
        ],
      },
    },
  ],
};

/**
 * Demonstrates the atomic breakpoint swap. The same artifact has two
 * breakpoints; toggling `forcedWidth` between 500 and 1280 forces
 * the walker to re-key the subtree.
 */
export const ForcedWidth: Story = {
  render: function ForcedWidthStory() {
    const [width, setWidth] = React.useState(500);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setWidth(500)}>
            Mobile (500)
          </button>
          <button type="button" onClick={() => setWidth(1280)}>
            Desktop (1280)
          </button>
        </div>
        <div style={{ border: "1px dashed #ccc", padding: 12 }}>
          <PageRenderer page={RESPONSIVE_PAGE} forcedWidth={width} />
        </div>
      </div>
    );
  },
};
