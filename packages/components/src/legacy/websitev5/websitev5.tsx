"use client";

import { Avatar } from "@genuin/ui/components/avatar";
import { Button } from "@genuin/ui/components/button";
import { Checkbox } from "@genuin/ui/components/checkbox";
import { Chip } from "@genuin/ui/components/chip";
import { BadgeCheck, ChevronLeft, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { ManagedVideo } from "@genuin/components/legacy/grid/managed-video";
import { PlaybackCoordinator } from "@genuin/components/legacy/grid/playback-coordinator";
import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { MiniLinkoutCard } from "@genuin/components/molecules/linkout-new/mini-linkout-card";
import { StandaloneLinkout } from "@genuin/components/molecules/linkout-new/standalone-linkout";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import { LINKOUT_FIGMA_CAROUSEL } from "@genuin/components/organisms/linkouts/linkouts.fixtures";
import { useFeed } from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { GenuinEmbedCarousel } from "./genuin-embed-carousel";
import {
  ENVIRONMENT_CAPTIONS,
  META_PANEL_ENTRIES,
  type MetaPanelEntry,
  MORE_STYLES_CTA,
  MORE_STYLES_LINKOUTS,
  STAT_LINKOUT_CTA,
  STAT_LINKOUTS,
  TITLE_DESCRIPTION,
  TITLE_TAG,
} from "./websitev5.fixtures";

/**
 * Reusable empty analytics payload for `<DynamicLinkouts>` instances
 * on this static demo page. The hook payload is identical per cell —
 * computing it once at module scope avoids re-allocating on every
 * render.
 */
const ROW_LINKOUT_ANALYTICS = buildLinkoutsAnalyticsData({});

/**
 * Deterministic per-cell video selection. Identical pattern to the
 * helper in `legacy/grid/grid.tsx`; duplicated rather than extracted
 * because the function is 6 lines.
 */
function pickVideo(videos: PostDetailsType[], seed: string): PostDetailsType | undefined {
  if (videos.length === 0) return undefined;
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return videos[sum % videos.length];
}

/**
 * `/websitev5` demo page. Reproduces the Figma design at node
 * `4838-146779` using `<ManagedVideo>` + `<DynamicLinkouts>` for the
 * slot cells (single-active playback coordinated by
 * `<PlaybackCoordinator>`) and `packages/ui` primitives for every
 * static piece (sidebar, title, meta panel, chips, headers).
 *
 * Single desktop layout — no breakpoints. Page chrome (top nav,
 * footer) is owned by the `(site)` route layout.
 */
export function WebsiteV5() {
  const { data } = useFeed("HOME");
  const videos = useMemo<PostDetailsType[]>(() => data?.pages.flatMap((p) => p.feed) ?? [], [data]);

  /**
   * When `true`, Row 1 renders with the page's Figma-tuned override
   * (`<MiniLinkoutCard>`) and Rows 2 / 5 hide the
   * `<DynamicLinkouts layout="outside">` thumbnails via page-level
   * CSS (the square video above each cell already supplies the
   * visual). When `false`, Row 1 falls back to plain
   * `<StandaloneLinkout>` and Rows 2 / 5 keep the linkout's own
   * thumbnail / brand-logo fallback visible — i.e. the untouched
   * design-system output for comparison.
   *
   * Default `true` matches what was on the page before the toggle
   * existed.
   */
  const [overrideStyles, setOverrideStyles] = useState<boolean>(true);

  return (
    <PlaybackCoordinator>
      {/* The site's `<body>` is `position: fixed; height: 100vh`
        (see apps/webapp/src/app/globals.css), so every page owns its
        own scroll container. Without this wrapper the page would be
        clipped to the viewport. The `(site)` layout already provides
        the global left nav — no in-page sidebar here. */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}>
        <main className="gencl:mx-auto gencl:flex gencl:w-full gencl:max-w-[1280px] gencl:flex-col gencl:gap-10 gencl:px-8 gencl:py-8">
          <PageHeader overrideStyles={overrideStyles} onToggleOverrideStyles={setOverrideStyles} />
          <Row1ContentProgramming overrideStyles={overrideStyles} />
          <Row2StatLinkouts overrideStyles={overrideStyles} videos={videos} />
          <Row4Environment videos={videos} />
          <Row5MoreStyles overrideStyles={overrideStyles} videos={videos} />
        </main>
      </div>
    </PlaybackCoordinator>
  );
}

// ─── Page header — Figma 4840-149395 ──────────────────────────────────

/**
 * Top-of-page header matching Figma node 4840-149395. Two-column
 * layout: left = status chip + h1 + description + button row;
 * right = 7-row meta panel with dashed separators. A circular back
 * button sits at the very top.
 */
function PageHeader({
  overrideStyles,
  onToggleOverrideStyles,
}: {
  overrideStyles: boolean;
  onToggleOverrideStyles: (next: boolean) => void;
}) {
  return (
    <header className="gencl:flex gencl:flex-col gencl:gap-4">
      <div className="gencl:flex gencl:items-center gencl:gap-4">
        <BackButton />
        {/* Debug toggle — flips Row 1 between the Figma-tuned
          `<MiniLinkoutCard>` override and the plain
          `<StandaloneLinkout>` default, and on Rows 2 / 5 hides the
          outside-linkout thumbnails via page CSS (the square video
          already supplies the visual). Off shows the untouched
          design-system output. Default on. */}
        <label
          htmlFor="websitev5-override-styles"
          className="gencl:inline-flex gencl:cursor-pointer gencl:items-center gencl:gap-2 gencl:text-body-1-medium gencl:text-secondary-700">
          <Checkbox
            id="websitev5-override-styles"
            data-testid="websitev5-override-styles"
            checked={overrideStyles}
            onCheckedChange={(next) => onToggleOverrideStyles(next === true)}
          />
          Override styles
        </label>
      </div>
      <div className="gencl:flex gencl:items-start gencl:gap-12">
        <div className="gencl:flex gencl:min-w-0 gencl:flex-1 gencl:flex-col gencl:gap-4">
          {/* Status chip — Figma 4840-146896. Green pill
            (`bg-[#E4F5D1] text-[#30520A]`), `body-2-medium` (12/16),
            `px-2 py-1`, `rounded-sm`. `w-fit` keeps the chip from
            stretching to fill the flex column. The Chip primitive's
            base font-weight is semi-bold with `!` so we override with
            `body-2-medium!`. */}
          <Chip
            variant="default"
            rounded="small"
            className="gencl:w-fit gencl:bg-[#E4F5D1]! gencl:px-2 gencl:py-1 gencl:text-body-2-medium! gencl:text-[#30520A]!">
            {TITLE_TAG}
          </Chip>
          {/* Figma 4840-146900: Headline 2 Semi-Bold, 32/36, -0.2 ls,
            color #212529. */}
          <h1 className="gencl:text-headline-2-semi-bold gencl:text-[#212529] gencl:tracking-[-0.2px]">
            Gross Merchandise Volume
          </h1>
          {/* Body 0 Medium description — Figma 4840-146901. */}
          <p className="gencl:text-body-0-medium gencl:text-[#495057]">{TITLE_DESCRIPTION}</p>
          <div className="gencl:flex gencl:items-stretch gencl:gap-2">
            {/* Generate PDF — Figma 4840-146903. */}
            <Button
              theme="secondaryDark"
              size="md"
              type="button"
              className="gencl:bg-secondary-900! gencl:pl-2 gencl:pr-4 gencl:hover:bg-secondary-800!">
              <WandSparkles className="gencl:size-6" />
              Generate PDF
            </Button>
            {/* See live examples — Figma 4840-146904. */}
            <Button
              theme="outline"
              size="md"
              type="button"
              className="gencl:border-primary-200! gencl:text-secondary-900">
              See live examples
            </Button>
          </div>
        </div>
        <MetaPanel entries={META_PANEL_ENTRIES} />
      </div>
    </header>
  );
}

/**
 * Circular back button — Figma node 4840:146886. Concentric translucent
 * dark circles with a backdrop blur and a 24px chevron-left glyph.
 */
function BackButton() {
  return (
    <button
      type="button"
      aria-label="Back"
      data-testid="websitev5-back"
      className="gencl:flex gencl:size-12 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-[rgba(19,20,21,0.2)] gencl:backdrop-blur-[7.5px]">
      <span className="gencl:flex gencl:size-10 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-[rgba(19,20,21,0.4)] gencl:backdrop-blur-[7.5px]">
        <ChevronLeft className="gencl:size-6 gencl:text-white" />
      </span>
    </button>
  );
}

/**
 * 373px wide meta panel — 7 rows of `label · dashed separator · value`
 * with two special-cased shapes (Placement Owner with avatar +
 * verified badge; Revenue Potential with bold value + suffix).
 */
function MetaPanel({ entries }: { entries: MetaPanelEntry[] }) {
  return (
    <dl
      data-testid="websitev5-meta-panel"
      className="gencl:flex gencl:w-[373px] gencl:shrink-0 gencl:flex-col gencl:gap-2">
      {entries.map((entry) => (
        <MetaRow key={entry.label} entry={entry} />
      ))}
    </dl>
  );
}

function MetaRow({ entry }: { entry: MetaPanelEntry }) {
  return (
    <div className="gencl:flex gencl:h-5 gencl:items-center gencl:gap-6">
      <dt className="gencl:shrink-0 gencl:text-body-1-semi-bold gencl:text-secondary-700">{entry.label}</dt>
      <span aria-hidden="true" className="gencl:flex-1 gencl:border-t gencl:border-dashed gencl:border-secondary-200" />
      <dd className="gencl:flex gencl:shrink-0 gencl:items-center gencl:gap-1">
        {entry.avatarUrl && (
          <Avatar
            isAvatar={false}
            imageUrl={entry.avatarUrl}
            alt={entry.value}
            size="xs"
            imageClassName="gencl:object-cover"
          />
        )}
        {entry.valueSuffix ? (
          <p className="gencl:text-body-1-medium gencl:text-secondary-700">
            <span className={entry.emphasizeValue ? "gencl:text-body-1-semi-bold gencl:text-secondary-900" : undefined}>
              {entry.value}
            </span>
            <span>{entry.valueSuffix}</span>
          </p>
        ) : (
          <p className="gencl:text-body-1-medium gencl:text-secondary-700">{entry.value}</p>
        )}
        {entry.verified && (
          <BadgeCheck className="gencl:size-3 gencl:fill-primary gencl:text-white" aria-hidden="true" />
        )}
      </dd>
    </div>
  );
}

// ─── Row 1 — Content programming template ─────────────────────────────

function Row1ContentProgramming({ overrideStyles }: { overrideStyles: boolean }) {
  return (
    <section className="gencl:flex gencl:flex-col gencl:gap-4">
      <h2 className="gencl:text-headline-3-semi-bold gencl:text-secondary-900">
        Content programming template across connected consumer journey
      </h2>
      <div className="gencl:grid gencl:items-start gencl:gap-6" style={{ gridTemplateColumns: "746px 320px" }}>
        {/* Genuin Web SDK carousel placement in the left cell —
          replaces the previous 4:3 `<ManagedVideo>` preview. Loads
          `gen_sdk.min.js` from begenuin.com and calls
          `window.genuin.init(...)` with the demo placement IDs. The
          parent box is sized to the Figma placement (746×526) and the
          SDK fills 100%. */}
        <div
          className="gencl:relative gencl:overflow-hidden gencl:rounded-xl gencl:bg-secondary-900"
          style={{ width: 746, height: 526 }}>
          <GenuinEmbedCarousel
            styleId="69c294770970fa2b49e10ff8"
            placementId="69c294770970fa2b49e10ff7"
            apiKey="87ff6635b778331da1a7e2709dc6978c433f26247ac2b931"
          />
        </div>
        <div className="gencl:flex gencl:flex-col gencl:gap-3">
          {/* Both modes pull from the ETS ads fixture
            (`LINKOUT_FIGMA_CAROUSEL`) so the rich `LinkData` fields —
            title, description, brand, prices, rating — are populated
            regardless of which card variant renders. The mode
            switches only the *renderer*: `<MiniLinkoutCard>` (Figma
            override) vs plain `<StandaloneLinkout>` (DS default). */}
          {Array.from({ length: 5 }, (_, i) => {
            const link = LINKOUT_FIGMA_CAROUSEL[i % LINKOUT_FIGMA_CAROUSEL.length];
            if (!link) return null;
            return overrideStyles ? (
              <MiniLinkoutCard key={`row1-${i}`} link={link} />
            ) : (
              <StandaloneLinkout
                key={`row1-${i}`}
                link={link}
                ctaText="Learn More"
                ctaLink={link.link}
                orientation="landscape"
                aspectRatio="320 / 96"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Row 2 — Stat-image linkouts (replaces Figma stat cards) ──────────

function Row2StatLinkouts({ overrideStyles, videos }: { overrideStyles: boolean; videos: PostDetailsType[] }) {
  // Each cell pairs a square `<ManagedVideo>` with a flush-attached
  // `<DynamicLinkouts layout="outside">` panel — the linkout sits as
  // a sibling immediately below the video, sharing a flush horizontal
  // seam (Figma 10076:79915 layout, 10075:76988 light-theme chrome).
  return (
    <SplitVideoLinkoutSection
      idPrefix="websitev5/row2"
      links={STAT_LINKOUTS}
      ctaText={STAT_LINKOUT_CTA}
      videos={videos}
      overrideStyles={overrideStyles}
    />
  );
}

// ─── Row 4 — "Based on your environment" videos ───────────────────────

function Row4Environment({ videos }: { videos: PostDetailsType[] }) {
  return (
    <section className="gencl:flex gencl:flex-col gencl:gap-4">
      <h2 className="gencl:text-headline-3-semi-bold gencl:text-secondary-900">Based on your environment</h2>
      <div className="gencl:grid gencl:gap-6" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {ENVIRONMENT_CAPTIONS.map((caption, i) => {
          const id = `websitev5/row4/${i}`;
          const post = pickVideo(videos, id);
          return (
            <div key={id} className="gencl:flex gencl:flex-col gencl:gap-2">
              <div
                className="gencl:relative gencl:overflow-hidden gencl:rounded-xl gencl:bg-secondary-900"
                style={{ aspectRatio: "9 / 16" }}>
                {post && post.video ? (
                  <ManagedVideo
                    id={id}
                    src={post.video.source}
                    poster={post.video.thumbnailM ?? post.video.thumbnail}
                  />
                ) : (
                  <div className="gencl:absolute gencl:inset-0 gencl:bg-secondary-900" />
                )}
              </div>
              <p className="gencl:text-body-1-semi-bold gencl:text-secondary-700">{caption}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Row 5 — "More styles to discover" linkouts ───────────────────────

function Row5MoreStyles({ overrideStyles, videos }: { overrideStyles: boolean; videos: PostDetailsType[] }) {
  return (
    <section className="gencl:flex gencl:flex-col gencl:gap-4">
      <h2 className="gencl:text-headline-3-semi-bold gencl:text-secondary-900">More styles to discover</h2>
      <SplitVideoLinkoutSection
        idPrefix="websitev5/row5"
        links={MORE_STYLES_LINKOUTS}
        ctaText={MORE_STYLES_CTA}
        videos={videos}
        overrideStyles={overrideStyles}
      />
    </section>
  );
}

/**
 * Renders a 3-column grid where each cell stacks a square
 * `<ManagedVideo>` on top of a `<DynamicLinkouts layout="outside">`
 * linkout panel attached flush to its bottom edge. The video has
 * rounded top corners only; the linkout panel (`OUTSIDE_PANEL_CLASS`
 * in `linkouts-sheet-config.ts`) has rounded bottom corners only, so
 * the two share a flush horizontal seam.
 *
 * `effectiveVideoWidth={280}` pins the scenario picker to
 * `embed-outside-default` — the 250–299 px bucket whose initial state
 * is `default` per Figma 10075:76988. The picker actually merges
 * `-default` and `-active` into the same config, so any width in the
 * 250–399 px range yields the same panel chrome and the
 * `default` initial state the user expects. `disableAutoAdvance`
 * keeps the panel pinned to that initial state instead of auto-
 * expanding to `expand-view` after 3 s.
 */
const SECTION_LINKOUT_EFFECTIVE_WIDTH = 280;

/**
 * Page-local CSS overrides used when `overrideStyles` is on.
 *
 * 1. Hide the linkout's thumbnail. The square video above each cell
 *    already supplies the visual, but `<LinkoutItem>` falls back to
 *    the BaseContext's `brandDetails.logo` when `link.image` is null,
 *    so passing a null image at the call site isn't enough to
 *    suppress it. We target the `<LinkCardThumb>` wrapper (the only
 *    element inside the slot that carries `gencl:aspect-square`)
 *    with `display: none` and collapse its parent grid from
 *    `grid-cols-[auto_1fr]` back to a single column so the title /
 *    inline-CTA stack consumes the full panel width.
 *
 * 2. Shrink the inline-CTA pill to its content width. By default the
 *    pill stretches to fill the details column (no thumbnail = full
 *    panel width). For these compact cells we want the dark "Get
 *    Started" button to hug the label + chevron and left-align inside
 *    the panel, matching the Figma 10075:76988 outside-card chrome
 *    where the CTA is a discrete affordance rather than a full-width
 *    bar. The CTA is the only `<a>` element inside the linkout slot.
 *
 * Scoped via the `data-website-v5-thumbless-linkout` attribute on the
 * cell wrapper so these only affect the websitev5 rows and not any
 * other consumer of `<DynamicLinkouts>`.
 */
const THUMBLESS_LINKOUT_STYLE = `
[data-website-v5-thumbless-linkout] [data-slot="dynamic-linkouts"] span[class*="aspect-square"] {
  display: none !important;
}
[data-website-v5-thumbless-linkout] [data-slot="dynamic-linkouts"] [class*="grid-cols-[auto"] {
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 0 !important;
}
[data-website-v5-thumbless-linkout] [data-slot="dynamic-linkouts"] a {
  width: fit-content !important;
  align-self: flex-start !important;
  flex-grow: 0 !important;
}
`;

function SplitVideoLinkoutSection({
  idPrefix,
  links,
  ctaText,
  videos,
  overrideStyles,
}: {
  idPrefix: string;
  links: LinkData[];
  ctaText: string;
  videos: PostDetailsType[];
  overrideStyles: boolean;
}) {
  return (
    <div
      className="gencl:grid gencl:items-start gencl:gap-6"
      style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
      {overrideStyles && <style>{THUMBLESS_LINKOUT_STYLE}</style>}
      {links.map((link, i) => {
        const id = `${idPrefix}/video/${i}`;
        const post = pickVideo(videos, id);
        return (
          <div
            key={link.link}
            className="gencl:flex gencl:flex-col"
            data-website-v5-thumbless-linkout={overrideStyles ? true : undefined}>
            <div
              className="gencl:relative gencl:overflow-hidden gencl:rounded-t-xl gencl:bg-secondary-900"
              style={{ aspectRatio: "1 / 1" }}>
              {post && post.video ? (
                <ManagedVideo id={id} src={post.video.source} poster={post.video.thumbnailM ?? post.video.thumbnail} />
              ) : (
                <div className="gencl:absolute gencl:inset-0 gencl:bg-secondary-900" />
              )}
            </div>
            <DynamicLinkouts
              links={[link]}
              ctaText={ctaText}
              ctaLink={link.link}
              isActive
              view="embed"
              layout="outside"
              aspectRatio="1:1"
              effectiveVideoWidth={SECTION_LINKOUT_EFFECTIVE_WIDTH}
              disableAutoAdvance
              analyticsEventData={ROW_LINKOUT_ANALYTICS}
            />
          </div>
        );
      })}
    </div>
  );
}
