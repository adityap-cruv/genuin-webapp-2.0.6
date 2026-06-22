"use client";
import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import { Star, Heart, Download, ExternalLink, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import type { SheetState } from "@genuin/components/context/base/event-bus";

import { LinkCardInlineCta, LinkCardThumb, MarqueeText } from "./link-card-primitives";
import { ResponsiveLinkCard, type FlexRatio } from "./responsive-card";

export interface LinkMetaData {
  // from LinkData
  link: string;
  title?: string | null;
  image?: string | null;
  // static until added to LinkData
  description?: string | null;
  brand?: string | null;
  website?: string | null;
  originalPrice?: string | null;
  currentPrice?: string | null;
  rating?: string | null;
  likes?: string | null;
  downloads?: string | null;
  phone?: string | null;
  address?: string | null;
}

function MetaRow({
  brand,
  website,
  originalPrice,
  currentPrice,
  rating,
  likes,
  downloads,
  phone,
  address,
  theme = "dark",
  textClassName = "",
}: Pick<
  LinkMetaData,
  "brand" | "website" | "originalPrice" | "currentPrice" | "rating" | "likes" | "downloads" | "phone" | "address"
> & { theme?: "light" | "dark"; textClassName?: string }) {
  const hasAny = brand || website || originalPrice || currentPrice || rating || likes || downloads || phone || address;

  if (!hasAny) return null;

  const sep = (key: string) => (
    <span key={`sep-${key}`} className="gencl:shrink-0">
      •
    </span>
  );

  const items: React.ReactNode[] = [];

  if (brand)
    items.push(
      <span key="brand" className="gencl:shrink-0 gencl:whitespace-nowrap">
        {brand}
      </span>
    );
  if (website) {
    if (items.length > 0) items.push(sep("website"));
    items.push(
      <span key="website" className="gencl:shrink-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap">
        {website}
      </span>
    );
  }
  if (originalPrice || currentPrice) {
    if (items.length > 0) items.push(sep("price"));
    items.push(
      <span key="price" className="gencl:flex gencl:gap-1 gencl:items-center gencl:shrink-0 gencl:whitespace-nowrap">
        {originalPrice && <span className="gencl:line-through gencl:opacity-80">{originalPrice}</span>}
        {currentPrice && <span className="gencl:font-bold">{currentPrice}</span>}
      </span>
    );
  }
  if (rating) {
    if (items.length > 0) items.push(sep("rating"));
    items.push(
      <span key="rating" className="gencl:flex gencl:items-center gencl:gap-1 gencl:shrink-0 gencl:whitespace-nowrap">
        <Star className="gencl:size-3 gencl:shrink-0" />
        {rating}
      </span>
    );
  }
  if (likes) {
    if (items.length > 0) items.push(sep("likes"));
    items.push(
      <span key="likes" className="gencl:flex gencl:items-center gencl:gap-1 gencl:shrink-0 gencl:whitespace-nowrap">
        <Heart className="gencl:size-3 gencl:shrink-0" />
        {likes}
      </span>
    );
  }
  if (downloads) {
    if (items.length > 0) items.push(sep("downloads"));
    items.push(
      <span
        key="downloads"
        className="gencl:flex gencl:items-center gencl:gap-1 gencl:shrink-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap">
        <Download className="gencl:size-3 gencl:shrink-0" />
        {downloads}
      </span>
    );
  }
  if (phone) {
    if (items.length > 0) items.push(sep("phone"));
    items.push(
      <span key="phone" className="gencl:shrink-0 gencl:whitespace-nowrap">
        {phone}
      </span>
    );
  }
  if (address) {
    if (items.length > 0) items.push(sep("address"));
    items.push(
      <span
        key="address"
        className="gencl:shrink-0 gencl:min-w-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap">
        {address}
      </span>
    );
  }

  return (
    <div
      className={cn(
        // `items-center` keeps the bullet separators vertically aligned
        // with chips that contain icons (rating ⭐, likes ♥, downloads ⬇)
        // — `items-start` pushed the bullets to the top edge of the
        // line box, leaving them visibly higher than the icon chips.
        "gencl:flex gencl:flex-wrap gencl:gap-1 gencl:items-center gencl:w-full",
        textClassName
      )}>
      {items}
    </div>
  );
}

export function LinkCard({
  data,
  sheetState,
  theme = "dark",
  onClick,
  ctaText,
  ctaLink,
  onCtaClick,
  responsiveState = "default",
  showResponsiveGrid = false,
  forceOrientation,
  ctaClassName,
  forceFlexRatio,
  hideThumb,
}: {
  data: LinkMetaData;
  sheetState: SheetState;
  theme?: "light" | "dark";
  onClick?: () => void;
  /** Page-level CTA text. Currently only consumed by the `default`
   *  state, which renders the CTA pill inline next to the title (Figma
   *  8244-20303). Other states ignore these props because the CTA
   *  lives in the sheet's footer slot. */
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: (e: React.MouseEvent) => void;
  /** For `sheetState === "responsive"`: which content state to show
   *  inside the wide card. `"default"` hides description + chips,
   *  `"expand"` shows everything. */
  responsiveState?: "default" | "expand";
  /** Storybook-only debug overlay for the responsive card —
   *  renders the grid columns / rows. */
  showResponsiveGrid?: boolean;
  /** Override `<ResponsiveLinkCard>`'s auto-detected orientation
   *  (`"portrait"` = image on top, `"landscape"` = image on left).
   *  Used by hosts that need a deterministic layout regardless of
   *  measured aspect ratio. Only consumed by the `responsive` branch. */
  forceOrientation?: "portrait" | "landscape";
  /** Extra classes merged onto the responsive card's CTA pill. */
  ctaClassName?: string;
  /** Override the responsive card's auto-picked thumb/details flex
   *  ratio. Forwarded through to `<ResponsiveLinkCard>`. */
  forceFlexRatio?: FlexRatio;
  /** Skip rendering the responsive card's thumb area. Used by hosts
   *  that composite their own preview (e.g. a video) above the
   *  card. Forwarded through to `<ResponsiveLinkCard>`. */
  hideThumb?: boolean;
}) {
  const isDark = theme === "dark";
  const textPrimary = isDark ? "gencl:text-white" : "gencl:text-secondary-900";
  const textSecondary = isDark ? "gencl:text-white/80" : "gencl:text-secondary-700";
  const iconStroke = isDark ? "gencl:stroke-white" : "gencl:stroke-secondary-900";
  const cardBg = isDark ? "gencl:bg-secondary-900" : "gencl:bg-white";
  const thumbPlaceholderBg = isDark ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100";
  const thumbPlaceholderIcon = isDark ? "gencl:text-white/60" : "gencl:text-secondary-400";
  const displayTitle = data.title || data.link;
  // CTA label fallback chain: explicit `ctaText` prop wins; otherwise
  // the linkout's own `title`. When both are missing (thumbnail-only
  // linkouts where the URL stands in as the visible title), the button
  // gets a generic "Learn more" — using the URL as a button label looks
  // wrong even though it's fine as a row title.
  const ctaLabel = ctaText || data.title || "Learn more";
  const isPlXs = sheetState === "pl-xs";
  const isPlSml = sheetState === "pl-sml";
  // `default` and `default-active` share the same body composite per
  // Figma 8244-20303 / 8249-19818: 64 × 64 thumb + (title + inline
  // CTA) column. The two states only differ in the sheet chrome
  // around the body (drag pill + header for default-active).
  const isDefaultLike = sheetState === "default" || sheetState === "default-active";
  // Only `expand-view` uses the rich card with description / meta —
  // default-active's previous double-duty here was a mismatch with
  // Figma.
  const isExpand = sheetState === "expand-view";
  const isDetail = sheetState === "panel-view" || sheetState === "full-view";
  const isResponsive = sheetState === "responsive";

  // Expand-view CTA placement. By default the CTA pill sits below
  // the thumbnail+details row at the card's bottom (full card
  // width). When the description+meta column is short enough that
  // the CTA fits in the empty space below them — within the thumb's
  // row height — we promote the CTA into the details column instead
  // and the bottom row collapses. Threshold: thumb is `min-h-32`
  // (128 px), CTA is 40 px (`h-10`), gap-1 = 4 px → details fits the
  // CTA inline iff its natural height ≤ 128 - 40 - 4 = 84 px.
  const [ctaFitsInline, setCtaFitsInline] = useState(false);
  // Natural height of the description + meta block (without the
  // inline CTA). Used in option 2 to derive the image size so the
  // image matches the column instead of leaving blank space.
  const [detailsContentHeight, setDetailsContentHeight] = useState(0);
  // Callback ref + ResizeObserver. A plain `useLayoutEffect` with `[]`
  // deps would only fire once on `<LinkCard>`'s first mount; in flows
  // that auto-advance `default-active → expand-view` (e.g.
  // `expand-mobile`), the `isExpand` body branch only renders AFTER
  // the transition — at first mount the ref target doesn't exist and
  // the effect early-returns, leaving `ctaFitsInline = false`
  // permanently. The visible body then picks Option 1 (tall image +
  // bottom CTA) while the hidden measurement well — which mounted
  // straight into `expand-view` and observed correctly — measures
  // the shorter Option 2 layout, so the sheet's auto-height clips
  // the visible CTA off the bottom. A callback ref re-attaches the
  // observer whenever the `isExpand` block mounts, so the measurement
  // matches the well in both flows. */
  const observerRef = useRef<ResizeObserver | null>(null);
  const detailsContentRef = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;
    const FIT_THRESHOLD = 84;
    const update = () => {
      const h = el.offsetHeight;
      setDetailsContentHeight(h);
      setCtaFitsInline(h <= FIT_THRESHOLD);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  // ── Option 2 image sizing ─────────────────────────────────────
  // When the inline CTA is promoted into the right column
  // (`ctaFitsInline = true`), the column's natural height is
  //   description+meta (`detailsContentHeight`)
  //   + 4 px gap-1
  //   + 40 px CTA (`h-10` on LinkCardInlineCta).
  // Setting the image to that exact pixel square (floored at 84 px)
  // collapses the row to the content's height — no blank space
  // below the chips, no blank space below the image. Option 1
  // (`ctaFitsInline = false`) is untouched: the image still uses
  // the `min-h-32 + aspect-square + h-full` grid behaviour.
  const IMAGE_FLOOR_PX = 84;
  const CTA_INLINE_HEIGHT_PX = 40;
  const CTA_INLINE_GAP_PX = 4;
  const expandImageSize =
    ctaFitsInline && detailsContentHeight > 0
      ? Math.max(IMAGE_FLOOR_PX, detailsContentHeight + CTA_INLINE_GAP_PX + CTA_INLINE_HEIGHT_PX)
      : null;

  // Chip surfaces: dark pill with white text / icons in both themes
  // per Figma 10075:76967 (xs) / 10075:76970 (sml). Inside (dark)
  // panels use translucent dark over the video poster; outside
  // (light) panels use solid dark over the white card surface. The
  // chip body itself is always dark — the panel-level "light" theme
  // only governs the surrounding card/panel chrome, not the button.
  const chipBg = isDark ? "gencl:bg-secondary-900/50" : "gencl:bg-secondary-900";
  const chipText = "gencl:text-white";
  const chipIconStroke = "gencl:stroke-white";
  // Outside-layout chips (light theme) sit flush below the video
  // frame — no top gutter, no horizontal inset — so the top corners
  // share the frame's flush bottom edge. Inside (dark) chips float
  // over the video with a full `rounded-lg` ring on all four sides.
  const chipRounding = isDark ? "gencl:rounded-lg" : "gencl:rounded-t-none gencl:rounded-b-lg";

  // ── Responsive wide-card (size + orientation + state-driven) ──
  // Self-contained card that fills its host container. All layout
  // adaptation lives inside <ResponsiveLinkCard> via cva token
  // bundles + ResizeObserver-driven size / orientation pickers.
  if (isResponsive) {
    return (
      <ResponsiveLinkCard
        data={data}
        state={responsiveState}
        ctaText={ctaText}
        ctaLink={ctaLink}
        onCtaClick={onCtaClick}
        showGrid={showResponsiveGrid}
        forceOrientation={forceOrientation}
        ctaClassName={ctaClassName}
        forceFlexRatio={forceFlexRatio}
        hideThumb={hideThumb}
      />
    );
  }

  // pl-xs — minimal chip: text + trailing chevron, 32 px tall, body-2.
  // The chevron is always visible (even while the title marquees) so
  // the chip reads as an actionable affordance — `MarqueeText` lives
  // inside a `flex-1 min-w-0` box so its overflow detection still
  // accounts for the chevron's reserved width.
  //
  // Renders as `<a href target="_blank">` (not `<button>`) so the
  // browser treats the click as a real user-initiated navigation. A
  // button-with-window.open path is silently blocked by Chrome's
  // popup heuristics when the click originates inside a deeply-
  // nested iframe (e.g. Storybook's preview pane), even though the
  // event is synchronous. `onClick` still fires so the analytics
  // `LINKOUTS_CLICKED` event ships before navigation.
  if (isPlXs) {
    return (
      <a
        href={data.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={displayTitle}
        className={cn(
          "gencl:relative gencl:w-full gencl:h-8 gencl:px-2 gencl:gap-2 gencl:backdrop-blur-sm gencl:flex gencl:items-center gencl:cursor-pointer gencl:transition-opacity gencl:active:opacity-80 gencl:border-0 gencl:no-underline",
          chipRounding,
          chipBg
        )}
        // Stop pointerdown from bubbling to the dynamic-sheet's content
        // div, which would `setPointerCapture` on itself at scrollTop=0
        // and intercept the click before it reaches the anchor (the
        // browser dispatches `click` on the captured element, not on
        // the original target). Without this stop, hover shows the
        // href but click is silently swallowed.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}>
        <MarqueeText
          text={displayTitle}
          className={cn(
            // pl-xs uses body-2-medium (12 px / 16 lh) per the Figma
            // reference, NOT body-3-medium — chip-level text is the
            // exception to the MetaRow-level switch. `flex-1 min-w-0`
            // hands the title the available chip width so MarqueeText
            // can decide whether it overflows and needs to scroll.
            "gencl:text-body-2-medium! gencl:flex-1 gencl:min-w-0 gencl:text-left",
            chipText
          )}
        />
        <ChevronRight className={cn("gencl:size-4 gencl:shrink-0", chipIconStroke)} />
      </a>
    );
  }

  // pl-sml — chip with 24×24 thumbnail prefix + CTA-style title +
  // trailing chevron. 40 px tall, body-1.
  if (isPlSml) {
    return (
      <a
        href={data.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={displayTitle}
        className={cn(
          "gencl:relative gencl:w-full gencl:h-10 gencl:px-2 gencl:gap-2 gencl:backdrop-blur-sm gencl:flex gencl:items-center gencl:cursor-pointer gencl:transition-opacity gencl:active:opacity-80 gencl:border-0 gencl:no-underline",
          chipRounding,
          chipBg
        )}
        // See pl-xs above — DynamicSheet's content div captures the
        // pointer on pointerdown at scrollTop=0, which re-routes the
        // browser's `click` event to the sheet (where it's swallowed
        // by stopPropagation). Halting the bubble here prevents the
        // capture so the anchor's `href` navigation fires.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}>
        <span
          className={cn(
            "gencl:relative gencl:size-6 gencl:shrink-0 gencl:overflow-hidden gencl:rounded-[4.8px]",
            thumbPlaceholderBg
          )}>
          {data.image ? (
            <Image
              src={data.image}
              alt=""
              className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover"
            />
          ) : (
            <span className="gencl:absolute gencl:inset-0 gencl:flex-center">
              <ExternalLink className={cn("gencl:size-3", thumbPlaceholderIcon)} />
            </span>
          )}
        </span>
        <MarqueeText
          text={displayTitle}
          className={cn("gencl:flex-1 gencl:min-w-0 gencl:text-body-1-semi-bold! gencl:text-left", chipText)}
        />
        <ChevronRight className={cn("gencl:size-6 gencl:shrink-0", chipIconStroke)} />
      </a>
    );
  }

  // `default` / `default-active` — Figma 8244-20303 / 8249-19818
  // Module layout:
  //   ┌──────────┬─────────────────────────────────┐
  //   │          │ Title (Body-1 Semi Bold)        │
  //   │ 64×64 px │ ─────────────────────────────── │
  //   │  thumb   │ CTA pill (40 px, dark/translucent│
  //   │          │   bg, trailing chevron)         │
  //   └──────────┴─────────────────────────────────┘
  // Sheet header is suppressed for `default` (Figma 8244-20303 has
  // no chrome above the body); `default-active` keeps the header
  // (drag pill + favicon + title + close). The sheet footer is
  // suppressed in BOTH states because the CTA is inline in the
  // card. See linkouts-dynamic.tsx.
  if (isDefaultLike) {
    const ctaDisplayText = ctaLabel;
    const ctaHref = ctaLink || data.link;
    const hasThumb = !!data.image;
    return (
      <div
        className={cn(
          // With a thumbnail: CSS Grid `grid-cols-[auto_1fr]` so the
          // thumb is a square that grows with the column (Figma
          // 8244-20303 / 8249-19818). `align-items: stretch` (grid
          // default) gives the thumb a definite height equal to
          // the row's height, and `aspect-square` then derives its
          // width.
          //
          // Without a thumbnail: flat block layout so the inner
          // details column (and its full-width CTA) span the entire
          // card. The grid `auto_1fr` would otherwise auto-place the
          // inner div in the empty `auto` column, sizing the column
          // to the inner content (circular with `w-full`) and
          // leaving the `1fr` track empty.
          "gencl:relative gencl:w-full gencl:p-2 gencl:rounded-lg",
          hasThumb ? "gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2" : "gencl:block",
          textPrimary
        )}>
        {/* Thumbnail — 1:1 aspect ratio, height = full grid row
            (Figma 8244-20303 / 8249-19818). `min-h-16` ensures a
            64 px floor when the column is short (1-line title); the
            `aspect-square` then makes the width follow. */}
        <LinkCardThumb src={data.image} className="gencl:min-h-16 gencl:aspect-square gencl:h-full" />
        <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:flex-1 gencl:min-w-0">
          {/* Title falls back to the URL when no explicit title is
              provided (thumbnail+URL-only linkouts). The CTA in those
              cases reads "Learn more" so the URL isn't duplicated. */}
          {displayTitle && (
            <p
              className={cn(
                // line-clamp-2: short titles render on a single line,
                // long titles wrap to two before truncating (Figma
                // 8249-19818 shows the TOEFL title on two lines).
                "gencl:text-body-1-semi-bold! gencl:line-clamp-2 gencl:overflow-hidden gencl:text-ellipsis gencl:w-full",
                textPrimary
              )}>
              {displayTitle}
            </p>
          )}
          {ctaDisplayText && (
            <LinkCardInlineCta
              href={ctaHref}
              label={ctaDisplayText}
              theme={isDark ? "dark" : "light"}
              onClick={onCtaClick}
              className="gencl:w-full"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={displayTitle}
      className={cn(
        "gencl:relative gencl:w-full gencl:cursor-pointer gencl:transition-opacity gencl:active:opacity-80",
        // Only `full-view` has a definite parent height (100% of
        // container) — there the LinkCard fills the slide so the
        // inner `justify-between` body can space title+desc to the
        // top and image+meta to the bottom. `panel-view` is auto
        // height, so the body just sizes to its content naturally.
        sheetState === "full-view" && "gencl:h-full gencl:flex gencl:flex-col"
      )}
      // See pl-xs above — stop pointerdown bubbling so the
      // DynamicSheet's content div doesn't `setPointerCapture` and
      // swallow the click before it reaches this row's onClick.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}>
      {/* ── Expand-view layout (Figma 8244-20305) ──────────────────
          Module structure:
            ┌────────────────────────────────────────────────────┐
            │ Title (full width, Body-1 Semi Bold)               │
            ├──────────┬─────────────────────────────────────────┤
            │ 128 × N  │ Description (Body-3 Medium)             │
            │  thumb   │ Meta row (brand · price · rating · ...) │
            ├──────────┴─────────────────────────────────────────┤
            │ Inline CTA pill (40 px, dark bg, trailing chevron) │
            └────────────────────────────────────────────────────┘
          The thumbnail is a square that grows with the (description
          + meta) column height (CSS Grid + aspect-square + h-full,
          same trick as `default` / `default-active`). The CTA lives
          inside the card; the sheet footer is suppressed for
          expand-view. */}
      {isExpand && (
        <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-full gencl:p-2">
          {/* Title */}
          <p className={cn("gencl:text-body-1-semi-bold! gencl:line-clamp-1 gencl:truncate gencl:w-full", textPrimary)}>
            {displayTitle}
          </p>

          {/* Image + Details row */}
          <div className="gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2 gencl:w-full">
            {/* Thumbnail — option 1 (`ctaFitsInline = false`) keeps
                the original grid behaviour: 1:1 aspect, height = row
                height (driven by description + meta), 128 px floor.
                Option 2 (`ctaFitsInline = true`) overrides with an
                explicit pixel square equal to the right column's
                natural height (description + meta + inline CTA + gap)
                so the image collapses with the content — see
                `expandImageSize` above. Floored at 84 px. */}
            <LinkCardThumb
              src={data.image}
              alt={displayTitle}
              className={expandImageSize !== null ? undefined : "gencl:min-h-32 gencl:aspect-square gencl:h-full"}
              style={expandImageSize !== null ? { width: expandImageSize, height: expandImageSize } : undefined}
            />

            {/* Details column. When the description+meta combined
                height fits within `128 - cta - gap = 84 px`, the
                CTA is promoted into this column with `mt-auto` to
                push it to the bottom of the row (the column is
                stretched to thumb height by grid `align-items:
                stretch`). Otherwise the CTA renders as a sibling
                row below. */}
            <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:min-w-0">
              <div ref={detailsContentRef} className="gencl:flex gencl:flex-col gencl:gap-1">
                {data.description && (
                  <p className={cn("gencl:text-body-3-medium! gencl:w-full gencl:line-clamp-3", textSecondary)}>
                    {data.description}
                  </p>
                )}
                <MetaRow
                  brand={data.brand}
                  website={data.website}
                  originalPrice={data.originalPrice}
                  currentPrice={data.currentPrice}
                  rating={data.rating}
                  likes={data.likes}
                  downloads={data.downloads}
                  phone={data.phone}
                  address={data.address}
                  theme={theme}
                  textClassName={cn("gencl:text-body-3-medium!", textSecondary)}
                />
              </div>
              {ctaFitsInline && ctaLabel && (
                <LinkCardInlineCta
                  href={ctaLink || data.link}
                  label={ctaLabel}
                  theme={isDark ? "dark" : "light"}
                  onClick={onCtaClick}
                  className="gencl:w-full gencl:mt-auto"
                />
              )}
            </div>
          </div>

          {/* Bottom CTA pill — collapses (renders nothing) when the
              CTA was promoted into the details column above. */}
          {!ctaFitsInline && ctaLabel && (
            <LinkCardInlineCta
              href={ctaLink || data.link}
              label={ctaLabel}
              theme={isDark ? "dark" : "light"}
              onClick={onCtaClick}
              className="gencl:w-full"
            />
          )}
        </div>
      )}

      {/* ── Detail layout (panel-view, full-view) ──
          Figma 8244-20393 (Panel View) Module structure:
            ┌─────────────────────────────────────────┐
            │ Title (Headline-4 Semibold, full width) │
            │ Description (Body-1 Medium, full width) │
            ├─────────────────────────────────────────┤
            │           1:1 thumbnail                 │
            │     (centered, fills remaining space)   │
            ├─────────────────────────────────────────┤
            │ Meta wrap (brand · price · rating · …)  │
            └─────────────────────────────────────────┘
          The CTA button lives in the sheet's footer slot (not
          inline), unlike default / default-active / expand-view. */}
      {isDetail && (
        <div
          className={cn(
            "gencl:flex gencl:flex-col gencl:items-stretch gencl:p-3 gencl:w-full gencl:gap-4",
            // For full-view (100% of container) the body fills the
            // slide and the IMAGE area absorbs the remaining height
            // (Figma 8244-20676 layout: title-desc → flex-1 image →
            // meta → CTA, all top-aligned with no empty gaps).
            // Panel-view is auto-sized so children stack naturally.
            sheetState === "full-view" && "gencl:h-full",
            cardBg
          )}>
          {/* Title + Description */}
          <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:items-start gencl:w-full gencl:shrink-0">
            <p
              className={cn(
                "gencl:text-headline-4-semi-bold! gencl:overflow-hidden gencl:text-ellipsis gencl:line-clamp-3 gencl:w-full",
                textPrimary
              )}>
              {displayTitle}
            </p>
            {data.description && (
              <p className={cn("gencl:text-body-1-medium! gencl:w-full", textSecondary)}>{data.description}</p>
            )}
          </div>

          {/* Image area. In full-view the area is `flex-1 min-h-0`
              so the image absorbs the leftover vertical space (Figma
              `aspect-[143/143] h-full` inside a `flex-1` parent).
              In panel-view the area is auto-sized and the image is
              capped at `max-w-[280px]` so it stays a reasonable
              square. Either way, the image is centered horizontally. */}
          <div
            className={cn(
              "gencl:flex gencl:items-center gencl:justify-center gencl:w-full",
              sheetState === "full-view" && "gencl:flex-1 gencl:min-h-0"
            )}>
            <LinkCardThumb
              src={data.image}
              alt={displayTitle}
              className={cn(
                "gencl:aspect-square",
                sheetState === "full-view" ? "gencl:h-full gencl:max-w-full" : "gencl:w-full gencl:max-w-[280px]"
              )}
            />
          </div>

          {/* Meta wrap */}
          <MetaRow
            brand={data.brand}
            website={data.website}
            originalPrice={data.originalPrice}
            currentPrice={data.currentPrice}
            rating={data.rating}
            likes={data.likes}
            downloads={data.downloads}
            phone={data.phone}
            address={data.address}
            theme={theme}
            textClassName={cn("gencl:text-body-1-medium! gencl:shrink-0", textSecondary)}
          />
        </div>
      )}
    </div>
  );
}
