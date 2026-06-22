import { Image } from "@genuin/ui/image";
import { Link } from "@genuin/ui/link";
import { Heading, Text } from "@genuin/ui/typography";
import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";

import type { SlotKind, SlotNode } from "./schema";
import type { ResolvedSlotProps, SlotRenderer, SlotRenderers } from "./types";

/**
 * Default Slot renderers — the v0 placeholders the walker ships
 * (spec §3.6 seam, locked decisions in
 * {@link HIERARCHICAL_TREE_RUNTIME_WALKER_PLAN.md}).
 *
 * - `content` — renders the body markdown via `react-markdown` with
 *   the constrained allowlist + custom-component mappings that route
 *   markdown nodes to Genuin DS primitives (Heading / Text / Link /
 *   Image).
 * - `video` — renders a placeholder that assumes the host wraps the
 *   page in `<SDKProvider>` (web-sdk). Production wiring of the
 *   embed element happens here, but for v0 we emit a slot-sized
 *   placeholder div with stable data attributes the SDK can target.
 * - `linkout` — renders a placeholder card. Production swaps in
 *   `<DynamicLinkouts view="responsive">` from `@genuin/components`,
 *   but for v0 the walker stays free of `@genuin/components` to
 *   avoid the circular-dependency risk.
 *
 * The heavy lifting (real player embed, real linkout card) belongs to
 * the host's `slotRenderers` override or future composite work.
 */

// ---------- Shared decorators ----------

/**
 * Closed max-height scale for the `slot.size` decorator (linkout /
 * content wrappers). Inline-style CSS values — Tailwind cannot pre-
 * compile arbitrary `max-h-[…]` values, and emitting raw px classes
 * would violate the closed-vocabulary rule.
 *
 * - `'xs'`      → 180px (tight thumbnail strips).
 * - `'compact'` → 300px (thumbnail strips, below-fold ad grids).
 * - `'sm'`      → 420px (mid-range carousels).
 * - `'default'` → 500px (standard hero carousel placements).
 * - `'lg'`      → 600px (larger hero placements).
 * - `'hero'`    → 700px (full-width hero feeds).
 * - `'screen'`  → 100vh (full-bleed viewport-height placements).
 *
 * When `slot.size` is omitted, returns `undefined` — the slot sizes
 * itself from its content (preserves v0 behaviour).
 */
const SIZE_MAX_HEIGHT: Record<NonNullable<SlotNode['size']>, string> = {
  xs: '180px',
  compact: '300px',
  sm: '420px',
  default: '500px',
  lg: '600px',
  hero: '700px',
  screen: '100vh',
};

/**
 * Closed minimum-height scale for the `slot.minHeight` decorator.
 * Applied as inline `minHeight` on the slot's outer wrapper so the
 * slot reserves space while SDK/data load is in flight.
 */
const MIN_HEIGHT_VALUE: Record<NonNullable<SlotNode['minHeight']>, string> = {
  none: '0',
  sm: '180px',
  md: '300px',
  lg: '420px',
  hero: '600px',
};

/**
 * Closed aspect-ratio scale for the `slot.aspect` decorator. Maps to
 * an inline `aspectRatio` style on the slot's outer wrapper. For
 * `video` slots, aspect drives the rendered geometry; `size` (if also
 * set) becomes a max-height cap on top.
 */
const ASPECT_RATIO: Record<NonNullable<SlotNode['aspect']>, string> = {
  reel: '9 / 16',
  square: '1 / 1',
  video: '16 / 9',
  portrait: '3 / 4',
  landscape: '4 / 3',
  banner: '21 / 9',
};

/**
 * Resolve the inline-style payload for the `size` / `aspect` /
 * `minHeight` decorators on the slot's outer wrapper. Returns
 * `undefined` when no decorator is set so the call site can avoid
 * emitting an empty `style` attribute.
 *
 * Semantics:
 * - `aspect` on a `video` slot maps to `aspectRatio` (the slot's
 *   intrinsic geometry). `size` becomes `maxHeight` (a cap).
 * - `aspect` on a `linkout` slot maps to `aspectRatio` on the wrapper
 *   too — practical for square / banner card frames.
 * - When `aspect` is absent, `size` maps to `maxHeight` for linkout
 *   slots and (separately, via {@link pickVideoSlotHeightStyle}) to
 *   `height` for video slots so the SDK fills exactly the container.
 * - `minHeight` always maps verbatim.
 */
export function pickSlotWrapperStyle(slot: SlotNode): React.CSSProperties | undefined {
  const out: React.CSSProperties = {};
  if (slot.aspect) {
    out.aspectRatio = ASPECT_RATIO[slot.aspect];
    // When aspect is set, `size` is a cap — never the driving height.
    if (slot.size) {
      out.maxHeight = SIZE_MAX_HEIGHT[slot.size];
    }
  }
  if (slot.minHeight && slot.minHeight !== 'none') {
    out.minHeight = MIN_HEIGHT_VALUE[slot.minHeight];
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

/**
 * Backward-compatible max-height style for linkout / content wrappers
 * when `slot.aspect` is NOT set. Kept as a small wrapper so existing
 * call sites continue to read clearly.
 */
export function pickSlotMaxHeight(slot: SlotNode): React.CSSProperties | undefined {
  if (slot.aspect) return undefined;
  if (!slot.size) return undefined;
  return { maxHeight: SIZE_MAX_HEIGHT[slot.size] };
}

/**
 * Explicit height style for video slots — matches how publisher hosts
 * mount the Genuin SDK (see The Artitech demo's `print.html` ~line 2178,
 * where each SDK div is given an inline `height: NNNpx` from
 * `placements.json` so the SDK fills the exact container the host
 * provided). Linkout / content slots use `pickSlotMaxHeight` instead
 * (max-height + scroll preserves data).
 *
 * When `slot.aspect` is set on a video slot, returns `undefined` —
 * aspect drives the geometry, and `size` (if any) is folded into the
 * wrapper as `maxHeight` via {@link pickSlotWrapperStyle}.
 *
 * Returns `undefined` when no size is set so the wrapper falls back to
 * content-driven sizing.
 */
export function pickVideoSlotHeightStyle(slot: SlotNode): React.CSSProperties | undefined {
  if (slot.aspect) return undefined;
  if (!slot.size) return undefined;
  return { height: SIZE_MAX_HEIGHT[slot.size] };
}

// ---------- Content renderer ----------

interface ContentProps extends ResolvedSlotProps {
  /** Markdown body string, parsed and rendered through the allowlist. */
  body?: string;
}

/**
 * The allowed markdown → component mapping for the `content` Slot.
 *
 * Decisions:
 * - `h1` is intentionally absent — the spec reserves h1 for the
 *   page-level `heading` UI node.
 * - `h2` → `headline-3`, `h3` → `headline-4` (DS scale).
 * - Paragraphs are rendered with `<Text size="body-0">`.
 * - Images render as a `<figure>` with optional caption (the markdown
 *   `title` becomes the caption text).
 * - Code blocks (` ``` `) and tables are not enabled.
 * - HTML passthrough is off by default in `react-markdown` v10 — the
 *   walker does NOT enable `rehype-raw`.
 */
const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => (
    <Text as="p" size="body-0">
      {children}
    </Text>
  ),
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  a: ({ href, children, title }) => {
    if (href === undefined) return <>{children}</>;
    const external = /^https?:\/\//i.test(href);
    return (
      <Link href={href} external={external} title={title}>
        {children}
      </Link>
    );
  },
  ul: ({ children }) => <ul className="gencl:list-disc gencl:pl-6 gencl:space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="gencl:list-decimal gencl:pl-6 gencl:space-y-1">{children}</ol>,
  li: ({ children }) => (
    <li>
      <Text as="span" size="body-0">
        {children}
      </Text>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="gencl:border-l-4 gencl:border-primary gencl:pl-4 gencl:italic">
      <Text as="p" size="body-0">
        {children}
      </Text>
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="gencl:font-mono gencl:bg-secondary-50 gencl:px-1 gencl:rounded-sm gencl:text-body-1-medium">
      {children}
    </code>
  ),
  h2: ({ children }) => (
    <Heading level="headline-3" as="h2">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading level="headline-4" as="h3">
      {children}
    </Heading>
  ),
  img: ({ src, alt, title }) => {
    if (!src) return null;
    return (
      <figure>
        <Image src={typeof src === "string" ? src : undefined} alt={alt ?? ""} />
        {title ? (
          <figcaption>
            <Text as="span" size="body-2">
              {title}
            </Text>
          </figcaption>
        ) : null}
      </figure>
    );
  },
  // H4-H6 and code blocks are out of v0 scope — render as plain Text
  // so unexpected markdown doesn't blow up the page.
  h4: ({ children }) => (
    <Text as="p" size="body-0" weight="semibold">
      {children}
    </Text>
  ),
  h5: ({ children }) => (
    <Text as="p" size="body-0" weight="semibold">
      {children}
    </Text>
  ),
  h6: ({ children }) => (
    <Text as="p" size="body-0" weight="semibold">
      {children}
    </Text>
  ),
  pre: ({ children }) => <pre className="gencl:font-mono gencl:text-body-1-medium">{children}</pre>,
};

const ContentSlotRenderer: SlotRenderer = function ContentSlot({ slot, props }) {
  const { body } = (props as ContentProps) ?? {};
  // Guard for an empty body — render nothing rather than an empty
  // wrapper. The validator should catch this, but defending is cheap.
  // `minHeight` is the only dimension decorator that affects content
  // slots — markdown bodies size themselves vertically, but reserving
  // space prevents layout shift when the body is empty/loading.
  const minHeightStyle =
    slot.minHeight && slot.minHeight !== 'none'
      ? { minHeight: MIN_HEIGHT_VALUE[slot.minHeight] }
      : undefined;
  if (typeof body !== "string" || body.trim() === "") {
    return (
      <div
        data-slot-content={slot.name}
        data-empty="true"
        aria-hidden="true"
        style={minHeightStyle}
      />
    );
  }
  // Lead-paragraph styling: target the first `<p>` rendered inside the
  // content body via the `:first-of-type` selector on the wrapper. Keeps
  // `MARKDOWN_COMPONENTS.p` stateless instead of threading a counter.
  // The Tailwind arbitrary-variant `[&>p:first-of-type]:…` compiles to
  // `[data-slot-content] > p:first-of-type { … }` per `tailwindcss` v4.
  return (
    <div
      data-slot-content={slot.name}
      data-slot-min-height={slot.minHeight}
      style={minHeightStyle}
      className={
        "gencl:space-y-4 " +
        "gencl:[&>p:first-of-type]:text-body-0 " +
        "gencl:[&>p:first-of-type]:border-l-4 " +
        "gencl:[&>p:first-of-type]:border-primary " +
        "gencl:[&>p:first-of-type]:pl-4 " +
        "gencl:[&>p:first-of-type]:italic"
      }>
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>{body}</ReactMarkdown>
    </div>
  );
};

// ---------- Video renderer ----------

export interface VideoProps extends ResolvedSlotProps {
  /** Embed element id the SDK targets; defaults to `genuin-embed-${slot.name}`. */
  elementId?: string;
  /** Optional poster image, rendered behind the player until the SDK loads. */
  poster?: string;
  /** Aspect ratio for the placeholder. Defaults to `'video'` (16:9). */
  aspectRatio?: "video" | "reel" | "square" | "portrait" | "landscape" | "auto";
}

/**
 * Shared aspect-ratio class map. Exported so the dev shell's
 * production-fidelity slot renderer can match the placeholder's
 * aspect ratio without duplicating the table.
 */
export const VIDEO_ASPECT_CLASS: Record<NonNullable<VideoProps["aspectRatio"]>, string> = {
  video: "gencl:aspect-video",
  reel: "gencl:aspect-reel",
  square: "gencl:aspect-square",
  portrait: "gencl:aspect-[3/4]",
  landscape: "gencl:aspect-[4/3]",
  auto: "",
};

/**
 * Render a single video placeholder cell — the aspect-ratio'd div the
 * SDK embed target sits inside. Pulled out so the parent renderer can
 * emit a single cell (`feed`/single) or N cells (`grid`/`carousel`).
 */
function VideoPlaceholderCell({
  elementId,
  aspectClass,
  poster,
  cellClass,
}: {
  elementId: string;
  aspectClass: string;
  poster?: string;
  cellClass?: string;
}): React.ReactElement {
  return (
    <div
      className={`gencl:relative gencl:w-full gencl:bg-secondary-100 gencl:overflow-hidden gencl:rounded-md ${aspectClass} ${cellClass ?? ""}`}>
      {poster ? (
        <img
          src={poster}
          alt=""
          className="gencl:absolute gencl:inset-0 gencl:w-full gencl:h-full gencl:object-cover"
        />
      ) : null}
      <div
        id={elementId}
        data-genuin-embed-target="true"
        className="gencl:absolute gencl:inset-0"
      />
    </div>
  );
}

/**
 * Resolve the wrapper layout for a multi-cell video placeholder. Mirrors
 * `pickLinkoutWrapperStyle` — Tailwind JIT can't pre-compile a dynamic
 * `grid-cols-${cols}`, so the dynamic value lives in inline style.
 *
 * - `style: 'feed'` (or omitted) → single cell, no wrapper layout.
 * - `style: 'carousel'` → horizontal flex row, `cols` cells, scrollable.
 * - `style: 'grid'` → CSS Grid `cols × rows` cells.
 */
export function pickVideoWrapperStyle(slot: SlotNode): {
  className: string;
  style?: React.CSSProperties;
  cellCount: number;
} {
  const style = slot.style ?? "feed";
  if (style === "grid") {
    const cols = Math.max(1, slot.cols ?? 1);
    const rows = Math.max(1, slot.rows ?? 1);
    return {
      className: "gencl:grid gencl:gap-3",
      style: { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` },
      cellCount: cols * rows,
    };
  }
  if (style === "carousel") {
    const cols = Math.max(1, slot.cols ?? 1);
    return {
      className: "gencl:flex gencl:gap-3 gencl:overflow-x-auto gencl:snap-x gencl:pb-2",
      cellCount: cols,
    };
  }
  return { className: "", cellCount: 1 };
}

/**
 * Video slot — emits a placeholder div that the host's Web SDK can
 * target by `elementId`. Per the locked decision, the walker does
 * NOT mount `<SDKProvider>`; the host supplies it at the page root
 * and the SDK looks for embed targets by id.
 *
 * The placeholder honours `slot.style` for visual hints (feed / grid /
 * carousel) but the SDK does the real rendering once it locates the
 * element. For multi-cell styles, each cell gets a derived elementId
 * (`<base>-<index>`) so the SDK can target individual slots.
 *
 * Density (v0): `slot.density` is accepted by the schema but this
 * renderer does NOT differentiate yet. Compact video cells land in
 * v1 (the placeholder will shrink its aspect frame for dense
 * thumbnail strips). For now, default and compact render identically.
 */
const VideoSlotRenderer: SlotRenderer = function VideoSlot({ slot, props }) {
  const config = (props as VideoProps) ?? {};
  const baseElementId = config.elementId ?? `genuin-embed-${slot.name}`;
  const aspect = config.aspectRatio ?? "video";
  const aspectClass = VIDEO_ASPECT_CLASS[aspect];
  const { className, style: wrapperStyle, cellCount } = pickVideoWrapperStyle(slot);
  const isCarousel = (slot.style ?? "feed") === "carousel";
  // Video slots use EXPLICIT height (not max-height) when `size` is
  // set — this mirrors how publisher hosts mount the SDK, e.g. The
  // Artitech demo's `print.html` sets `div.style.height = p.height +
  // 'px'` from `placements.json`. The SDK fills the exact dimensions
  // the host gave it; max-height would clip the SDK's natural render.
  // We also clip overflow so SDK content that exceeds the container
  // doesn't bleed visually into sibling slots below.
  const heightStyle = pickVideoSlotHeightStyle(slot);
  const sizingStyle = pickSlotWrapperStyle(slot);
  // Clip overflow whenever the wrapper has an explicit height OR an
  // aspect-ratio so SDK content that exceeds the container doesn't
  // bleed visually into sibling slots below.
  const overflowClass = heightStyle || slot.aspect ? "gencl:overflow-hidden" : "";

  if (cellCount === 1) {
    const singleStyle: React.CSSProperties | undefined =
      heightStyle || sizingStyle ? { ...heightStyle, ...sizingStyle } : undefined;
    return (
      <div
        data-slot-video={slot.name}
        data-slot-style={slot.style ?? "feed"}
        data-slot-cols={slot.cols}
        data-slot-rows={slot.rows}
        data-slot-size={slot.size}
        data-slot-aspect={slot.aspect}
        data-slot-min-height={slot.minHeight}
        className={overflowClass || undefined}
        style={singleStyle}>
        <VideoPlaceholderCell
          elementId={baseElementId}
          aspectClass={aspectClass}
          poster={config.poster}
        />
      </div>
    );
  }

  const mergedStyle: React.CSSProperties | undefined =
    heightStyle || wrapperStyle || sizingStyle
      ? { ...wrapperStyle, ...heightStyle, ...sizingStyle }
      : undefined;
  return (
    <div
      data-slot-video={slot.name}
      data-slot-style={slot.style ?? "feed"}
      data-slot-cols={slot.cols}
      data-slot-rows={slot.rows}
      data-slot-size={slot.size}
      data-slot-aspect={slot.aspect}
      data-slot-min-height={slot.minHeight}
      className={`${className} ${overflowClass}`.trim()}
      style={mergedStyle}>
      {Array.from({ length: cellCount }, (_, i) => (
        <VideoPlaceholderCell
          key={`${slot.name}-${i}`}
          elementId={`${baseElementId}-${i}`}
          aspectClass={aspectClass}
          poster={config.poster}
          cellClass={isCarousel ? "gencl:snap-start gencl:shrink-0 gencl:basis-64" : ""}
        />
      ))}
    </div>
  );
};

// ---------- Linkout renderer ----------

export interface LinkoutCardData {
  id?: string;
  title: string;
  description?: string;
  href: string;
  imageUrl?: string;
  // Optional rich fields surfaced by the Figma `ResponsiveLinkCard` meta
  // row. Dropped silently by the default minimal renderer; consumed by
  // the dev shell's production-fidelity override. Adding them here keeps
  // the slot-data shape singular across renderers.
  brand?: string;
  website?: string;
  originalPrice?: string;
  currentPrice?: string;
  rating?: string;
  likes?: string;
  downloads?: string;
  phone?: string;
  address?: string;
}

export interface LinkoutProps extends ResolvedSlotProps {
  /** One card per linkout. In production, swap to `<DynamicLinkouts>`. */
  cards?: LinkoutCardData[];
}

/**
 * Resolve the wrapper layout for a linkout placeholder from the Slot's
 * decorator hints. Returns a class string + an optional inline style
 * (used for the dynamic `grid-template-columns` value, which Tailwind's
 * JIT can't pre-compile from a runtime number).
 *
 * - `style: 'single'` (or undefined) → vertical column.
 * - `style: 'grid'` → CSS Grid with `cols` columns; `rows` is a soft
 *   cap (overflow scrolls naturally).
 * - `style: 'carousel'` → horizontal flex row that scrolls on overflow.
 */
export function pickLinkoutWrapperStyle(slot: SlotNode): {
  className: string;
  style?: React.CSSProperties;
} {
  const style = slot.style ?? "single";
  if (style === "grid") {
    const cols = Math.max(1, slot.cols ?? 1);
    return {
      className: "gencl:grid gencl:gap-3",
      style: { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` },
    };
  }
  if (style === "carousel") {
    return {
      className: "gencl:flex gencl:gap-3 gencl:overflow-x-auto gencl:snap-x gencl:pb-2",
    };
  }
  return { className: "gencl:flex gencl:flex-col gencl:gap-3" };
}

/**
 * Resolve per-card chrome classes for a linkout card based on the
 * Slot's `density` decorator. Pulled out so the JSX below stays
 * readable.
 *
 * - `'compact'` — smaller thumb (12 × 12), tighter padding (`p-2`),
 *   no description block. The card stays clickable. Renders at
 *   roughly half the height of a default card.
 * - `'default'` (or omitted) — current chrome (16 × 16 thumb, `p-3`,
 *   description shown).
 */
function pickLinkoutCardChrome(density: SlotNode["density"]): {
  rootPadding: string;
  thumbSize: string;
  showDescription: boolean;
} {
  if (density === "compact") {
    return {
      rootPadding: "gencl:p-2",
      thumbSize: "gencl:w-12 gencl:h-12",
      showDescription: false,
    };
  }
  return {
    rootPadding: "gencl:p-3",
    thumbSize: "gencl:w-16 gencl:h-16",
    showDescription: true,
  };
}

/**
 * Linkout slot — emits a minimal responsive card grid as a v0
 * placeholder. Production hosts swap to
 * `<DynamicLinkouts view="responsive">` from `@genuin/components`
 * via the `slotRenderers` override.
 *
 * Honors `slot.density`:
 * - `'compact'` → smaller thumb (~48px), tighter padding, no
 *   description / "Learn more" / meta row. Card stays clickable
 *   (`<a>` wrapper). Roughly half the height of a default card.
 * - `'default'` (or omitted) → unchanged chrome.
 */
const LinkoutSlotRenderer: SlotRenderer = function LinkoutSlot({ slot, props }) {
  const cards = (props as LinkoutProps)?.cards ?? [];
  if (cards.length === 0) {
    return (
      <div
        data-slot-linkout={slot.name}
        data-empty="true"
        className="gencl:rounded-md gencl:bg-secondary-50 gencl:p-4 gencl:text-body-2-medium gencl:text-secondary-600">
        No linkouts available.
      </div>
    );
  }
  const { className, style: wrapperStyle } = pickLinkoutWrapperStyle(slot);
  const isCarousel = (slot.style ?? "single") === "carousel";
  const density = slot.density ?? "default";
  const { rootPadding, thumbSize, showDescription } = pickLinkoutCardChrome(density);
  // Semantic dimension caps applied via inline style — Tailwind cannot
  // pre-compile arbitrary `max-h-[…]` values from the closed enum, and
  // emitting raw px utility classes would violate the closed-vocabulary
  // rule. Vertical scroll on overflow so authors can over-author cards
  // without losing them; horizontal carousels already scroll on the X
  // axis so the Y cap simply trims height.
  const maxHeightStyle = pickSlotMaxHeight(slot);
  const sizingStyle = pickSlotWrapperStyle(slot);
  const overflowYClass = maxHeightStyle && !isCarousel ? "gencl:overflow-y-auto" : "";
  const mergedStyle: React.CSSProperties | undefined =
    wrapperStyle || maxHeightStyle || sizingStyle
      ? { ...wrapperStyle, ...maxHeightStyle, ...sizingStyle }
      : undefined;
  const wrapperClassName = `${className} ${overflowYClass}`.trim();
  return (
    <div
      data-slot-linkout={slot.name}
      data-slot-style={slot.style ?? "single"}
      data-slot-cols={slot.cols}
      data-slot-rows={slot.rows}
      data-slot-density={density}
      data-slot-size={slot.size}
      data-slot-aspect={slot.aspect}
      data-slot-min-height={slot.minHeight}
      className={wrapperClassName}
      style={mergedStyle}>
      {cards.map((card, i) => {
        const key = card.id ?? `${slot.name}-${i}`;
        return (
          <a
            key={key}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`gencl:flex gencl:gap-3 gencl:rounded-md gencl:border gencl:border-secondary-150 ${rootPadding} gencl:bg-white gencl:hover:bg-secondary-50 gencl:transition-colors gencl:no-underline ${isCarousel ? "gencl:snap-start gencl:shrink-0 gencl:basis-64" : ""}`}>
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt=""
                className={`${thumbSize} gencl:rounded-sm gencl:object-cover gencl:shrink-0`}
              />
            ) : null}
            <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:min-w-0">
              <Text as="span" size="body-1" weight="semibold">
                {card.title}
              </Text>
              {showDescription && card.description ? (
                <Text as="span" size="body-2">
                  {card.description}
                </Text>
              ) : null}
            </div>
          </a>
        );
      })}
    </div>
  );
};

// ---------- Registry ----------

/**
 * Closed SlotKind → SlotRenderer map.
 *
 * Per the spec, the registry is closed at the walker level (the AI
 * generator emits only these three kinds). Hosts override entries
 * via `slotRenderers` on `<PageRenderer>` — e.g. to mount the real
 * `<DynamicLinkouts>` from `@genuin/components` instead of the
 * placeholder card grid.
 */
export const defaultSlotRenderers: SlotRenderers = {
  content: ContentSlotRenderer,
  video: VideoSlotRenderer,
  linkout: LinkoutSlotRenderer,
};

/**
 * Helper for hosts: merge a partial slot-renderer override into the
 * defaults. Internal but exported for the `PageRenderer` test suite.
 */
export function mergeSlotRenderers(
  partial: Partial<SlotRenderers> | undefined,
): SlotRenderers {
  if (!partial) return defaultSlotRenderers;
  return { ...defaultSlotRenderers, ...partial };
}

// Type-safety re-export used internally by `PageRenderer` and tests.
export type { SlotKind, SlotNode };
