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
  density = "regular",
  compactThumbnailSize,
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
  /** Compact preserves the same card structure at the 332×120 placement size. */
  density?: "regular" | "compact";
  /** Optional square/rectangular thumbnail dimensions for compact density. */
  compactThumbnailSize?: { width: number; height: number };
}) {
  const isDark = theme === "dark";
  const textPrimary = isDark ? "gencl:text-white" : "gencl:text-secondary-900";
  const textSecondary = isDark ? "gencl:text-white/80" : "gencl:text-secondary-700";
  const iconStroke = isDark ? "gencl:stroke-white" : "gencl:stroke-secondary-900";
  const cardBg = isDark ? "gencl:bg-secondary-900" : "gencl:bg-white";
  const thumbPlaceholderBg = isDark ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100";
  const thumbPlaceholderIcon = isDark ? "gencl:text-white/60" : "gencl:text-secondary-400";
  const displayTitle = data.title || data.link;
  // CTA label: `ctaText` → `title` → "Learn more" (the URL works as a row
  // title but reads wrong on a button).
  const ctaLabel = ctaText || data.title || "Learn more";
  const isPlXs = sheetState === "pl-xs";
  const isPlSml = sheetState === "pl-sml";
  // `default` and `default-active` share the same body (thumb + title +
  // inline CTA); they differ only in sheet chrome.
  const isDefaultLike = sheetState === "default" || sheetState === "default-active";
  // Only `expand-view` uses the rich card with description / meta.
  const isExpand = sheetState === "expand-view";
  const isDetail = sheetState === "panel-view" || sheetState === "full-view";
  const isResponsive = sheetState === "responsive";
  const isCompact = density === "compact";
  const compactThumbWidth = compactThumbnailSize?.width ?? 76;
  const compactThumbHeight = compactThumbnailSize?.height ?? 76;

  // Expand-view CTA placement: by default the pill sits full-width below
  // the row; when description+meta is short enough it's promoted inline into
  // the details column. Threshold: details height ≤ 128 - 40 - 4 = 84 px.
  const [ctaFitsInline, setCtaFitsInline] = useState(isCompact);
  // Natural height of description + meta, used to size the image to the column.
  const [detailsContentHeight, setDetailsContentHeight] = useState(0);
  // Callback ref (not `useLayoutEffect([])`) so the observer re-attaches when
  // the `isExpand` block mounts after an auto-advance — otherwise the visible
  // body and the measurement well disagree and the sheet clips the CTA.
  const observerRef = useRef<ResizeObserver | null>(null);
  const detailsContentRef = useCallback(
    (el: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!el) return;
      const FIT_THRESHOLD = isCompact ? 28 : 84;
      const update = () => {
        const h = el.offsetHeight;
        setDetailsContentHeight(h);
        setCtaFitsInline(isCompact || h <= FIT_THRESHOLD);
      };
      update();
      const observer = new ResizeObserver(update);
      observer.observe(el);
      observerRef.current = observer;
    },
    [isCompact]
  );

  // When the CTA is promoted inline, size the image to the column's exact
  // height (details + gap + CTA, floored at 84 px) so the row has no blank
  // space. Otherwise the image keeps the grid aspect-square behaviour.
  const IMAGE_FLOOR_PX = isCompact ? compactThumbHeight : 84;
  const CTA_INLINE_HEIGHT_PX = 40;
  const CTA_INLINE_GAP_PX = 4;
  const expandImageSize =
    ctaFitsInline && detailsContentHeight > 0
      ? Math.max(IMAGE_FLOOR_PX, detailsContentHeight + CTA_INLINE_GAP_PX + CTA_INLINE_HEIGHT_PX)
      : null;

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

  // `default` / `default-active` — 64×64 thumb + (title + inline CTA) column.
  // The CTA is inline (footer suppressed in both states); only the sheet
  // header differs between them.
  if (isDefaultLike) {
    const ctaDisplayText = ctaLabel;
    const ctaHref = ctaLink || data.link;
    const hasThumb = !!data.image;
    return (
      <div
        className={cn(
          // With a thumb: grid `auto_1fr` so the thumb is a square sized to
          // the row height. Without one: flat block so the details column
          // spans the full card (the grid would strand it in the `auto` track).
          "gencl:relative gencl:w-full gencl:p-2 gencl:rounded-lg",
          hasThumb ? "gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2" : "gencl:block",
          textPrimary
        )}>
        {/* Thumbnail — fixed 64×64 (`w-16 h-16 shrink-0`). The earlier
            aspect-square + h-full recipe resolved wider on iOS Safari and
            pushed the title behind the image. */}
        <LinkCardThumb src={data.image} className="gencl:w-16 gencl:h-16 gencl:shrink-0" />
        <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:flex-1 gencl:min-w-0">
          {/* Title falls back to the URL; the CTA then reads "Learn more"
              so the URL isn't duplicated. */}
          {displayTitle && (
            <p
              className={cn(
                // line-clamp-2: wraps to two lines before truncating.
                isCompact
                  ? "gencl:h-5 gencl:text-[14px] gencl:leading-5 gencl:font-semibold gencl:line-clamp-1 gencl:truncate gencl:w-full"
                  : "gencl:text-body-1-semi-bold! gencl:line-clamp-2 gencl:overflow-hidden gencl:text-ellipsis gencl:w-full",
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
          {/* Title */}
          <p
            className={cn(
              isCompact
                ? "gencl:h-5 gencl:text-[14px] gencl:leading-5 gencl:font-semibold gencl:line-clamp-1 gencl:truncate gencl:w-full"
                : "gencl:text-body-1-semi-bold! gencl:line-clamp-1 gencl:truncate gencl:w-full",
              textPrimary
            )}>
            {displayTitle}
          </p>

          {/* Image + Details row */}
          <div className="gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2 gencl:w-full">
            {/* Thumbnail — grid aspect-square (128 px floor) normally;
                when the CTA is promoted inline, an explicit pixel square
                matching the column height (see `expandImageSize`). */}
            <LinkCardThumb
              src={data.image}
              alt={displayTitle}
              className={
                isCompact || expandImageSize !== null ? undefined : "gencl:min-h-32 gencl:aspect-square gencl:h-full"
              }
              style={
                isCompact
                  ? { width: compactThumbWidth, height: compactThumbHeight }
                  : expandImageSize !== null
                    ? { width: expandImageSize, height: expandImageSize }
                    : undefined
              }
            />

            {/* Details column. When description+meta fits in ≤ 84 px, the
                CTA is promoted here (`mt-auto`); otherwise it renders below. */}
            <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:min-w-0">
              <div ref={detailsContentRef} className="gencl:flex gencl:flex-col gencl:gap-1">
                {data.description && (
                  <p
                    className={cn(
                      isCompact
                        ? "gencl:h-7 gencl:text-[10px] gencl:leading-3.5 gencl:font-medium gencl:w-full gencl:line-clamp-2"
                        : "gencl:text-body-3-medium! gencl:w-full gencl:line-clamp-3",
                      textSecondary
                    )}>
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

          {/* Bottom CTA — omitted when the CTA was promoted inline above. */}
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
