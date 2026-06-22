/**
 * @fileoverview Responsive (Wide) Linkout Stories
 *
 * Storybook stories for the new `responsive` sheet state — a single
 * self-contained wide card that fills its host container and adapts
 * its internal layout to the container's width AND height. The
 * variant table is:
 *
 *   - 4 size buckets (xlarge / large / medium / small) keyed off
 *     frame width (>600 / >400 / >200 / ≤200), AND
 *   - 2 content states (default / expand) toggled by the user, AND
 *   - 2 orientations (landscape / portrait) keyed off h > w.
 *
 * Per Figma node 9322:136877:
 * https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9322-136877&m=dev
 * See `RESPONSIVE_LINKOUT_PLAN.md` for the full layout matrix.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import {
  pickResponsiveOrientation,
  pickResponsiveSize,
} from "@genuin/components/molecules/linkout-new/use-responsive-card";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";

import { FeedContextStoryWrapper, useFrameSize, useSeededLinkoutState } from "./_story-helpers";
import { LINKOUT_FIGMA_CAROUSEL } from "./linkouts.fixtures";

// Sourced from packages/components/src/organisms/linkouts/linkouts.fixtures.ts
// (TOEFL / ETS reference content from the Figma design).
const SAMPLE_LINKS = LINKOUT_FIGMA_CAROUSEL;

// ── Presets — same dimensions the standalone reference offers ───
const PRESETS: ReadonlyArray<{ w: number; h: number }> = [
  { w: 800, h: 500 },
  { w: 600, h: 400 },
  { w: 300, h: 600 },
  { w: 320, h: 250 },
  { w: 300, h: 250 },
  { w: 320, h: 100 },
];

// ── Harness ─────────────────────────────────────────────────────

function ResponsiveHarness() {
  // Seeds device mode + parent sheet state ("responsive") + cleanup.
  useSeededLinkoutState({ initialState: "responsive" });

  // Inline checkboxes per Figma node 9322:136877 — one for the
  // content state (default vs expand), one for the debug grid
  // overlay.
  const [contentState, setContentState] = useState<"default" | "expand">("default");
  const [showGrid, setShowGrid] = useState(false);

  const currentLink = SAMPLE_LINKS[0];
  // Responsive layout's CTA is a fixed action verb per Figma node
  // 9322:136877, not the link title (the title is shown as the
  // card's headline above).
  const ctaText = "Sign Up Now";
  const ctaLink = currentLink?.link ?? "";

  // Resizable frame. CSS `resize: both` provides the bottom-right
  // drag handle. The hook attaches a ResizeObserver and tracks
  // `offsetWidth` / `offsetHeight` (= what the preset buttons
  // advertise).
  const { ref: frameRef, size: frame } = useFrameSize<HTMLDivElement>({
    w: 800,
    h: 500,
  });

  const applyPreset = (w: number, h: number) => {
    if (frameRef.current) {
      frameRef.current.style.width = `${w}px`;
      frameRef.current.style.height = `${h}px`;
    }
  };

  // Use the full fixture record (description / brand / prices /
  // rating / likes / downloads / phone / address) so the chips
  // wrap can demonstrate the overflow cascade in narrow frames.
  const links = SAMPLE_LINKS.map((s) => ({ ...s }));

  const size = pickResponsiveSize(frame.w);
  const orientation = pickResponsiveOrientation(frame.w, frame.h);

  const checkboxLabel: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    fontSize: 13,
    color: "#1d1f20",
  };

  return (
    <div>
      {/* Inline state + grid checkboxes per Figma node 9322:136877. */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 12,
        }}>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={contentState === "expand"}
            onChange={(e) => setContentState(e.target.checked ? "expand" : "default")}
          />
          expand
        </label>
        <label style={checkboxLabel}>
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
          grid
        </label>
      </div>

      {/* Preset buttons */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}>
        {PRESETS.map((p) => (
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

      {/* Resizable frame */}
      <div
        ref={frameRef}
        style={{
          width: 800,
          height: 500,
          minWidth: 150,
          minHeight: 120,
          resize: "both",
          overflow: "hidden",
          border: "1px solid #dfe1e3",
          borderRadius: 4,
          background: "#ffffff",
        }}>
        <DynamicLinkouts
          view="responsive"
          responsiveState={contentState}
          showResponsiveGrid={showGrid}
          links={links}
          ctaText={ctaText}
          ctaLink={ctaLink}
          isActive
          analyticsEventData={buildLinkoutsAnalyticsData({})}
          disableAutoAdvance
        />
      </div>

      {/* Stats line */}
      <p
        style={{
          marginTop: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          color: "#585c61",
        }}>
        Frame:{" "}
        <b style={{ color: "#1d1f20" }}>
          {frame.w} × {frame.h} px
        </b>{" "}
        · Variant:{" "}
        <b style={{ color: "#1d1f20" }}>
          {contentState}/{size}
        </b>{" "}
        · Orientation: <b style={{ color: "#1d1f20" }}>{orientation}</b>
      </p>
    </div>
  );
}

// ── Storybook meta ──────────────────────────────────────────────

const meta: Meta<typeof ResponsiveHarness> = {
  title: "Organisms/Linkouts/Dynamic Linkouts Responsive View",
  component: ResponsiveHarness,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <FeedContextStoryWrapper>
        <Story />
      </FeedContextStoryWrapper>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
**Responsive wide-card layout.** Single self-contained card that fills its host container; the internal layout adapts to the container's width AND height via the same picker the production scenario uses. See \`RESPONSIVE_LINKOUT_PLAN.md\`.

Drag the bottom-right corner of the frame, or click a preset, to see the layout switch between size buckets:

- **xlarge** — width > 600 px
- **large** — width > 400 px
- **medium** — width > 200 px
- **small** — width ≤ 200 px

The **expand** checkbox shows description + chips; default hides them. Orientation flips to portrait when height > width. When the details column can't fit everything, the overflow cascade hides description + chips first, then the CTA — title and thumbnail always stay.

The **grid** checkbox overlays the per-size column / row grid (5 / 4 / 3 / 3 cells) behind the card content for layout debugging.

Per Figma [node 9322:136877](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9322-136877&m=dev).
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResponsiveHarness>;

// ── Stories ─────────────────────────────────────────────────────

export const Responsive: Story = {
  name: "Responsive",
};
