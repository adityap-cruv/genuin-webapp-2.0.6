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

import { VideoPlayer } from "@genuin/ui/components/video-player";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo } from "react";

import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";

import { setDeviceMode } from "../../../.storybook/preview";

// Mock Data
const STORY_VIDEO_POSTER = "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217";

const SAMPLE_LINKS = [
  {
    link: "https://www.walmart.com/",
    title: "Badminton racket",
    image: "https://placehold.co/240x240/png?text=Racket",
    position: 0,
  },
  {
    link: "https://www.amazon.com/",
    title: "Tennis shoes",
    image: "https://placehold.co/240x240/png?text=Shoes",
    position: 1,
  },
  {
    link: "https://www.target.com/",
    title: "Yoga mat",
    image: "https://placehold.co/240x240/png?text=Yoga+Mat",
    position: 2,
  },
];

const LINKOUTS_ANALYTICS = buildLinkoutsAnalyticsData({});

// Types

type DynamicLinkoutsMobileHarnessProps = {
  linkThumbnail?: boolean;
  linkTitle?: boolean;
  button?: boolean;
};

// Sub-components

function StoryVideoBackdrop() {
  return (
    <div className="gencl:absolute gencl:inset-0 gencl:pointer-events-none">
      <VideoPlayer
        poster={STORY_VIDEO_POSTER}
        play={false}
        controls={false}
        muted
        preload="none"
        className="gencl:h-full gencl:w-full gencl:object-cover"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

// Mobile harness

function DynamicLinkoutsMobileHarness({
  linkThumbnail = true,
  linkTitle = true,
  button = true,
}: DynamicLinkoutsMobileHarnessProps) {
  // Set synchronously before any hooks or children evaluate matchMedia
  setDeviceMode("mobile");

  const { openContentType, closeContentType } = useSheetState();

  const links = useMemo(
    () =>
      SAMPLE_LINKS.map((sample) => ({
        link: sample.link,
        position: sample.position,
        image: linkThumbnail ? sample.image : "",
        ...(linkTitle ? { title: sample.title } : {}),
      })),
    [linkThumbnail, linkTitle]
  );

  const primaryLink = SAMPLE_LINKS[0];
  const ctaText = button ? (primaryLink?.title ?? "") : "";
  const ctaLink = button ? (primaryLink?.link ?? "") : "";

  useEffect(() => {
    openContentType("linkouts", "inside", "default-active");
    return () => closeContentType("linkouts");
  }, [closeContentType, openContentType]);

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:bg-neutral-900">
      <div className="gencl:absolute gencl:inset-0">
        <StoryVideoBackdrop />
      </div>

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
            height: "100vh",
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
              #mobile-story-frame [data-slot="dynamic-sheet"] {
                width: 100% !important;
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
  name: "Thumbnail + Url",
  parameters: {
    docs: {
      description: {
        story: `
**Minimal card image and link only.**

        `,
      },
    },
  },
  args: {
    linkThumbnail: true,
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
