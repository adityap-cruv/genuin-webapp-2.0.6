/**
 * @fileoverview Embed View Linkout Stories
 *
 * Storybook stories for Dynamic Linkouts component in embed-only mode.
 * Demonstrates the embed view behavior with a simple 50% width layout,
 * video player, and linkout bar overlay without expand capability.
 *
 * Key Features:
 * - Embed-only view (no expand/collapse functionality)
 * - 50% width video container with overlay linkout bar
 * - Sheet state initialization for linkout display
 * - Integration with FeedContext for proper component hierarchy
 * - Mock comment data setup for interactive testing
 *
 * @see dynamic-linkout-expand.stories.tsx for full expand view functionality
 * @see dynamic-linkout-mobile.stories.tsx for mobile-specific patterns
 */

import { VideoPlayer } from "@genuin/ui/components/video-player";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import { FeedContext } from "@genuin/components/templates/feed/context";

// Sample linkout products for embed demo
const SAMPLE_LINKS = [
  {
    link: "https://www.walmart.com/",
    title: "Badminton racket",
    image: "https://picsum.photos/seed/badminton/240/240",
    position: 0,
  },
  {
    link: "https://www.amazon.com/",
    title: "Tennis shoes",
    image: "https://picsum.photos/seed/tennis/240/240",
    position: 1,
  },
  {
    link: "https://www.target.com/",
    title: "Yoga mat",
    image: "https://picsum.photos/seed/yoga/240/240",
    position: 2,
  },
];

const STORY_VIDEO_POSTER = "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217";

function FeedContextStoryWrapper({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <FeedContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        showExpandView: true,
        openExpandView: () => {},
        closeExpandView: () => {},
        toggleExpandView: () => {},
      }}>
      {children}
    </FeedContext.Provider>
  );
}

function StoryVideoBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <VideoPlayer
        poster={STORY_VIDEO_POSTER}
        play={false}
        controls={false}
        muted
        preload="none"
        className="gencl:w-full gencl:h-full gencl:object-contain"
      />
    </div>
  );
}

type EmbedHarnessProps = Record<string, never>;

/**
 * Embed harness component
 * Renders a simple embed view with video and overlay linkout bar
 * Linkouts always show thumbnail, title, and CTA button
 */
function EmbedHarness() {
  const { openContentType, closeContentType } = useSheetState();

  const currentLink = SAMPLE_LINKS[0];
  const ctaText = currentLink?.title ?? "";
  const ctaLink = currentLink?.link ?? "";

  useEffect(() => {
    openContentType("linkouts", "inside", "default-active");
    return () => closeContentType("linkouts");
  }, [openContentType, closeContentType]);

  const links = useMemo(
    () =>
      SAMPLE_LINKS.map((s) => ({
        link: s.link,
        position: s.position,
        image: s.image,
        title: s.title,
      })),
    []
  );

  return (
    <div
      style={{
        position: "relative",
        width: "450px",
        height: "640px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        margin: "0 auto",
      }}>
      <StoryVideoBackdrop />
      <div style={{ zIndex: 1, width: "100%" }}>
        <DynamicLinkouts
          links={links}
          effectiveVideoWidth={360}
          aspectRatio="16:9"
          ctaText={ctaText}
          ctaLink={ctaLink}
          isActive
          view="embed"
          layout="overlay"
          analyticsEventData={buildLinkoutsAnalyticsData({})}
        />
      </div>
    </div>
  );
}

const meta: Meta<typeof EmbedHarness> = {
  title: "Organisms/Linkouts/Dynamic Linkouts Embed View",
  component: EmbedHarness,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <FeedContextStoryWrapper>
        <div>
          <Story />
        </div>
      </FeedContextStoryWrapper>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Embed view reference stories for Dynamic Linkouts. Shows a video " +
          "placeholder with the linkout bar overlaid. This is the embed-only view with no expand " +
          "capability use the expand stories file for full expand view functionality.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof EmbedHarness>;

export const OverlayEmbed: Story = {
  name: "Overlay Embed",
  parameters: {
    docs: {
      description: {
        story:
          "Embed view demonstration. Shows a video container with the linkout bar " +
          "overlaid at the bottom. This is the embed-only view with no expand capability.",
      },
    },
  },
};
