/**
 * Production-fidelity Slot renderers for the dev shell.
 *
 * The library's `defaultSlotRenderers` (see `../default-slot-renderers`)
 * ship minimal wireframe placeholders so consumers like `@genuin/web-sdk`
 * stay free of the heavy `@genuin/components` tree. For the dev preview
 * we want what the page actually looks like, so the agent's QA loop
 * can see real cards and player-shaped video frames.
 *
 * This module is dev-only — `@genuin/components` is declared as a
 * `devDependency` of `@genuin/hierarchical-tree` and must never be
 * imported from `src/*` outside `src/dev/**`. The library's exports
 * (`@genuin/hierarchical-tree`, `./schema`, `./types`) stay free of
 * `@genuin/components` so the web SDK build keeps its current size.
 *
 * Design decision (see report alongside this PR): `DynamicLinkouts`
 * itself depends on five contexts (`BaseContextProvider`,
 * `EmbedProvider`, `AnalyticsProvider`, `LinkProvider`, `useSheetState`'s
 * base event bus). Mounting all five in the dev shell would more than
 * double its surface area. Instead we render the presentational
 * `<ResponsiveLinkCard>` — the same component `DynamicLinkouts view="responsive"`
 * mounts for each slide — directly per grid/carousel cell. Same visual
 * fidelity, no context tax.
 *
 * Video: the full `<VideoPlayer>` lazy-loads HLS + IMA SDKs per
 * instance, requires a real video source URL, and would race when
 * mounted N times in a grid. We render `<VideoPoster>` (the presentational
 * poster image used by `VideoPlayer` itself) inside the same aspect-ratio
 * frame, with a centered play-button overlay. The embed target div
 * stays so the production SDK can find and hydrate cells when the page
 * is mounted inside a real web-sdk host.
 */

import { ResponsiveLinkCard } from '@genuin/components/molecules/linkout-new/responsive-card';
import { VideoPoster } from '@genuin/ui/components/video-player';
import { Icon } from '@genuin/ui/icon';
import * as React from 'react';

import {
  VIDEO_ASPECT_CLASS,
  pickLinkoutWrapperStyle,
  pickSlotMaxHeight,
  pickVideoSlotHeightStyle,
  pickVideoWrapperStyle,
  type LinkoutCardData,
  type LinkoutProps,
  type VideoProps,
} from '../default-slot-renderers';
import type { SlotRenderer, SlotRenderers } from '../types';

// ---------- Linkout override ----------

/**
 * Project a {@link LinkoutCardData} entry onto the `LinkMetaData` shape
 * `<ResponsiveLinkCard>` consumes. Every field is optional — we forward
 * what the author supplied and drop the rest.
 */
function toLinkMetaData(card: LinkoutCardData): React.ComponentProps<typeof ResponsiveLinkCard>['data'] {
  return {
    link: card.href,
    title: card.title,
    image: card.imageUrl,
    description: card.description,
    brand: card.brand,
    website: card.website,
    originalPrice: card.originalPrice,
    currentPrice: card.currentPrice,
    rating: card.rating,
    likes: card.likes,
    downloads: card.downloads,
    phone: card.phone,
    address: card.address,
  };
}

const DevLinkoutSlotRenderer: SlotRenderer = function DevLinkoutSlot({ slot, props }) {
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
  const isCarousel = (slot.style ?? 'single') === 'carousel';
  const density = slot.density ?? 'default';
  // Numbered-rank prefix only fires for compact-density vertical stacks
  // (`cols=1`). Multi-column grids and carousels stay unprefixed —
  // ranks read as "ordered list" semantics that only make sense down
  // a single column.
  const showRankPrefix = density === 'compact' && (slot.cols ?? 1) === 1;
  // Semantic max-height cap. Vertical scroll on overflow keeps content
  // accessible without forcing the parent layout to grow.
  const maxHeightClass = pickSlotMaxHeight(slot);
  const overflowYClass = maxHeightClass && !isCarousel ? 'gencl:overflow-y-auto' : '';
  const wrapperClassName = `${className} ${maxHeightClass} ${overflowYClass}`.trim();

  return (
    <div
      data-slot-linkout={slot.name}
      data-slot-style={slot.style ?? 'single'}
      data-slot-cols={slot.cols}
      data-slot-rows={slot.rows}
      data-slot-density={density}
      data-slot-size={slot.size}
      className={wrapperClassName}
      style={wrapperStyle}>
      {cards.map((card, i) => {
        const key = card.id ?? `${slot.name}-${i}`;
        // Both densities go through the real `ResponsiveLinkCard`. Its
        // `state` prop is the production-correct compact toggle:
        //   - 'default' hides description + chips (compact-density)
        //   - 'expand'  shows everything (default-density)
        // Per `responsive-card.tsx` (line 466-467).
        const cardState = density === 'compact' ? 'default' : 'expand';
        const cellMinHeight = density === 'compact' ? 'gencl:min-h-[120px]' : 'gencl:min-h-[200px]';
        const card$ = (
          <ResponsiveLinkCard
            data={toLinkMetaData(card)}
            state={cardState}
            ctaText="Learn more"
            ctaLink={card.href}
            onCtaClick={() => {
              // The renderer is dev-only — opening a new tab keeps
              // the QA loop unaffected by router state and matches
              // the production CTA behaviour.
              if (typeof window !== 'undefined') {
                window.open(card.href, '_blank', 'noopener,noreferrer');
              }
            }}
          />
        );
        if (showRankPrefix) {
          const rank = String(i + 1).padStart(2, '0');
          return (
            <div key={key} className={`gencl:flex gencl:items-start gencl:gap-3 ${cellMinHeight}`}>
              <span className="gencl:text-headline-2-semi-bold gencl:text-secondary-300 gencl:font-bold gencl:shrink-0 gencl:leading-none gencl:pt-1">
                {rank}
              </span>
              <div className="gencl:flex-1 gencl:min-w-0">{card$}</div>
            </div>
          );
        }
        return (
          <div
            key={key}
            className={
              isCarousel
                ? `gencl:snap-start gencl:shrink-0 gencl:basis-72 ${cellMinHeight}`
                : cellMinHeight
            }>
            {card$}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Video override ----------

/**
 * One video cell — aspect-ratio'd frame with the poster image and a
 * play-button overlay. The hidden embed target stays so a production
 * SDK can still locate this cell by id when the same page is rendered
 * outside the dev shell.
 */
function DevVideoCell({
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
      className={`gencl:relative gencl:w-full gencl:bg-secondary-900 gencl:overflow-hidden gencl:rounded-md ${aspectClass} ${cellClass ?? ''}`}>
      {poster ? <VideoPoster src={poster} /> : null}
      {/* Play-button overlay — Figma "Big Play" affordance: 48px
          white-on-black circle centred. Keeps the cell visually
          identifiable as a player without mounting the heavy
          `<VideoPlayer>` (which lazy-loads HLS + IMA per instance). */}
      <div className="gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center gencl:pointer-events-none">
        <span className="gencl:flex gencl:items-center gencl:justify-center gencl:size-12 gencl:rounded-full gencl:bg-white/90 gencl:backdrop-blur-sm gencl:shadow-md">
          <Icon name="play" size="lg" tone="default" aria-label="" />
        </span>
      </div>
      <div
        id={elementId}
        data-genuin-embed-target="true"
        className="gencl:absolute gencl:inset-0 gencl:pointer-events-none"
      />
    </div>
  );
}

/**
 * SDK-aware extension of {@link VideoProps}. The agent never authors
 * these fields — the host (or this dev shell's fixture data) provides
 * them at render time so the real SDK can hydrate the slot.
 *
 * Fields are optional: when `styleId` and `placementId` are both
 * present we mount the real {@link https://www.npmjs.com/package/@genuin/web-sdk Genuin Web SDK}
 * embed for that slot. Otherwise we fall back to the production-fidelity
 * poster + play-overlay placeholder defined below.
 */
interface DevVideoProps extends VideoProps {
  /** SDK style id — pairs with `placementId`. */
  styleId?: string;
  /** SDK placement id, paired with `styleId`. */
  placementId?: string;
  /** SDK API key. May be supplied per-slot or as a dev-shell default. */
  apiKey?: string;
}

/**
 * One mount point for the real SDK to discover and hydrate. The SDK
 * (loaded via the CDN bundle in `index.html`) scans the DOM on
 * `window.genuin.init()` for elements whose `id` starts with `gen-sdk-`
 * (see `getAndSetDivs` in `packages/web-sdk/src/sdk/genuin-sdk.ts`) and
 * reads the embed config off the `data-*` attributes.
 *
 * Critical: one mount per Slot, regardless of `slot.cols` / `slot.rows`.
 * The SDK uses the `style_id` (e.g. `STANDARD_WALL`) to render the grid
 * or carousel layout internally — looping N times here would race N
 * concurrent embed inits against each other.
 */
function DevSdkEmbedMount({
  slotName,
  styleId,
  placementId,
  apiKey,
  aspectClass,
  fillHeight = false,
}: {
  slotName: string;
  styleId: string;
  placementId: string;
  apiKey: string;
  aspectClass: string;
  /**
   * When the slot governs its own height via `size` (no `aspect`), the
   * wrapper already carries an explicit height — so the embed frame must
   * fill it (`h-full`) rather than apply the aspect-ratio class. Applying
   * the aspect class in that case would force a width-driven height that
   * overflows the sized wrapper and clips the SDK's natural layout (e.g. a
   * full-width reel strip towering to width×16/9).
   */
  fillHeight?: boolean;
}): React.ReactElement {
  // `gen-sdk-` prefix is the SDK's discovery contract. Per-slot ids
  // keep multiple video slots on one page from colliding.
  const containerId = `gen-sdk-${slotName}`;
  const frameClass = fillHeight
    ? 'gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:rounded-md'
    : `gencl:relative gencl:w-full gencl:overflow-hidden gencl:rounded-md ${aspectClass}`;
  return (
    <div className={frameClass}>
      <div
        id={containerId}
        className="gencl:absolute gencl:inset-0"
        data-api-key={apiKey}
        data-style-id={styleId}
        data-placement-id={placementId}
      />
    </div>
  );
}

const DevVideoSlotRenderer: SlotRenderer = function DevVideoSlot({ slot, props }) {
  const config = (props as DevVideoProps) ?? {};
  const baseElementId = config.elementId ?? `genuin-embed-${slot.name}`;
  const aspect = config.aspectRatio ?? 'video';
  const aspectClass = VIDEO_ASPECT_CLASS[aspect];
  const slotStyle = slot.style ?? 'feed';
  const isCarousel = slotStyle === 'carousel';
  // Explicit height style on the outer wrapper. Mirrors how publisher
  // hosts mount the SDK — The Artitech demo's `print.html` sets
  // `div.style.height = p.height + 'px'` per `placements.json`. The SDK
  // fills the exact dimensions the host provides; max-height would clip
  // the SDK's natural render (e.g. portrait reel carousels need >500px).
  // We also clip overflow so SDK content that renders taller doesn't
  // bleed visually into sibling slots below.
  const heightStyle = pickVideoSlotHeightStyle(slot);
  const overflowClass = heightStyle ? 'gencl:overflow-hidden' : '';

  // Real SDK mount path: when the host supplies `styleId` and
  // `placementId` we render exactly one SDK target div per Slot. The
  // SDK's style_id config controls the internal layout (grid/carousel/
  // feed) — we deliberately do NOT loop `slot.cols × slot.rows` here.
  if (config.styleId && config.placementId && config.apiKey) {
    return (
      <div
        data-slot-video={slot.name}
        data-slot-style={slotStyle}
        data-slot-cols={slot.cols}
        data-slot-rows={slot.rows}
        data-slot-size={slot.size}
        data-slot-sdk-mount="true"
        className={overflowClass || undefined}
        style={heightStyle}>
        <DevSdkEmbedMount
          slotName={slot.name}
          styleId={config.styleId}
          placementId={config.placementId}
          apiKey={config.apiKey}
          aspectClass={aspectClass}
          fillHeight={Boolean(heightStyle)}
        />
      </div>
    );
  }

  // Fallback: poster + play-overlay placeholder. Used when the host
  // hasn't wired SDK config for this Slot — keeps the QA loop visual
  // even without an API round-trip.
  const { className, style: wrapperStyle, cellCount } = pickVideoWrapperStyle(slot);

  if (cellCount === 1) {
    return (
      <div
        data-slot-video={slot.name}
        data-slot-style={slotStyle}
        data-slot-cols={slot.cols}
        data-slot-rows={slot.rows}
        data-slot-size={slot.size}
        className={overflowClass || undefined}
        style={heightStyle}>
        <DevVideoCell elementId={baseElementId} aspectClass={aspectClass} poster={config.poster} />
      </div>
    );
  }

  const mergedStyle: React.CSSProperties | undefined =
    heightStyle || wrapperStyle ? { ...wrapperStyle, ...heightStyle } : undefined;
  return (
    <div
      data-slot-video={slot.name}
      data-slot-style={slotStyle}
      data-slot-cols={slot.cols}
      data-slot-rows={slot.rows}
      data-slot-size={slot.size}
      className={`${className} ${overflowClass}`.trim()}
      style={mergedStyle}>
      {Array.from({ length: cellCount }, (_, i) => (
        <DevVideoCell
          key={`${slot.name}-${i}`}
          elementId={`${baseElementId}-${i}`}
          aspectClass={aspectClass}
          poster={config.poster}
          cellClass={isCarousel ? 'gencl:snap-start gencl:shrink-0 gencl:basis-64' : ''}
        />
      ))}
    </div>
  );
};

// ---------- Registry ----------

/**
 * Partial slot-renderer override the dev shell hands to
 * `<PageRenderer slotRenderers={...}>`. The library's `content` default
 * (markdown rendering) is already production-fidelity, so we don't
 * override it here.
 */
export const devSlotRenderers: Partial<SlotRenderers> = {
  linkout: DevLinkoutSlotRenderer,
  video: DevVideoSlotRenderer,
};
