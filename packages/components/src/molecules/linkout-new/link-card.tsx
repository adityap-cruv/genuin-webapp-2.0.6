"use client";
import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import { LinkIcon, Star, Heart, Download, ExternalLink, ChevronRight } from "lucide-react";

import type { SheetState } from "@genuin/components/context/base/event-bus";

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
      <span key="brand" className="gencl:shrink-0 gencl:whitespace-nowrap gencl:text-body-2-medium">
        {brand}
      </span>
    );
  if (website) {
    if (items.length > 0) items.push(sep("website"));
    items.push(
      <span
        key="website"
        className="gencl:shrink-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap gencl:text-body-2-medium">
        {website}
      </span>
    );
  }
  if (originalPrice || currentPrice) {
    if (items.length > 0) items.push(sep("price"));
    items.push(
      <span
        key="price"
        className="gencl:flex gencl:gap-1 gencl:items-start gencl:shrink-0 gencl:whitespace-nowrap gencl:text-body-2-medium">
        {originalPrice && (
          <span className="gencl:line-through gencl:opacity-80 gencl:text-body-2-medium">{originalPrice}</span>
        )}
        {currentPrice && <span className="gencl:font-bold gencl:text-body-2-medium">{currentPrice}</span>}
      </span>
    );
  }
  if (rating) {
    if (items.length > 0) items.push(sep("rating"));
    items.push(
      <span
        key="rating"
        className="gencl:flex gencl:items-center gencl:gap-1 gencl:shrink-0 gencl:whitespace-nowrap gencl:text-body-2-medium">
        <Star className="gencl:size-3 gencl:shrink-0" />
        {rating}
      </span>
    );
  }
  if (likes) {
    if (items.length > 0) items.push(sep("likes"));
    items.push(
      <span
        key="likes"
        className="gencl:flex gencl:items-center gencl:gap-1 gencl:shrink-0 gencl:whitespace-nowrap gencl:text-body-2-medium">
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
        className="gencl:flex gencl:items-center gencl:gap-1 gencl:shrink-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap gencl:text-body-2-medium">
        <Download className="gencl:size-3 gencl:shrink-0" />
        {downloads}
      </span>
    );
  }
  if (phone) {
    if (items.length > 0) items.push(sep("phone"));
    items.push(
      <span key="phone" className="gencl:shrink-0 gencl:whitespace-nowrap gencl:text-body-2-medium">
        {phone}
      </span>
    );
  }
  if (address) {
    if (items.length > 0) items.push(sep("address"));
    items.push(
      <span
        key="address"
        className="gencl:shrink-0 gencl:min-w-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap gencl:text-body-2-medium">
        {address}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-wrap gencl:gap-1 gencl:items-start gencl:text-body-2-medium gencl:w-full",
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
}: {
  data: LinkMetaData;
  sheetState: SheetState;
  theme?: "light" | "dark";
  onClick?: () => void;
}) {
  const isDark = theme === "dark";
  const textPrimary = isDark ? "gencl:text-white" : "gencl:text-secondary-900";
  const textSecondary = isDark ? "gencl:text-white/80" : "gencl:text-secondary-700";
  const iconStroke = isDark ? "gencl:stroke-white" : "gencl:stroke-secondary-900";
  const iconText = isDark ? "gencl:text-white" : "gencl:text-secondary-900";
  const cardBg = isDark ? "gencl:bg-secondary-900" : "gencl:bg-white";
  const thumbPlaceholderBg = isDark ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100";
  const thumbPlaceholderIcon = isDark ? "gencl:text-white/60" : "gencl:text-secondary-400";
  const displayTitle = data.title || data.link;
  const isDefault = sheetState === "default";
  const isExpand = sheetState === "expand-view" || sheetState === "default-active";
  const isDetail = sheetState === "panel-view" || sheetState === "full-view";

  if (isDefault)
    return (
      <div
        className={cn(
          "gencl:w-full gencl:text-body-0-semi-bold! gencl:transition-all gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:p-2 gencl:rounded-lg",
          textPrimary
        )}>
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:w-[85%]">
          <LinkIcon className={cn("gencl:size-5 gencl:shrink-0", iconStroke)} />
          <p className="gencl:line-clamp-1 gencl:truncate">{displayTitle}</p>
        </div>
        <ChevronRight className={cn("gencl:size-5 gencl:shrink-0", iconStroke)} />
      </div>
    );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={displayTitle}
      className="gencl:w-full gencl:cursor-pointer gencl:transition-opacity gencl:active:opacity-80"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onKeyDown={(e: any) => {
        e.stopPropagation();
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}>
      {isExpand && (
        <div
          className={cn(
            "gencl:flex gencl:gap-3 gencl:w-full gencl:p-2 gencl:sm:p-3!",
            data.description ? "gencl:items-start" : "gencl:items-center"
          )}>
          {/* Thumbnail */}
          <div
            className={cn(
              "gencl:relative gencl:rounded-lg gencl:shrink-0 gencl:size-16 gencl:overflow-hidden",
              thumbPlaceholderBg
            )}>
            {data.image ? (
              <Image
                src={data.image}
                alt={displayTitle}
                className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover gencl:rounded-lg"
              />
            ) : (
              <div className="gencl:absolute gencl:inset-0 gencl:flex-center gencl:rounded-lg">
                <ExternalLink className={cn("gencl:size-6", thumbPlaceholderIcon)} />
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:flex-1 gencl:min-w-0">
            <p
              className={cn(
                "gencl:text-body-1-semi-bold! gencl:line-clamp-2 gencl:overflow-hidden gencl:text-ellipsis gencl:w-full",
                textPrimary
              )}>
              {displayTitle}
            </p>

            {data.description && (
              <p className={cn("gencl:text-body-2-medium gencl:w-full gencl:line-clamp-3", textSecondary)}>
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
              textClassName={cn("gencl:text-body-2-medium", textSecondary)}
            />
          </div>
        </div>
      )}

      {/* ── Detail layout (panel-view, full-view) ── */}
      {isDetail && (
        <div className={cn("gencl:flex gencl:flex-col gencl:gap-2 gencl:items-start gencl:p-3 gencl:w-full", cardBg)}>
          <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center gencl:w-full gencl:flex-1 gencl:min-h-0">
            {/* 1:1 thumbnail */}
            <div
              className={cn(
                "gencl:relative gencl:aspect-square gencl:rounded-lg gencl:overflow-hidden gencl:flex-1 gencl:min-h-0",
                thumbPlaceholderBg,
                sheetState === "full-view" ? "gencl:w-[90%]" : "gencl:size-48"
              )}>
              {data.image ? (
                <img
                  src={data.image}
                  alt={displayTitle}
                  className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover gencl:rounded-lg"
                />
              ) : (
                <div className="gencl:absolute gencl:inset-0 gencl:flex-center gencl:rounded-lg">
                  <ExternalLink className={cn("gencl:size-8", thumbPlaceholderIcon)} />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="gencl:flex gencl:flex-col gencl:gap-3 gencl:items-start gencl:w-full gencl:shrink-0">
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
                textClassName={cn("gencl:text-body-1-medium!", textSecondary)}
              />
              <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:w-full gencl:shrink-0">
                <LinkIcon className={cn("gencl:size-5 gencl:shrink-0", iconText)} />
                <p
                  className={cn(
                    "gencl:flex-1 gencl:min-w-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap gencl:text-body-1-semi-bold!",
                    textSecondary
                  )}>
                  {data.link}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
