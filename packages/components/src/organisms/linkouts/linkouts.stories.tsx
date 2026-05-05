import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";

import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import type { LinkoutsType } from "@genuin/components/react-query/api/linkouts/schema";

import { Linkouts } from "./linkouts";

// ─── Shared mock data ─────────────────────────────────────────────────────────

/** Single link – metadata fetched successfully with image */
const mockSingleWithImage: LinkoutsType = [
  {
    links: [
      {
        link: "https://www.ets.com/toefl",
        title: "Take the online TOEFL test and sign up for free today!",
        image: "https://picsum.photos/seed/toefl/64/64",
        position: 0,
      },
    ],
    cta_text: "Visit Website",
    cta_link: "https://www.ets.com/toefl",
  },
];

/** Single link – metadata fetch failed, shows URL as fallback */
const mockSingleFallback: LinkoutsType = [
  {
    links: [
      {
        link: "https://www.ets.com/toefl/some-long-path",
        title: "",
        image: "",
        position: 0,
      },
    ],
    cta_text: "ets.com/toefl",
    cta_link: "https://www.ets.com/toefl",
  },
];

/** Multi links – 4 links with thumbnails */
const mockMultiLinks: LinkoutsType = [
  {
    links: [
      {
        link: "https://example1.com",
        title: "Example 1",
        image: "https://picsum.photos/seed/a/64/64",
        position: 0,
      },
      {
        link: "https://example2.com",
        title: "Example 2",
        image: "https://picsum.photos/seed/b/64/64",
        position: 1,
      },
      {
        link: "https://example3.com",
        title: "Example 3",
        image: "https://picsum.photos/seed/c/64/64",
        position: 2,
      },
      {
        link: "https://example4.com",
        title: "Example 4",
        image: "https://picsum.photos/seed/d/64/64",
        position: 3,
      },
    ],
    cta_text: "Visit Website",
    cta_link: "https://example.com",
  },
];

/** CTA-only – no links */
const mockCTAOnly: LinkoutsType = [
  {
    links: [],
    cta_text: "Sign up now",
    cta_link: "https://www.ets.com/toefl",
  },
];

/** Dynamic – 3 links for the carousel/swiper */
const mockDynamicLinks: LinkoutsType = [
  {
    links: [
      {
        link: "https://example1.com",
        title: "Resource One",
        image: "https://picsum.photos/seed/g/64/64",
        position: 0,
      },
      {
        link: "https://example2.com",
        title: "Resource Two",
        image: "https://picsum.photos/seed/h/64/64",
        position: 1,
      },
      {
        link: "https://example3.com",
        title: "Resource Three",
        image: "https://picsum.photos/seed/i/64/64",
        position: 2,
      },
    ],
    cta_text: "Explore All",
    cta_link: "https://example.com",
  },
];

const VIEWS = ["default", "embed", "expand"] as const;
const LAYOUTS = ["overlay", "outside"] as const;

/**
 * Wrapper for the Dynamic variant: calls openContentType("linkouts") on mount
 * so that hasContentType("linkouts") returns true inside DynamicLinkouts.
 * BaseContextProvider is already supplied by the global Storybook decorator.
 */
function DynamicLinkoutsStory({
  view,
  layout,
}: {
  view: "default" | "embed" | "expand";
  layout: "overlay" | "outside";
}) {
  const { openContentType } = useSheetState();
  useEffect(() => {
    openContentType("linkouts", "inside", "default-active");
  }, [openContentType]);

  return (
    <DynamicLinkouts
      links={mockDynamicLinks[0]!.links}
      ctaText={mockDynamicLinks[0]!.cta_text ?? ""}
      ctaLink={mockDynamicLinks[0]!.cta_link ?? ""}
      isActive
      view={view}
      layout={layout}
      analyticsEventData={buildLinkoutsAnalyticsData({})}
    />
  );
}

const meta: Meta<typeof Linkouts> = {
  title: "Organisms/LinkOut",
  component: Linkouts,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "single", "multi", "cta_only", "dynamic"],
    },
    view: {
      control: "select",
      options: ["default", "embed", "expand"],
    },
    layout: {
      control: "select",
      options: ["overlay", "outside"],
    },
    isActive: { control: "boolean" },
    showImmediately: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Linkouts>;

// ─── Matrix: all card types × view × layout ───────────────────────────────────

/**
 * Shows every meaningful variant (single, multi, cta_only) across all views
 * (default, embed, expand) and layouts (overlay, outside) in a grid.
 * Use this as the primary reference for the full variation matrix.
 */
export const VariantMatrix: Story = {
  name: "Matrix / All Variants × View × Layout",
  render: () => {
    const variants: Array<{
      label: string;
      linkouts: LinkoutsType;
      variant: "single" | "multi" | "cta_only";
    }> = [
      {
        label: "Single (with image)",
        linkouts: mockSingleWithImage,
        variant: "single",
      },
      {
        label: "Single (URL fallback)",
        linkouts: mockSingleFallback,
        variant: "single",
      },
      { label: "Multi (4 links)", linkouts: mockMultiLinks, variant: "multi" },
      { label: "CTA Only", linkouts: mockCTAOnly, variant: "cta_only" },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {variants.map(({ label, linkouts, variant }) => (
          <div key={label}>
            <p style={{ fontWeight: 600, marginBottom: 12, color: "#fff" }}>{label}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {VIEWS.map((view) =>
                LAYOUTS.map((layout) => (
                  <div key={`${view}-${layout}`} style={{ minWidth: 340 }}>
                    <p style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>
                      view={view} · layout={layout}
                    </p>
                    <Linkouts
                      linkouts={linkouts}
                      linkoutId={1}
                      isActive
                      showImmediately
                      variant={variant}
                      view={view}
                      layout={layout}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ─── Single ───────────────────────────────────────────────────────────────────

/** Successfully fetched metadata – thumbnail + title + CTA */
export const SingleMetadataFetched: Story = {
  name: "Single / Metadata Fetched",
  args: {
    linkouts: mockSingleWithImage,
    linkoutId: 1,
    isActive: true,
    showImmediately: true,
    variant: "single",
    view: "default",
    layout: "overlay",
  },
};

/** Metadata fetch failed – shows raw URL as fallback */
export const SingleFallback: Story = {
  name: "Single / URL Fallback (Fetch Failed)",
  args: {
    linkouts: mockSingleFallback,
    linkoutId: 2,
    isActive: true,
    showImmediately: true,
    variant: "single",
    view: "default",
    layout: "overlay",
  },
};

// ─── Multi ────────────────────────────────────────────────────────────────────

/** Four links with thumbnails */
export const MultiLinks: Story = {
  name: "Multi / 4 Links",
  args: {
    linkouts: mockMultiLinks,
    linkoutId: 3,
    isActive: true,
    showImmediately: true,
    variant: "multi",
    view: "default",
    layout: "overlay",
  },
};

// ─── CTA Only ─────────────────────────────────────────────────────────────────

/**
 * No links – renders only the CTA button.
 * When cta_text is "Go to Episodes", the icon is suppressed by the component.
 */
export const CTAOnly: Story = {
  name: "CTA Only / Sign Up Now",
  args: {
    linkouts: mockCTAOnly,
    linkoutId: 4,
    isActive: true,
    showImmediately: true,
    variant: "cta_only",
    view: "default",
    layout: "overlay",
  },
};

// ─── Dynamic ─────────────────────────────────────────────────────────────────

/**
 * The Dynamic variant renders DynamicLinkouts (a carousel/swiper sheet).
 * It requires "linkouts" to be registered in the sheet state context
 * (hasContentType("linkouts") === true).
 *
 * This story uses a wrapper that calls openContentType("linkouts") on mount.
 * The BaseContextProvider is supplied by the global Storybook decorator.
 */
export const DynamicDefault: Story = {
  name: "Dynamic / Default View",
  render: () => <DynamicLinkoutsStory view="default" layout="overlay" />,
};

export const DynamicEmbed: Story = {
  name: "Dynamic / Embed View",
  render: () => <DynamicLinkoutsStory view="embed" layout="overlay" />,
};

export const DynamicExpand: Story = {
  name: "Dynamic / Expand View",
  render: () => <DynamicLinkoutsStory view="expand" layout="overlay" />,
};

// ─── Edge states ──────────────────────────────────────────────────────────────

/** Empty linkouts array → component returns null */
export const EmptyState: Story = {
  name: "State / Empty",
  args: {
    linkouts: [],
    linkoutId: null,
    isActive: true,
    showImmediately: true,
  },
};
