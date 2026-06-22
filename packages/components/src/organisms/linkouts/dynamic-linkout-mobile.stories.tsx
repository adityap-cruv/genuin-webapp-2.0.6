/**
 * @fileoverview Mobile Linkout Stories
 *
 * Mobile-focused Storybook stories for Dynamic Linkouts component.
 * These stories demonstrate the mobile view behavior with responsive behavior,
 * state management, and interaction patterns.
 *
 * Key Features:
 * - Mobile viewport simulation (640px max-width)
 * - Sheet state management for expand/collapse interactions
 * - Video player integration with linkout overlay
 * - Real-time state reactivity and animations
 *
 * Device mode is controlled via setDeviceMode() from preview.ts (single matchMedia mock).
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";

import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";

import { StoryVideoBackdrop, useSeededLinkoutState } from "./_story-helpers";
import { LINKOUT_FIGMA_CAROUSEL } from "./linkouts.fixtures";

// Sourced from packages/components/src/organisms/linkouts/linkouts.fixtures.ts
// (TOEFL / ETS reference content from the Figma design).
const SAMPLE_LINKS = LINKOUT_FIGMA_CAROUSEL;

const LINKOUTS_ANALYTICS = buildLinkoutsAnalyticsData({});

// Types

type DynamicLinkoutsMobileHarnessProps = {
  linkThumbnail?: boolean;
  linkTitle?: boolean;
  button?: boolean;
  /** When true, every field from `LINKOUT_FIGMA_CAROUSEL` is forwarded
   *  to `<DynamicLinkouts>` (description, brand, website, originalPrice,
   *  currentPrice, rating, likes, downloads, phone, address). The
   *  `linkThumbnail`/`linkTitle` flags still apply on top so reviewers
   *  can mix-and-match. Defaults to false to preserve the existing
   *  variant stories' minimal projection. */
  richData?: boolean;
};

// Mobile harness

function DynamicLinkoutsMobileHarness({
  linkThumbnail = true,
  linkTitle = true,
  button = true,
  richData = false,
}: DynamicLinkoutsMobileHarnessProps) {
  useSeededLinkoutState({
    initialState: "default-active",
    deviceMode: "mobile",
  });

  const links = useMemo(
    () =>
      SAMPLE_LINKS.map((sample) => ({
        // Spread the full fixture first so description / brand / website
        // / prices / rating / likes / downloads / phone / address flow
        // through; the projections below override image/title per the
        // variant flags.
        ...(richData ? sample : {}),
        link: sample.link,
        position: sample.position,
        image: linkThumbnail ? sample.image : "",
        ...(linkTitle ? { title: sample.title } : {}),
      })),
    [linkThumbnail, linkTitle, richData]
  );

  const primaryLink = SAMPLE_LINKS[0];
  const ctaText = button ? (primaryLink?.title ?? "") : "";
  const ctaLink = button ? (primaryLink?.link ?? "") : "";

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:bg-neutral-900">
      <StoryVideoBackdrop className="gencl:h-full gencl:w-full gencl:object-cover" asAbsolute />

      <div className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:z-[5]">
        <DynamicLinkouts
          links={links}
          ctaText={ctaText}
          ctaLink={ctaLink}
          isActive
          view="embed"
          layout="overlay"
          effectiveVideoWidth={420}
          aspectRatio="16:9"
          analyticsEventData={LINKOUTS_ANALYTICS}
        />
      </div>
    </div>
  );
}

// All variants showcase

type MobileVariantKey = "thumbnail-only" | "thumbnail-title" | "thumbnail-button" | "thumbnail-title-button";

const MOBILE_VARIANTS: Array<{
  key: MobileVariantKey;
  label: string;
  linkThumbnail: boolean;
  linkTitle: boolean;
  button: boolean;
}> = [
  {
    key: "thumbnail-only",
    label: "Thumbnail Only",
    linkThumbnail: true,
    linkTitle: false,
    button: false,
  },
  {
    key: "thumbnail-title",
    label: "Thumbnail + Title",
    linkThumbnail: true,
    linkTitle: true,
    button: false,
  },
  {
    key: "thumbnail-button",
    label: "Thumbnail + Button",
    linkThumbnail: true,
    linkTitle: false,
    button: true,
  },
  {
    key: "thumbnail-title-button",
    label: "Thumbnail + Title + Button",
    linkThumbnail: true,
    linkTitle: true,
    button: true,
  },
];

function AllVariantsMobileShowcase() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(360px, 420px))",
        justifyContent: "center",
        gap: 18,
        padding: 18,
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
      {MOBILE_VARIANTS.map((variant) => (
        <div
          key={variant.key}
          style={{
            background: "#0a0a0a",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #1f2937",
          }}>
          <div style={{ padding: "12px 12px 8px" }}>
            <div
              style={{
                color: "#f9fafb",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8,
              }}>
              {variant.label}
            </div>
            <div style={{ height: 1, width: "100%", background: "#374151" }} />
          </div>

          <div
            style={{
              height: "78vh",
              width: "100%",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#0a0a0a",
            }}>
            <DynamicLinkoutsMobileHarness
              linkThumbnail={variant.linkThumbnail}
              linkTitle={variant.linkTitle}
              button={variant.button}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Storybook meta

const meta: Meta<typeof DynamicLinkoutsMobileHarness> = {
  title: "Organisms/Linkouts/Dynamic Linkouts Mobile View",
  component: DynamicLinkoutsMobileHarness,
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      if (context.name === "All Variants Layout For Mobile") {
        return <Story />;
      }

      return (
        <div
          id="mobile-story-frame"
          style={{
            height: "720px",
            width: "420px",
            margin: "10px auto",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0a0a0a",
          }}>
          <style>{`
            @layer utilities {
              /* The sheet's positioned mode pins to left:0/right:0; in the
                 storybook frame the right side bleeds past the visible
                 viewport. Inset by 8px on each side so reviewers see the
                 sheet with the same horizontal breathing room as the design. */
              #mobile-story-frame [data-slot="dynamic-sheet"] {
                left: 8px !important;
                right: 8px !important;
                width: auto !important;
              }
            }
          `}</style>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
These stories represent the \`DynamicLinkouts\` component in **embed mode** (\`view="embed"\`) as it appears overlaid on a video card in the mobile feed before the user taps into the expand view.
 
### What this is not
This is **not** the expand/post-detail overlay. For that see \`Dynamic Linkouts Expand\`.
  
### Story 00 vs stories 01–04
- **Story 00** renders all four card variants side by side in a 2×2 grid. Drag/expand is disabled here so you can compare visual appearance quickly.
- **Stories 01–04** each render a single variant inside mobile frame with distinct content based on the story name.
        `,
      },
    },
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof DynamicLinkoutsMobileHarness>;

// Stories

export const AllVariantsLayoutForMobile: Story = {
  name: "All Variants Layout For Mobile",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: `
**Visual comparison grid all four card variants side by side.**
 
Renders thumbnail-only, thumbnail+title, thumbnail+button, and thumbnail+title+button in a 2×2 grid so you can compare appearance without switching stories.
 
> Drag/expand interaction is disabled in this grid. To test the sheet drag behaviour (default → panel-view → full-view) use stories 01–04.
        `,
      },
    },
  },
  render: () => <AllVariantsMobileShowcase />,
};

export const ThumbnailOnly: Story = {
  name: "Url Only (fallback icon)",
  parameters: {
    docs: {
      description: {
        story: `
**Minimal card url only — no image, no title, no button.**

The favicon area falls back to the chain-link \`LinkIcon\` per Figma node 9621:92218 ("Thumbnail fallback") because no \`image\` is supplied.
        `,
      },
    },
  },
  args: {
    linkThumbnail: false,
    linkTitle: false,
    button: false,
  },
};

export const ThumbnailAndTitle: Story = {
  name: "Thumbnail + Title",
  parameters: {
    docs: {
      description: {
        story: `
**Card with image and title label.**
        `,
      },
    },
  },
  args: {
    linkThumbnail: true,
    linkTitle: true,
    button: false,
  },
};

export const ThumbnailAndButton: Story = {
  name: "Thumbnail + Button",
  parameters: {
    docs: {
      description: {
        story: `
**Card with image and CTA button, no title.**
        `,
      },
    },
  },
  args: {
    linkThumbnail: true,
    linkTitle: false,
    button: true,
  },
};

export const ThumbnailTitleAndButton: Story = {
  name: "Thumbnail + Title + Button",
  parameters: {
    docs: {
      description: {
        story: `
**Fully-loaded card image + title + CTA button.**

This is the primary reference story for the mobile embed view. All three content elements are present simultaneously.
        `,
      },
    },
  },
  args: {
    linkThumbnail: true,
    linkTitle: true,
    button: true,
  },
};

export const FullFigmaCardMobile: Story = {
  name: "Full Figma Card",
  parameters: {
    docs: {
      description: {
        story: `
**Mobile embed with the complete Figma data set.**

Renders the carousel with the full TOEFL / ETS reference content from \`linkouts.fixtures.ts\` — every field the design surfaces (description, brand, website, prices, rating, likes, downloads, phone, address) flows through the registry adapter to \`<LinkCard>\`. The width-bucketed embed scenario picks \`embed-expand\` at 420 px, so the rich meta row is visible from the start.
        `,
      },
    },
  },
  args: {
    linkThumbnail: true,
    linkTitle: true,
    button: true,
    richData: true,
  },
};
