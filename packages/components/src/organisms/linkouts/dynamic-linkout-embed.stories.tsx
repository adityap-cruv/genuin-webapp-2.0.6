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

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";

import {
  BANNER_AD_SIZES,
  FeedContextStoryWrapper,
  getDisplayAdImageUrl,
  MockDisplayAdContainer,
  MockVideoAdContainer,
  pickBannerAdSize,
  pickDisplayAdSize,
  StoryVideoBackdrop,
  useDominantColor,
  useFrameSize,
  useSeededLinkoutState,
  VIDEO_AD_RATIOS,
  type VideoAdRatio,
} from "./_story-helpers";
import { LINKOUT_FIGMA_CAROUSEL, LINKOUT_FIGMA_CTA } from "./linkouts.fixtures";

// Sourced from packages/components/src/organisms/linkouts/linkouts.fixtures.ts
// (TOEFL / ETS reference content from the Figma design).
const SAMPLE_LINKS = LINKOUT_FIGMA_CAROUSEL;

type EmbedHarnessProps = {
  /** Forwarded to `<DynamicLinkouts>`'s `effectiveVideoWidth` and used as
   *  the host frame width so the linkout actually fills it. The width
   *  is what selects the scenario in `linkouts-sheet-config.ts`:
   *  ≤180 → `embed-xs`, <250 → `embed-sml`, <300 → `embed-default`,
   *  <400 → `embed-active`, ≥400 → `embed-expand`.
   *  @default 360 (lands in `embed-active`) */
  width?: number;
  /** Story-controlled initial state. Defaults to `default-active` for
   *  the `embed-active` flow; chip stories pass `pl-xs` / `pl-sml` so
   *  the harness's openContentType call doesn't fight the scenario.
   *  `panel-view` and `full-view` only resolve to that state when
   *  `view="expand"` + `deviceMode="mobile"` (i.e. the
   *  `expand-mobile` scenario, the only one that includes them). */
  initialState?: "default" | "default-active" | "expand-view" | "panel-view" | "full-view" | "pl-xs" | "pl-sml";
  /** "embed" picks an `embed-*` scenario from the width bucket;
   *  "expand" with `deviceMode="mobile"` picks `expand-mobile` so
   *  panel/full-view states can be exercised on this docs page.
   *  @default "embed" */
  view?: "embed" | "expand";
  /** Synchronously sets the matchMedia mock so the scenario picker
   *  sees mobile vs desktop. Must be set per-story render because the
   *  shared mock is module-scoped. @default "desktop" */
  deviceMode?: "desktop" | "mobile";
  /** Forward every field on the fixture (description, brand, prices,
   *  rating, likes, downloads, phone, address) to `<DynamicLinkouts>`.
   *  Default `false` keeps the existing minimal projection. */
  richData?: boolean;
};

/**
 * Embed harness component
 * Renders a simple embed view with video and overlay linkout bar
 * Linkouts always show thumbnail, title, and CTA button
 */
function EmbedHarness({
  width = 360,
  initialState = "default-active",
  view = "embed",
  deviceMode = "desktop",
  richData = false,
}: EmbedHarnessProps) {
  // Pick device mode + force parent sheet state to `initialState`
  // synchronously, so `<DynamicLinkouts>` reads the right value on
  // its first render and the dynamic-sheet's `useState` lands at
  // the intended state. (See helper for the `openContentType` /
  // `setContentTypeState` rationale — the event bus pre-registers
  // `linkouts` so `setContentTypeState` is needed to override.)
  useSeededLinkoutState({ initialState, deviceMode });

  const currentLink = SAMPLE_LINKS[0];
  // Per design — CTA label is the fixed action verb from the
  // Figma reference (`LINKOUT_FIGMA_CTA.ctaText = "Sign Up Now"`),
  // not the link's title. The chevron arrow is rendered by the
  // CTA pill itself.
  const ctaText = LINKOUT_FIGMA_CTA.ctaText;
  const ctaLink = currentLink?.link ?? "";

  const links = useMemo(
    () =>
      SAMPLE_LINKS.map((s) => ({
        ...(richData ? s : {}),
        link: s.link,
        position: s.position,
        image: s.image,
        title: s.title,
      })),
    [richData]
  );

  // Mobile-expand stories (panel-view / full-view / default-active)
  // use a fixed 420 px frame so the panel's `w-screen` override gets
  // constrained to the device width, mirroring the mobile stories'
  // pattern. Embed stories track the linkout's intended width so the
  // chip's `w-full` is visible at its real rendered size.
  const isMobileExpand = view === "expand" && deviceMode === "mobile";
  // Placement scenarios (`embed-xs` / `embed-sml`) include a multi-
  // state drag chain that ends in `full-view`. They use container-
  // relative heights (`"100%"`) so the panel can fill the embed frame
  // when fully expanded — that only works if the dynamic-sheet's
  // measured parent has a definite height, so the inline wrapper
  // needs `height: 100%` here just like `isMobileExpand` does.
  const isPlacementChip = initialState === "pl-xs" || initialState === "pl-sml";
  // `embed-default` (initialState `"default"`, view `"embed"`) shares
  // the same multi-state drag chain — `default` ↔ `default-active` ↔
  // `expand-view` ↔ `panel-view` ↔ `full-view` — and its `full-view`
  // height is also `"100%"`. Without a definite parent height, the
  // panel collapses against an indeterminate parent and leaves a
  // visible strip above it when the user drags to the top. The
  // `expand-mobile` flow (`view === "expand"`) is the other scenario
  // that starts from `"default"` but it's already covered by
  // `isMobileExpand` above, so guard on `view === "embed"` here to
  // avoid double-application.
  const isEmbedDefaultChain = view === "embed" && initialState === "default";
  // `embed-expand` (width ≥ 400, `view === "embed"`) also includes
  // `full-view` in its drag chain (`expand-view` ↔ `panel-view` ↔
  // `full-view`) with `full-view: "100%"`. Same reasoning as
  // `isEmbedDefaultChain` — the panel needs a definite parent height
  // to resolve `100%` against, otherwise dragging up to `full-view`
  // leaves a strip above the panel. The picker threshold for
  // `embed-expand` is `effectiveVideoWidth >= 400`, so match it here.
  const isEmbedExpandChain = view === "embed" && width >= 400;
  const fillFrameHeight = isMobileExpand || isPlacementChip || isEmbedDefaultChain || isEmbedExpandChain;
  const frameWidth = isMobileExpand ? 420 : Math.max(width + 16, 280);
  const frameId = isMobileExpand ? "embed-story-mobile-frame" : undefined;

  return (
    <div
      id={frameId}
      style={{
        position: "relative",
        width: `${frameWidth}px`,
        height: "640px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        margin: "0 auto",
        overflow: isMobileExpand ? "hidden" : undefined,
        backgroundColor: isMobileExpand ? "#0a0a0a" : undefined,
      }}>
      {isMobileExpand && (
        <style>{`@layer utilities {
          /* Only the drawer-style detail states (panel-view + full-view)
             fill the frame edge-to-edge. Compact "floating card" states
             (default / default-active / expand-view) must keep the 8 px
             inset that \`panelFullClassName\` applies via
             \`w-[calc(100%_-_16px)]\` + \`mx-2\`. The id selector here
             only fires for the drawer states. */
          #embed-story-mobile-frame [data-slot="dynamic-sheet"][data-state="panel-view"],
          #embed-story-mobile-frame [data-slot="dynamic-sheet"][data-state="full-view"] {
            width: 100% !important;
          }
        }`}</style>
      )}
      <StoryVideoBackdrop className="gencl:w-full gencl:h-full gencl:object-cover" asAbsolute />
      <div
        style={{
          zIndex: 1,
          width: "100%",
          // 8 px inset on TOP only. The panel's left + right insets
          // are applied at the panel level (see `panelFullClassName`
          // in linkouts-sheet-config.ts) so they persist across
          // scenario / state transitions; we used to double them
          // here via wrapper padding. Bottom is flush so the
          // carousel dots sit on the cell edge.
          padding: isMobileExpand ? "0" : "8px 0 0",
          boxSizing: "border-box",
          // Mobile-expand AND placement-chip stories make the inner
          // wrapper fill the entire frame so the dynamic-sheet's
          // parent height (which it measures via ResizeObserver) is
          // the frame's 640 px. That lets `panel-view` (70%) and
          // `full-view` (100%) resolve to definite pixel heights —
          // the panel can fill the frame instead of overflowing it
          // when `vh` would resolve against the viewport instead.
          // `justify-end` keeps the panel + dots stack glued to the
          // bottom edge for the auto-sized states (default, etc.).
          ...(fillFrameHeight
            ? {
                height: "100%",
                display: "flex",
                flexDirection: "column" as const,
                justifyContent: "flex-end",
              }
            : {}),
        }}>
        <DynamicLinkouts
          links={links}
          effectiveVideoWidth={width}
          aspectRatio="16:9"
          ctaText={ctaText}
          ctaLink={ctaLink}
          isActive
          view={view}
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
  // Docs tab is sourced from `dynamic-linkouts-embed-view.doc.mdx`
  // via `<Meta of={…}>`; leaving `tags: ["autodocs"]` here would
  // race with that explicit attachment and Storybook would emit a
  // duplicate auto-generated Docs page.
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

export const FullFigmaCardEmbed: Story = {
  name: "Overlay Embed — Full Figma Card",
  args: {
    width: 420,
    initialState: "expand-view",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Embed view rendered with the complete TOEFL / ETS Figma reference content. " +
          "All extended fields (description, brand, website, prices, rating, likes, downloads, phone, address) are present on each link; whichever variant the width-bucketed scenario picker chooses, " +
          "the rich data will surface in any state that consumes those fields.",
      },
    },
  },
};

export const PlacementXSEmbed: Story = {
  name: "Placement XS (≤180 px)",
  args: {
    width: 160,
    initialState: "pl-xs",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Narrow embed (≤180 px) — picker selects `embed-xs`, render branch `pl-xs`. " +
          "Text-only translucent chip, 32 px tall, centered, no thumbnail, no trailing icon. " +
          "Use this to verify the chip fills the container width minus the 8 px outer ring (per the Figma reference at node 9260-90901).",
      },
    },
  },
};

export const PlacementSMLEmbed: Story = {
  name: "Placement SML (181–249 px)",
  args: {
    width: 220,
    initialState: "pl-sml",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Medium-narrow embed (181–249 px) — picker selects `embed-sml`, render branch `pl-sml`. " +
          "Translucent chip with 24 × 24 thumbnail prefix, body-1 semibold CTA-style title, and a trailing chevron. " +
          "Same `w-full` responsive behaviour as `pl-xs`.",
      },
    },
  },
};

// ── Per-state stories ───────────────────────────────────────────────
// One story per `SheetState` so reviewers can see each render branch
// in isolation. `default` and `expand-view` resolve naturally inside
// `embed-*` scenarios via the width bucket; `default-active`,
// `panel-view`, and `full-view` are not part of any embed scenario,
// so those stories switch to `view="expand"` + `deviceMode="mobile"`
// and land in `expand-mobile` (the only scenario that includes them).

export const DefaultEmbed: Story = {
  name: "Default",
  args: {
    width: 260,
    initialState: "default",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default state — picker selects `embed-default` (250–299 px). Compact row with link icon, title text, and trailing chevron. " +
          "**Auto-advances to `expand-view` after 3 s** (this is the natural embed-flow behaviour); reload the story to capture the default frame again.",
      },
    },
  },
};

export const DefaultActiveEmbed: Story = {
  name: "Default Active",
  args: {
    initialState: "default-active",
    view: "expand",
    deviceMode: "mobile",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default-active state — `embed-*` scenarios don't include this state, so the story switches to `expand-mobile` to render it. " +
          "Visually: rich horizontal card (thumbnail + title column) at the default-active height. " +
          "**Auto-advances to `expand-view` after 3 s** per the `expand-mobile` config.",
      },
    },
  },
};

export const ExpandViewEmbed: Story = {
  name: "Expand View",
  args: {
    width: 420,
    initialState: "expand-view",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expand-view state — picker selects `embed-expand` (≥400 px). Rich horizontal card with thumbnail + text column (title, description, meta row). Stable, no auto-advance. Card body uses `height: auto` so the panel fits content.",
      },
    },
  },
};

export const PanelViewEmbed: Story = {
  name: "Panel View",
  args: {
    initialState: "panel-view",
    view: "expand",
    deviceMode: "mobile",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Panel-view state — uses `expand-mobile` at 70 vh (the only scenario that enables this state). " +
          "Vertical detail layout: 1:1 thumbnail, headline-4 title, body-1 description, meta block, and link row.",
      },
    },
  },
};

export const FullViewEmbed: Story = {
  name: "Full View",
  args: {
    initialState: "full-view",
    view: "expand",
    deviceMode: "mobile",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full-view state — uses `expand-mobile` at 100 vh. Same vertical detail layout as Panel View; the thumbnail expands to ~90 % width.",
      },
    },
  },
};

// ── Dynamic View ────────────────────────────────────────────────────
// Resizable frame that adapts the linkout variant to the frame's
// width. Mirrors the standalone reference at `/grid/linkout/`:
// drag the bottom-right resize handle, or click a preset, and the
// linkout swaps between pl-xs / pl-sml / default / default-active /
// expand-view via the same width buckets the production scenario
// picker uses (`linkouts-sheet-config.ts`).

const DYNAMIC_PRESETS = [
  { w: 300, h: 600 },
  { w: 320, h: 250 },
  { w: 300, h: 250 },
  { w: 320, h: 100 },
] as const;

type DynamicVariant = "pl-xs" | "pl-sml" | "default" | "default-active" | "expand-view";

const VARIANT_ORDER: DynamicVariant[] = ["pl-xs", "pl-sml", "default", "default-active", "expand-view"];

function widthBucketState(width: number): DynamicVariant {
  if (width <= 180) return "pl-xs";
  if (width < 250) return "pl-sml";
  if (width < 300) return "default";
  if (width < 400) return "default-active";
  return "expand-view";
}

// Width passed to `DynamicLinkouts` so the scenario picker
// (`linkouts-sheet-config.ts`) lands on the scenario that matches
// the resolved variant. Used when the height-based step-down picks
// a smaller variant than the frame's actual width would — without
// switching the scenario the chip would render inside the larger
// scenario's chrome (drag pill + header + footer), producing a
// stacked-layouts mess.
function variantScenarioWidth(v: DynamicVariant): number {
  switch (v) {
    case "pl-xs":
      return 170; // ≤ 180 → embed-xs
    case "pl-sml":
      return 220; // < 250 → embed-sml
    case "default":
      return 270; // < 300 → embed-default
    case "default-active":
      return 360; // < 400 → embed-active
    case "expand-view":
      return 450; // ≥ 400 → embed-expand
  }
}

function DynamicViewHarness() {
  // Force desktop matchMedia + parent sheet state to "default" so
  // DynamicLinkouts's `linkoutsState` falls back to whichever
  // scenario the width picker selects. The variant then follows
  // the frame width automatically as it resizes.
  const { setContentTypeState } = useSeededLinkoutState({
    initialState: "default",
  });

  const links = useMemo(
    () =>
      SAMPLE_LINKS.map((s) => ({
        ...s,
        link: s.link,
        position: s.position,
        image: s.image,
        title: s.title,
      })),
    []
  );

  const currentLink = SAMPLE_LINKS[0];
  // Per design — CTA label is the fixed action verb from the
  // Figma reference (`LINKOUT_FIGMA_CTA.ctaText = "Sign Up Now"`),
  // not the link's title. The chevron arrow is rendered by the
  // CTA pill itself.
  const ctaText = LINKOUT_FIGMA_CTA.ctaText;
  const ctaLink = currentLink?.link ?? "";

  // `offsetWidth`/`offsetHeight` (= what the preset buttons
  // advertise: 320 × 100, not 318 × 98).
  const { ref: frameRef, size: frameSize } = useFrameSize<HTMLDivElement>({
    w: 360,
    h: 600,
  });
  const linkoutRef = useRef<HTMLDivElement>(null);

  // Pick the width-ideal variant first, then step down if it
  // doesn't fit. The reference at `/grid/linkout/index.js` uses
  // `linkoutH > h / 2` as the "too tall" threshold; mirror that.
  // `stepDown` resets whenever the width bucket changes so the
  // picker reconsiders the ideal variant for each new width.
  const widthVariant = widthBucketState(frameSize.w);
  const widthIdx = VARIANT_ORDER.indexOf(widthVariant);
  const [stepDown, setStepDown] = useState(0);
  // Reset on width changes (new ideal variant) AND on height
  // changes — when the frame grows taller, the previously-too-tall
  // variant might now fit, so we reconsider from the width-ideal
  // and let the debounced check re-step-down only if still needed.
  useEffect(() => {
    setStepDown(0);
  }, [widthVariant, frameSize.h]);
  const variantIdx = Math.max(0, widthIdx - stepDown);
  const variant = VARIANT_ORDER[variantIdx] ?? widthVariant;

  // Measure the rendered linkout height after the variant settles;
  // if it's taller than half the frame, step down one variant.
  // We observe size changes via ResizeObserver and debounce past
  // the dynamic-sheet's 320 ms height transition so we don't read
  // mid-animation values (which would step the picker right past
  // the variant that actually fits, all the way down to pl-xs).
  useEffect(() => {
    const el = linkoutRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const settleDelayMs = 360;
    const check = () => {
      const linkoutH = el.offsetHeight;
      if (linkoutH > frameSize.h / 2 && variantIdx > 0) {
        setStepDown((prev) => prev + 1);
      }
    };
    const observer = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(check, settleDelayMs);
    });
    observer.observe(el);
    // Schedule one initial check after settle in case the size
    // doesn't change between renders (e.g. width unchanged but
    // variant pushed in via the previous state).
    timer = setTimeout(check, settleDelayMs);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [frameSize.h, variantIdx]);

  // Push the resolved variant into the parent sheet state so
  // DynamicLinkouts's `linkoutsState` resolves to it, and the
  // dynamic-sheet transitions accordingly.
  useEffect(() => {
    setContentTypeState("linkouts", variant);
  }, [setContentTypeState, variant]);

  const applyPreset = (w: number, h: number) => {
    if (frameRef.current) {
      frameRef.current.style.width = `${w}px`;
      frameRef.current.style.height = `${h}px`;
    }
  };

  // Ad-fallback mode. `off` shows the normal `<DynamicLinkouts>`.
  // `banner` renders the largest banner that fits at the bottom of
  // the frame (where the linkout would normally sit). `display`
  // renders the largest MPU/half-page that fits, centred inside
  // the player. Each picker returns `null` when nothing fits — the
  // slot stays empty so the player isn't crowded.
  const [adMode, setAdMode] = useState<"off" | "banner" | "display" | "video">("off");
  // Video-ad aspect ratio picker. Only visible when `adMode === "video"`;
  // value is sticky across mode toggles so re-entering video mode
  // restores the last-selected ratio.
  const [videoRatio, setVideoRatio] = useState<VideoAdRatio>("9:16");
  const bannerSize = pickBannerAdSize(frameSize.w, frameSize.h);
  const displaySize = pickDisplayAdSize(frameSize.w, frameSize.h);
  // Sample the picked display creative for its predominant colour so
  // the gradient backdrop tints to match the ad (Figma node
  // 10089:29042 uses the banner's accent colour at the top stop).
  // Only kicked off in display mode — the hook short-circuits when
  // passed `null`. Falls back to the TOEFL yellow until extraction
  // completes (or if the canvas read is CORS-tainted).
  const displayAdImageUrl =
    adMode === "display" && displaySize ? getDisplayAdImageUrl(displaySize.w, displaySize.h) : null;
  const dominantColor = useDominantColor(displayAdImageUrl);
  const displayGradientTopStop = dominantColor ?? "#F0FF96";

  // Pass a synthesized width that maps to the resolved variant's
  // scenario, NOT the raw frame width. This way the height-based
  // step-down (e.g. expand-view → default-active because the panel
  // was too tall) also switches the scenario itself, so the chip
  // / collapsed states get the correct `showHeader: false`,
  // `showFooter: false`, `showIndicator: false` chrome from
  // `linkouts-sheet-config.ts`. The variant label still uses the
  // raw frame width so the user sees the actual dimensions.
  const effectiveVideoWidth = variantScenarioWidth(variant);

  return (
    <div>
      {/* Ad mode row — sits above the frame-size presets so the
        toggle is the first thing the reviewer hits, not buried at
        the end of the preset row. */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 8,
        }}>
        <fieldset
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            margin: 0,
            padding: "4px 10px",
            border: "1px solid #dfe1e3",
            borderRadius: 6,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            color: "#1d1f20",
          }}>
          <legend
            style={{
              padding: "0 4px",
              color: "#585c61",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
            Ad mode
          </legend>
          {(
            [
              { value: "banner", label: "Banner Ad" },
              { value: "display", label: "Display Ad" },
              { value: "video", label: "Video Ad" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              htmlFor={`dynamic-view-ad-${opt.value}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                userSelect: "none",
              }}>
              <input
                id={`dynamic-view-ad-${opt.value}`}
                data-testid={`dynamic-view-ad-${opt.value}`}
                type="radio"
                name="dynamic-view-ad-mode"
                value={opt.value}
                checked={adMode === opt.value}
                onChange={() => setAdMode(opt.value)}
                style={{ margin: 0 }}
              />
              {opt.label}
            </label>
          ))}
          {adMode === "video" && (
            <label
              htmlFor="dynamic-view-video-ratio"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                userSelect: "none",
              }}>
              <span style={{ color: "#585c61" }}>Ratio</span>
              <select
                id="dynamic-view-video-ratio"
                data-testid="dynamic-view-video-ratio"
                value={videoRatio}
                onChange={(e) => setVideoRatio(e.target.value as VideoAdRatio)}
                style={{
                  padding: "2px 6px",
                  border: "1px solid #dfe1e3",
                  borderRadius: 4,
                  background: "#ffffff",
                  color: "#1d1f20",
                  fontFamily: "inherit",
                  fontSize: 12,
                  cursor: "pointer",
                }}>
                {VIDEO_AD_RATIOS.map((r) => (
                  <option key={r.label} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {/* Hidden default radio so users can click an already-
            checked option to deselect via the keyboard. Same effect
            as the "no ad" baseline. */}
          <button
            type="button"
            onClick={() => setAdMode("off")}
            disabled={adMode === "off"}
            style={{
              padding: "2px 8px",
              border: "1px solid #dfe1e3",
              borderRadius: 4,
              background: adMode === "off" ? "#f4f5f6" : "#ffffff",
              color: adMode === "off" ? "#9ea3a8" : "#1d1f20",
              fontFamily: "inherit",
              fontSize: 11,
              cursor: adMode === "off" ? "default" : "pointer",
            }}>
            Off
          </button>
        </fieldset>
      </div>
      {/* Frame-size presets row sits below the ad mode toggle. */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12,
        }}>
        {DYNAMIC_PRESETS.map((p) => (
          <button
            key={`${p.w}x${p.h}`}
            type="button"
            onClick={() => applyPreset(p.w, p.h)}
            style={{
              padding: "6px 10px",
              border: "1px solid #dfe1e3",
              borderRadius: 6,
              background: "#ffffff",
              color: "#1d1f20",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              cursor: "pointer",
            }}>
            {p.w}×{p.h}
          </button>
        ))}
      </div>

      <div
        ref={frameRef}
        style={{
          width: 360,
          height: 600,
          minWidth: 150,
          minHeight: 80,
          resize: "both",
          overflow: "hidden",
          border: "1px solid #dfe1e3",
          borderRadius: 4,
          background: "#2a2d31",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
        {adMode === "display" ? (
          // Display mode: hide the video poster and render the
          // Figma backdrop from node 10089:29042 — a uniform 50 %
          // black wash stacked over a vertical gradient from the
          // creative's predominant colour at the top to dark gray
          // `#1D1F20` at the bottom. The top stop is sampled live
          // from the rendered display ad via `colorthief`; on first
          // paint (and on any CORS-tainted canvas read) we fall
          // back to the TOEFL mock creative's known yellow.
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), " +
                `linear-gradient(180deg, ${displayGradientTopStop} 0%, #1D1F20 100%)`,
              pointerEvents: "none",
              // Animate the colour swap so the gradient updates
              // smoothly when the sampled colour resolves a tick
              // after the image loads.
              transition: "background-image 200ms ease-out",
            }}
          />
        ) : adMode === "video" ? (
          // Video mode: hide the video poster behind the
          // design-system base layer (Figma 9563:113318 —
          // `bg-[rgba(255,255,255,0.4)]` with 5 px backdrop blur).
          // The frame's dark fill shows through the 40 % white
          // wash, producing the canonical grey backdrop.
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255, 255, 255, 0.40)",
              backdropFilter: "blur(5px)",
              pointerEvents: "none",
            }}
          />
        ) : (
          <StoryVideoBackdrop className="gencl:w-full gencl:h-full gencl:object-cover" asAbsolute />
        )}
        {/* Display ad: anchored to the frame's centre. Renders only
          when the picker found a size that fits — otherwise the
          slot stays empty so the player isn't crowded. */}
        {adMode === "display" && displaySize && (
          <MockDisplayAdContainer
            width={displaySize.w}
            height={displaySize.h}
            frameWidth={frameSize.w}
            frameHeight={frameSize.h}
          />
        )}
        {/* Video ad: fitted at the chosen aspect ratio, centred in
          the frame, touching one or both edges depending on whether
          the frame is wider or narrower than the ad's ratio. */}
        {adMode === "video" && (
          <MockVideoAdContainer ratio={videoRatio} frameWidth={frameSize.w} frameHeight={frameSize.h} />
        )}
        <div
          ref={linkoutRef}
          style={{
            zIndex: 1,
            width: "100%",
            // Sides handled by `panelFullClassName` (panel mx-2). Only
            // 8 px on top here; bottom flush so the dots hit the edge.
            padding: "8px 0 0",
            boxSizing: "border-box",
          }}>
          {adMode === "banner" ? (
            // Banner mode exercises the real production code path:
            // `<DynamicLinkouts content={{ kind: "banner-ad" }}>` →
            // `pickBannerAdSize` → `<LinkoutItem bannerAd>` →
            // `<GenAdContainer>` — with the `gen-ad-container`
            // module aliased to `_gen-ad-container-mock.tsx` in
            // `.storybook/main.ts` so the SDK never loads and the
            // visual output stays deterministic. The picker
            // suppresses the ad when the frame is shorter than
            // 200 px or narrower than 300 px per the design spec.
            <DynamicLinkouts
              links={[]}
              ctaText=""
              ctaLink=""
              isActive
              view="embed"
              layout="overlay"
              // Pass the same width/aspect inputs the link branch
              // uses so the embed scenario picker resolves to a
              // scenario whose `default` state defines a sensible
              // height — without this, the picker falls back to
              // `embed-xs` (a `pl-xs`-only scenario) which doesn't
              // define `heights["default"]` and the override
              // collapses the slot. `<DynamicLinkouts>` further
              // pins `heights.default` to `"auto"` in banner-ad
              // mode as a belt-and-braces.
              effectiveVideoWidth={effectiveVideoWidth}
              aspectRatio="16:9"
              analyticsEventData={buildLinkoutsAnalyticsData({})}
              disableAutoAdvance
              // The linkout slot here auto-fits content (so its own
              // height would be 0 until a banner mounts — chicken-
              // and-egg for the picker). Pass the player frame's
              // measured size explicitly so the picker can resolve
              // against the actual available space.
              adContainerSize={frameSize}
              content={{
                kind: "banner-ad",
                // Supply all three sizes so the in-component picker
                // resolves to the largest that fits the live frame.
                banner: BANNER_AD_SIZES.map((s) => ({
                  networkCode: "story-network",
                  adUnitPath: `/story/${s.w}x${s.h}`,
                  platform: "story",
                  size: [s.w, s.h] as [number, number],
                })),
              }}
            />
          ) : adMode === "display" || adMode === "video" ? null : ( // is intentionally empty. // above the video backdrop), so the bottom linkout area // `<MockDisplayAdContainer>` / `<MockVideoAdContainer>` // (rendered as a sibling of this slot — see the absolute // Display/video modes: the ad is anchored centrally above
            <DynamicLinkouts
              links={links}
              effectiveVideoWidth={effectiveVideoWidth}
              aspectRatio="16:9"
              ctaText={ctaText}
              ctaLink={ctaLink}
              isActive
              view="embed"
              layout="overlay"
              analyticsEventData={buildLinkoutsAnalyticsData({})}
              // No 3 s `default → expand-view` timer — the variant
              // here is driven exclusively by the frame width.
              disableAutoAdvance
            />
          )}
        </div>
      </div>

      <p
        style={{
          marginTop: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          color: "#585c61",
        }}>
        Frame:{" "}
        <b style={{ color: "#1d1f20" }}>
          {frameSize.w} × {frameSize.h} px
        </b>{" "}
        · {adMode === "off" ? "Variant" : adMode === "banner" ? "Banner" : adMode === "display" ? "Display" : "Video"}:{" "}
        <b style={{ color: "#1d1f20" }}>
          {adMode === "off"
            ? variant
            : adMode === "banner"
              ? bannerSize
                ? `${bannerSize.w}×${bannerSize.h}`
                : "hidden (frame too small)"
              : adMode === "display"
                ? displaySize
                  ? `${displaySize.w}×${displaySize.h}`
                  : "hidden (frame too small)"
                : videoRatio}
        </b>
      </p>
    </div>
  );
}

export const DynamicViewEmbed: Story = {
  name: "Dynamic View",
  render: () => <DynamicViewHarness />,
  parameters: {
    docs: {
      description: {
        story: `
**Resizable frame.** Drag the bottom-right corner of the frame (the native CSS \`resize: both\` handle), or click one of the presets above the frame to jump to a fixed size. The linkout variant adapts to the frame width via the same bucket logic the production scenario picker uses:

- ≤ 180 px → \`pl-xs\` (chip, text-only)
- 181–249 px → \`pl-sml\` (chip with thumbnail)
- 250–299 px → \`default\` (compact composite)
- 300–399 px → \`default-active\` (composite + header, auto-advances)
- ≥ 400 px → \`expand-view\` (rich card)

A small dimensions + variant readout sits below the frame so you can see exactly which bucket the picker landed in. Mirrors the standalone reference at \`/grid/linkout/index.html\`.
        `,
      },
    },
  },
};
