"use client";
import { Image } from "@genuin/ui/components/image";
import { LinkIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { Star, Heart, Download, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import type { SheetState } from "@genuin/components/context/base/event-bus";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { LinkCardInlineCta, LinkCardThumb, LinkCardTitle, MarqueeText } from "./link-card-primitives";
import { ResponsiveLinkCard, type FlexRatio } from "./responsive-card";
import { useImageLoadStatus } from "./use-image-load-status";

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

/** True when the link has any optional field the rich `expand-view` card
 *  surfaces; lets sparse links fall back to the compact `default-active`.
 *  Takes the RAW `LinkData`, not `LinkMetaData` — callers often backfill
 *  `brand`/`website` from brand-level defaults for display, which would make
 *  every link read as "rich" if checked post-merge. */
export function hasRichLinkMetadata(link: LinkData): boolean {
  return Boolean(
    link.description ||
      link.brand ||
      link.website ||
      link.originalPrice ||
      link.currentPrice ||
      link.rating ||
      link.likes ||
      link.downloads ||
      link.phone ||
      link.address
  );
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
  textClassName = "",
}: Pick<
  LinkMetaData,
  "brand" | "website" | "originalPrice" | "currentPrice" | "rating" | "likes" | "downloads" | "phone" | "address"
> & { textClassName?: string }) {
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
      <span key="website" className="gencl:min-w-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap">
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
        className="gencl:flex gencl:items-center gencl:gap-1 gencl:min-w-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap">
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
      <span key="address" className="gencl:min-w-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap">
        {address}
      </span>
    );
  }

  return (
    <div
      className={cn(
        // `items-center` aligns the bullet separators with icon chips
        // (rating / likes / downloads); `items-start` pushed them too high.
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
  onTitleMarqueeDuration,
}: {
  data: LinkMetaData;
  sheetState: SheetState;
  theme?: "light" | "dark";
  onClick?: () => void;
  /** Page-level CTA. Only the `default` state renders it inline; other
   *  states use the sheet footer. */
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: (e: React.MouseEvent) => void;
  /** For `responsive`: `"default"` hides description + chips, `"expand"`
   *  shows everything. */
  responsiveState?: "default" | "expand";
  /** Storybook-only debug grid overlay for the responsive card. */
  showResponsiveGrid?: boolean;
  /** Pin `<ResponsiveLinkCard>`'s orientation (responsive branch only). */
  forceOrientation?: "portrait" | "landscape";
  /** Extra classes merged onto the responsive card's CTA pill. */
  ctaClassName?: string;
  /** Override the responsive card's thumb/details flex ratio. */
  forceFlexRatio?: FlexRatio;
  /** Skip the responsive card's thumb area (host composites its own preview). */
  hideThumb?: boolean;
  /** `pl-xs`/`pl-sml` only: reports the title `MarqueeText`'s scroll-pass
   *  duration (ms), `null` when it fits and isn't scrolling. Lets the host's
   *  chip→default auto-advance timer wait for a full pass to finish. */
  onTitleMarqueeDuration?: (durationMs: number | null) => void;
}) {
  const isDark = theme === "dark";
  const textPrimary = isDark ? "gencl:text-white" : "gencl:text-secondary-900";
  const textSecondary = isDark ? "gencl:text-white/80" : "gencl:text-secondary-700";
  const cardBg = isDark ? "gencl:bg-secondary-900" : "gencl:bg-white";
  const thumbPlaceholderBg = isDark ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100";
  const displayTitle = data.title || data.link;
  // CTA label: `ctaText` → `title` → "Learn more" (the URL works as a row
  // title but reads wrong on a button).
  const ctaLabel = ctaText || data.title || "Learn more";
  const isPlXs = sheetState === "pl-xs";
  const isPlSml = sheetState === "pl-sml";
  // `default` and `default-active` share the same body (thumb + title +
  // inline CTA). They differ in sheet chrome AND in title length: `default`
  // is the compact resting card (title clamped to 1 line → shorter, ~64 tall),
  // `default-active` reveals the 2-line title (~84 tall). The thumb fills the
  // column, so those heights drive its size — no hardcoded per-state value.
  const isDefaultLike = sheetState === "default" || sheetState === "default-active";
  const isDefaultResting = sheetState === "default";
  // Only `expand-view` uses the rich card with description / meta.
  const isExpand = sheetState === "expand-view";
  const isDetail = sheetState === "panel-view" || sheetState === "full-view";
  const isResponsive = sheetState === "responsive";

  // Expand-view CTA placement: by default the pill sits full-width below
  // the row; when description+meta is short enough it's promoted inline into
  // the details column. Threshold: details height ≤ 128 - 40 - 4 = 84 px.
  const [ctaFitsInline, setCtaFitsInline] = useState(false);
  // Natural height of description + meta, used to size the image to the column.
  const [detailsContentHeight, setDetailsContentHeight] = useState(0);
  // pl-sml chip image: preload off-DOM so a broken `src` falls back to the chain
  // glyph instead of a broken box (same rule as LinkCardThumb).
  const plSmlImageStatus = useImageLoadStatus(data.image);
  // Callback ref (not `useLayoutEffect([])`) so the observer re-attaches when
  // the `isExpand` block mounts after an auto-advance — otherwise the visible
  // body and the measurement well disagree and the sheet clips the CTA.
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

  // Expand-view thumb = a SQUARE that FILLS the details-row height (no
  // hardcoded floor — the size falls out of the content, ~108 per Figma).
  // Two cases, both measured off `detailsContentHeight` (the desc + meta
  // wrapper): CTA promoted inline → row = details + gap + CTA; CTA below the
  // grid → row = details only. Explicit px — NOT `aspect-square` + `h-full`,
  // which blew the width up on iOS Safari and covered the title.
  const CTA_INLINE_HEIGHT_PX = 40;
  const CTA_INLINE_GAP_PX = 4;
  const expandImageSize =
    detailsContentHeight > 0
      ? ctaFitsInline
        ? detailsContentHeight + CTA_INLINE_GAP_PX + CTA_INLINE_HEIGHT_PX
        : detailsContentHeight
      : null;

  // `default` / `default-active` thumb = a SQUARE that FILLS the body (title +
  // inline CTA) height, so a 2-line title never leaves a gap below a fixed-size
  // thumb. Measured, like expand-view above — explicit px, NOT `aspect-square` +
  // `h-full` (blows the width up on iOS Safari). The measured body is the title+
  // CTA wrapper, whose height is intrinsic to the content (independent of the
  // thumb), so there's no measurement feedback loop.
  const [defaultBodyHeight, setDefaultBodyHeight] = useState(0);
  const defaultBodyObserverRef = useRef<ResizeObserver | null>(null);
  const defaultBodyRef = useCallback((el: HTMLDivElement | null) => {
    defaultBodyObserverRef.current?.disconnect();
    defaultBodyObserverRef.current = null;
    if (!el) return;
    const update = () => setDefaultBodyHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    defaultBodyObserverRef.current = observer;
  }, []);

  // Chip body is always dark (translucent inside, solid outside); the panel
  // "light" theme only governs the surrounding chrome, not the button.
  const chipBg = isDark ? "gencl:bg-secondary-900/50" : "gencl:bg-secondary-900";
  const chipText = "gencl:text-white";
  const chipIconStroke = "gencl:stroke-white";
  // Outside chips sit flush below the frame (rounded bottom only); inside
  // chips float with a full rounded ring.
  const chipRounding = isDark ? "gencl:rounded-lg" : "gencl:rounded-t-none gencl:rounded-b-lg";

  // Responsive wide-card — self-contained, fills the host; layout adaptation
  // lives in <ResponsiveLinkCard>.
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

  // pl-xs — minimal chip: text + trailing chevron, 32 px tall.
  // Renders as `<a target="_blank">` (not `<button>` + window.open) so the
  // browser treats it as a real navigation — window.open is blocked by
  // popup heuristics inside nested iframes. `onClick` still fires analytics.
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
        // Stop pointerdown bubbling so the sheet's content div doesn't
        // `setPointerCapture` and swallow the click before it reaches the anchor.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}>
        <MarqueeText
          text={displayTitle}
          className={cn("gencl:text-body-2-medium! gencl:flex-1 gencl:min-w-0 gencl:text-left", chipText)}
          onScrollDurationChange={onTitleMarqueeDuration}
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
        // See pl-xs above — stop the bubble so the sheet's pointer capture
        // doesn't re-route the click away from this anchor.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}>
        {data.image && plSmlImageStatus !== "error" ? (
          <span
            className={cn(
              "gencl:relative gencl:size-6 gencl:shrink-0 gencl:overflow-hidden gencl:rounded-[4.8px]",
              thumbPlaceholderBg
            )}>
            <Image
              src={data.image}
              alt=""
              className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover"
            />
          </span>
        ) : (
          // Figma chip fallback (node 8341:43994): bare 24×24 chain glyph on the
          // dark chip ground — no box. White stroke matches the chip title.
          <LinkIcon className={cn("gencl:size-6 gencl:shrink-0", chipIconStroke)} />
        )}
        <MarqueeText
          text={displayTitle}
          className={cn("gencl:flex-1 gencl:min-w-0 gencl:text-body-1-semi-bold! gencl:text-left", chipText)}
          onScrollDurationChange={onTitleMarqueeDuration}
        />
        <ChevronRight className={cn("gencl:size-6 gencl:shrink-0", chipIconStroke)} />
      </a>
    );
  }

  // `default` / `default-active` — 64×64 thumb + (title + inline CTA) column.
  // The CTA is inline (footer suppressed in both states); only the sheet
  // header differs between them.
  if (isDefaultLike) {
    const ctaDisplayText = ctaLabel;
    const ctaHref = ctaLink || data.link;
    // Square thumb that FILLS the measured body height (title + inline CTA), so a
    // 2-line title never leaves a gap below the thumb. Falls back to the Figma
    // per-state size (default 64, default-active 84) for the first paint before
    // the observer measures. Explicit width AND height — NOT `aspect-square` +
    // `h-full`, which let iOS Safari derive the width from the tall row and blow
    // the thumb up over the title.
    const thumbSizePx = isDefaultResting ? 64 : 84;
    const hasThumb = !!data.image;
    // With a real thumbnail the square FILLS the measured body height (title +
    // CTA). On the chain-glyph fallback the icon is small (20×20 — see
    // LinkCardThumb) and the CTA spills to full width below instead.
    const defaultThumbSize = hasThumb && defaultBodyHeight > 0 ? defaultBodyHeight : thumbSizePx;

    const titleNode = displayTitle && (
      // Title navigates to the link URL (GEN-10510), matching the CTA and
      // production. Same 2-line clamp + typography in both layouts.
      <LinkCardTitle
        href={data.link}
        text={displayTitle}
        onClick={onClick}
        className={cn(
          "gencl:text-body-1-semi-bold! gencl:overflow-hidden gencl:text-ellipsis gencl:w-full",
          "gencl:line-clamp-2",
          textPrimary
        )}
      />
    );
    const ctaNode = ctaDisplayText && (
      <LinkCardInlineCta
        href={ctaHref}
        label={ctaDisplayText}
        theme={isDark ? "dark" : "light"}
        onClick={onCtaClick}
        className="gencl:w-full"
      />
    );

    // Fallback layout: a small 20×20 chain glyph sits beside the title, and
    // the CTA spans the FULL card width below (no dead space under the tiny
    // icon). Matches the Figma "Fallback (x Thumbnail)" default card.
    if (!hasThumb) {
      return (
        <div className={cn("gencl:relative gencl:w-full gencl:p-2 gencl:rounded-lg", textPrimary)}>
          <div className="gencl:flex gencl:flex-col gencl:gap-2">
            <div className="gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2 gencl:items-start">
              <LinkCardThumb
                src={data.image}
                fallback
                theme={theme}
                className="gencl:shrink-0"
                // Chain glyph forces its own 20×20 inside LinkCardThumb.
                style={{ width: 20, height: 20 }}
              />
              <div className="gencl:flex gencl:flex-col gencl:justify-center gencl:min-w-0">{titleNode}</div>
            </div>
            {ctaNode}
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          // Grid `auto_1fr` so the thumb is a square sized to the row height.
          "gencl:relative gencl:w-full gencl:p-2 gencl:rounded-lg",
          "gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2",
          textPrimary
        )}>
        {/* Thumbnail — square sized to the measured body height (see
            `defaultThumbSize`). Explicit width + height keep iOS Safari from
            resolving the width off the tall row. */}
        <LinkCardThumb
          src={data.image}
          theme={theme}
          className="gencl:shrink-0"
          style={{ width: defaultThumbSize, height: defaultThumbSize }}
        />
        {/* Outer column stretches to the row (grid default), centering the
            content when the thumb makes the row taller than the text. */}
        <div className="gencl:flex gencl:flex-col gencl:justify-center gencl:flex-1 gencl:min-w-0">
          {/* Body (title + inline CTA) — its measured height drives the square
              thumb so the two columns stay flush (no gap below the thumb). */}
          <div ref={defaultBodyRef} className="gencl:flex gencl:flex-col gencl:gap-2">
            {titleNode}
            {ctaNode}
          </div>
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
        // Only `full-view` has a definite parent height, so fill the slide;
        // panel-view is auto and sizes to content.
        sheetState === "full-view" && "gencl:h-full gencl:flex gencl:flex-col"
      )}
      // See pl-xs above — stop pointerdown so the sheet's pointer capture
      // doesn't swallow this row's click.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}>
      {/* Expand-view: title, then a thumb + (description + meta) row, then
          the inline CTA. Thumb is a square sized to the column height. */}
      {isExpand && (
        <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-full gencl:p-2">
          {/* Title — navigates to the link URL (GEN-10510), like the CTA. */}
          <LinkCardTitle
            href={data.link}
            text={displayTitle}
            onClick={onClick}
            className={cn("gencl:text-body-1-semi-bold! gencl:line-clamp-2 gencl:w-full", textPrimary)}
          />

          {/* Image + Details row */}
          <div className="gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2 gencl:w-full">
            {/* Thumbnail — explicit-px square filling the details-row height
                (see `expandImageSize`); no `aspect-square`/floor. The `84` is a
                first-paint fallback before the observer measures, not a clamp. */}
            <LinkCardThumb
              src={data.image}
              alt={displayTitle}
              fallback
              theme={theme}
              // Real thumbnail fills the measured column square; the chain-glyph
              // fallback forces its own 20×20 inside LinkCardThumb — no scaling.
              style={
                data.image ? { width: expandImageSize ?? 84, height: expandImageSize ?? 84 } : { width: 40, height: 40 }
              }
            />

            {/* Details column. When description+meta fits in ≤ 84 px, the
                CTA is promoted here (`mt-auto`); otherwise it renders below. */}
            <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:min-w-0">
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
                  textClassName={cn("gencl:text-body-3-medium!", textSecondary)}
                />
              </div>
              {/* Inline promotion only applies with a real thumbnail — the
                  chain-glyph fallback stays small (see above), so squeezing the
                  CTA into this narrow column instead of the full-width row below
                  just forces it to marquee for no reason. Matches the
                  `isDefaultLike` fallback's full-width CTA-below treatment. */}
              {data.image && ctaFitsInline && ctaLabel && (
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

          {/* Bottom CTA — omitted only when promoted inline above (real thumbnail). */}
          {!(data.image && ctaFitsInline) && ctaLabel && (
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

      {/* Detail layout (panel-view, full-view): title + description, a
          centered 1:1 thumbnail, then the meta wrap. CTA lives in the
          sheet footer (not inline). */}
      {isDetail && (
        <div
          className={cn(
            "gencl:flex gencl:flex-col gencl:items-stretch gencl:p-3 gencl:w-full gencl:gap-4",
            // full-view fills the slide (image area absorbs the leftover
            // height); panel-view is auto-sized and stacks naturally.
            sheetState === "full-view" && "gencl:h-full",
            cardBg
          )}>
          {/* Title + Description */}
          <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:items-start gencl:w-full gencl:shrink-0">
            {/* NOT a clickable title here: panel/full is the drag-to-expand
                reading surface and its headline sits directly under the drag
                pill, so making it navigate turned a "tap the dragger to open
                full view" into an accidental redirect. Navigation in this view
                is the footer CTA only. GEN-10510's title-click applies to the
                compact card states (default / default-active / expand-view). */}
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

          {/* Image area: full-view is `flex-1 min-h-0` so the image absorbs
              leftover height; panel-view is auto with a `max-w-[280px]` cap.
              Centered either way. */}
          <div
            className={cn(
              "gencl:flex gencl:items-center gencl:justify-center gencl:w-full",
              sheetState === "full-view" && "gencl:flex-1 gencl:min-h-0"
            )}>
            <LinkCardThumb
              src={data.image}
              alt={displayTitle}
              fallback
              theme={theme}
              // Width-based in both panel + full-view. `h-full` collapses to 0 in
              // a single-link full-view sheet (auto-height SnapSheet wrapper),
              // hiding the thumbnail/glyph; width keeps them visible.
              className={cn("gencl:aspect-square", "gencl:w-full gencl:max-w-[280px]")}
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
            textClassName={cn("gencl:text-body-1-medium! gencl:shrink-0", textSecondary)}
          />
        </div>
      )}
    </div>
  );
}
