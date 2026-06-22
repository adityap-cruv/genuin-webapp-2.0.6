/**
 * @fileoverview Outside View Linkout Stories
 *
 * Storybook stories for `<DynamicLinkouts>` with `layout="outside"`.
 * Unlike the embed (overlay) layout — which renders the linkout on
 * top of the video — outside layout attaches the linkout below the
 * video as a *sibling*: the player has only its top corners rounded
 * (`rounded-tl-lg rounded-tr-lg`), the linkout has only its bottom
 * corners rounded (`rounded-bl-lg rounded-br-lg`), and the two share
 * a flush edge.
 *
 * Per Figma `10076:79915` (layout) and `10075:76988` (light-theme
 * colour palette). The five stories mirror the per-state embed
 * stories (`PlacementXSEmbed` etc.) so reviewers can compare the
 * inside-vs-outside chrome side-by-side.
 *
 * @see dynamic-linkout-embed.stories.tsx for the inside (overlay) layout
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";

import { FeedContextStoryWrapper, StoryVideoBackdrop, useFrameSize, useSeededLinkoutState } from "./_story-helpers";
import { LINKOUT_FIGMA_CAROUSEL, LINKOUT_FIGMA_CTA } from "./linkouts.fixtures";

// Reuse the same TOEFL / ETS fixture content the embed stories use
// so the inside-vs-outside comparison is apples-to-apples.
const SAMPLE_LINKS = LINKOUT_FIGMA_CAROUSEL;

type OutsideHarnessProps = {
  /** Forwarded to `<DynamicLinkouts>`'s `effectiveVideoWidth` and used as
   *  the host frame width. The width is what the scenario picker uses to
   *  resolve `embed-outside-{xs,sml,default,active,expand}` per
   *  `linkouts-sheet-config.ts:111-115`:
   *  ≤180 → `embed-outside-xs`, <250 → `-sml`, <300 → `-default`,
   *  <400 → `-active`, ≥400 → `-expand`.
   *  @default 360 (lands in `embed-outside-active`) */
  width?: number;
  /** Story-controlled initial state. Outside layout supports the same
   *  per-width-bucket states as inside — chip stories pass `pl-xs` /
   *  `pl-sml`, panel-style stories pass `default` / `default-active` /
   *  `expand-view`. */
  initialState?: "default" | "default-active" | "expand-view" | "pl-xs" | "pl-sml";
  /** Forward every field on the fixture (description, brand, prices,
   *  rating, likes, downloads, phone, address) to `<DynamicLinkouts>`.
   *  Default `false` keeps the existing minimal projection. */
  richData?: boolean;
};

/**
 * Harness for the outside-layout stories. Renders the video frame
 * and the linkout slot as **vertical siblings** (block stack) so the
 * linkout sits below the player rather than overlaying it. The video
 * frame's bottom edge attaches flush to the linkout panel's top edge
 * via the matching `rounded-t-lg` / `rounded-t-none` pair.
 *
 * The chrome around the video frame (rounded top corners, dark
 * background) lives inline here — it's storybook-only design dressing
 * and doesn't warrant a shared helper until a second consumer needs
 * it.
 */
function OutsideHarness({ width = 360, initialState = "default-active", richData = false }: OutsideHarnessProps) {
  // Match the embed harness's seeding so `<DynamicLinkouts>` reads
  // the right state on first render. Outside layout always uses
  // desktop matchMedia — the mobile-expand scenarios never reach the
  // outside scenario branch in the picker.
  useSeededLinkoutState({ initialState, deviceMode: "desktop" });

  const currentLink = SAMPLE_LINKS[0];
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

  // Frame width follows the embed harness pattern: the linkout's
  // intended width plus the 8 px gutter on each side that the chip
  // states would otherwise have, floored at 280 so even narrow
  // states render at a legible frame size in storybook.
  const frameWidth = Math.max(width + 16, 280);

  return (
    <div style={{ width: `${frameWidth}px`, margin: "0 auto" }}>
      {/* Video frame — rounded top corners only, bottom flush against
        the linkout panel. Background matches Figma `bg-[#131415]`. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "640px",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          overflow: "hidden",
          backgroundColor: "#131415",
        }}>
        <StoryVideoBackdrop className="gencl:w-full gencl:h-full gencl:object-cover" asAbsolute />
      </div>
      {/* Linkout sibling — `layout="outside"` resolves the scenario
        picker to `embed-outside-*` and the panel className applies
        the bottom-only rounding (`OUTSIDE_PANEL_CLASS`) so the
        chrome matches the frame above. `effectiveVideoWidth` drives
        the width-bucket pick. */}
      <DynamicLinkouts
        links={links}
        effectiveVideoWidth={width}
        aspectRatio="9:16"
        ctaText={ctaText}
        ctaLink={ctaLink}
        isActive
        view="embed"
        layout="outside"
        analyticsEventData={buildLinkoutsAnalyticsData({})}
      />
    </div>
  );
}

const meta: Meta<typeof OutsideHarness> = {
  title: "Organisms/Linkouts/Dynamic Linkouts Outside View",
  component: OutsideHarness,
  // Docs tab is sourced from `dynamic-linkouts-outside-view.doc.mdx`
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
          "Outside view reference stories for Dynamic Linkouts. The linkout sits below the " +
          "video frame as a sibling (light-theme white panel) instead of overlaying it. Use these " +
          "stories to compare the inside vs outside chrome at each width bucket.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof OutsideHarness>;

export const PlacementXSOutside: Story = {
  name: "Placement XS (≤180 px)",
  args: {
    width: 160,
    initialState: "pl-xs",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Narrow outside (≤180 px) — picker selects `embed-outside-xs`, render branch `pl-xs`. " +
          "The chip variant keeps the existing transparent chrome (no panel surface); the bottom-rounded " +
          "treatment in `OUTSIDE_PANEL_CLASS` doesn't apply.",
      },
    },
  },
};

export const PlacementSMLOutside: Story = {
  name: "Placement SML (181–249 px)",
  args: {
    width: 220,
    initialState: "pl-sml",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Medium-narrow outside (181–249 px) — picker selects `embed-outside-sml`. Same chip-style " +
          "transparent chrome as `pl-xs`; bottom-rounded panel treatment doesn't apply.",
      },
    },
  },
};

export const DefaultOutside: Story = {
  name: "Default",
  args: {
    width: 260,
    initialState: "default",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default state — picker selects `embed-outside-default` (250–299 px). Compact light-theme " +
          "panel sitting flush below the video frame, with rounded bottom corners. " +
          "**Auto-advances to `expand-view` after 3 s** per scenario parity with the embed flow.",
      },
    },
  },
};

export const DefaultActiveOutside: Story = {
  name: "Default Active",
  args: {
    width: 360,
    initialState: "default-active",
    richData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default-active state — picker selects `embed-outside-active` (300–399 px). Light-theme panel " +
          "with the rich linkout card (thumbnail + title + CTA pill). **Auto-advances to `expand-view` " +
          "after 3 s** per scenario parity.",
      },
    },
  },
};

export const ExpandViewOutside: Story = {
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
          "Expand-view state — picker selects `embed-outside-expand` (≥400 px). Rich light-theme panel " +
          "with full metadata (description, brand, prices, rating, likes, downloads, phone, address) and " +
          "the dark `Sign Up Now` CTA pill from Figma `10075:76988`.",
      },
    },
  },
};

// ── Dynamic View ────────────────────────────────────────────────────
// Resizable frame mirror of the embed `DynamicViewEmbed` story, but
// rendered in the outside (below-the-frame, sibling) chrome. The
// linkout sits below the resizable video frame; drag the frame's
// bottom-right corner (`resize: both`) or click a preset to pick a
// size. The linkout variant follows the frame width through the same
// bucket logic the production scenario picker uses for
// `embed-outside-*` (mirrors `linkouts-sheet-config.ts:111-115`).

const DYNAMIC_PRESETS = [
  { w: 300, h: 600 },
  { w: 320, h: 480 },
  { w: 360, h: 480 },
  { w: 420, h: 600 },
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

// Width passed to `<DynamicLinkouts>` so the scenario picker lands on
// the `embed-outside-*` scenario that matches the resolved variant.
// Needed when the height-based step-down picks a smaller variant than
// the frame's raw width would — without this the chip would render
// inside the larger scenario's chrome.
function variantScenarioWidth(v: DynamicVariant): number {
  switch (v) {
    case "pl-xs":
      return 170; // ≤ 180 → embed-outside-xs
    case "pl-sml":
      return 220; // < 250 → embed-outside-sml
    case "default":
      return 270; // < 300 → embed-outside-default
    case "default-active":
      return 360; // < 400 → embed-outside-active
    case "expand-view":
      return 450; // ≥ 400 → embed-outside-expand
  }
}

function DynamicViewOutsideHarness() {
  // Seed the parent sheet to `default` and force desktop matchMedia
  // so the picker resolves through the desktop `embed-outside-*`
  // branch rather than `expand-mobile`.
  const { setContentTypeState } = useSeededLinkoutState({
    initialState: "default",
    deviceMode: "desktop",
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
  const ctaText = LINKOUT_FIGMA_CTA.ctaText;
  const ctaLink = currentLink?.link ?? "";

  const { ref: frameRef, size: frameSize } = useFrameSize<HTMLDivElement>({
    w: 360,
    h: 480,
  });
  const linkoutRef = useRef<HTMLDivElement>(null);

  // Width-bucket variant first, then step down if the linkout panel
  // is taller than half the frame. Same threshold as the embed
  // dynamic harness so the two pickers stay in lock-step.
  const widthVariant = widthBucketState(frameSize.w);
  const widthIdx = VARIANT_ORDER.indexOf(widthVariant);
  const [stepDown, setStepDown] = useState(0);
  useEffect(() => {
    setStepDown(0);
  }, [widthVariant, frameSize.h]);
  const variantIdx = Math.max(0, widthIdx - stepDown);
  const variant = VARIANT_ORDER[variantIdx] ?? widthVariant;

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
    timer = setTimeout(check, settleDelayMs);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [frameSize.h, variantIdx]);

  useEffect(() => {
    setContentTypeState("linkouts", variant);
  }, [setContentTypeState, variant]);

  const applyPreset = (w: number, h: number) => {
    if (frameRef.current) {
      frameRef.current.style.width = `${w}px`;
      frameRef.current.style.height = `${h}px`;
    }
  };

  const effectiveVideoWidth = variantScenarioWidth(variant);

  return (
    <div>
      {/* Frame-size presets. No ad-mode controls in the outside
        view — outside layout is purely the link-card chrome. */}
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

      {/* Video frame — resizable. Rounded top corners only; the
        bottom is flush against the linkout panel below. */}
      <div
        ref={frameRef}
        style={{
          width: 360,
          height: 480,
          minWidth: 150,
          minHeight: 120,
          resize: "both",
          overflow: "hidden",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          background: "#131415",
          position: "relative",
        }}>
        <StoryVideoBackdrop className="gencl:w-full gencl:h-full gencl:object-cover" asAbsolute />
      </div>

      {/* Linkout sibling. Width tracks the frame's live width so the
        two share a flush edge; the linkout's own `OUTSIDE_PANEL_CLASS`
        applies the bottom-only rounded corners. */}
      <div ref={linkoutRef} style={{ width: `${frameSize.w}px` }}>
        <DynamicLinkouts
          links={links}
          effectiveVideoWidth={effectiveVideoWidth}
          aspectRatio="9:16"
          ctaText={ctaText}
          ctaLink={ctaLink}
          isActive
          view="embed"
          layout="outside"
          analyticsEventData={buildLinkoutsAnalyticsData({})}
          disableAutoAdvance
        />
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
        · Variant: <b style={{ color: "#1d1f20" }}>{variant}</b>
      </p>
    </div>
  );
}

export const DynamicViewOutside: Story = {
  name: "Dynamic View",
  render: () => <DynamicViewOutsideHarness />,
  parameters: {
    docs: {
      description: {
        story: `
**Resizable frame, outside chrome.** Drag the bottom-right corner of the frame (the native CSS \`resize: both\` handle), or click one of the presets above the frame to jump to a fixed size. The linkout sits below the frame as a sibling (light-theme white panel, bottom-rounded corners) and the variant adapts to the frame width via the same bucket logic the production \`embed-outside-*\` picker uses:

- ≤ 180 px → \`pl-xs\` (chip, text-only)
- 181–249 px → \`pl-sml\` (chip with thumbnail)
- 250–299 px → \`default\` (compact light-theme panel)
- 300–399 px → \`default-active\` (light-theme panel + header)
- ≥ 400 px → \`expand-view\` (rich light-theme card)

A dimensions + variant readout sits below the frame so you can see exactly which bucket the picker landed in. Mirrors the embed view's Dynamic View story.
        `,
      },
    },
  },
};
