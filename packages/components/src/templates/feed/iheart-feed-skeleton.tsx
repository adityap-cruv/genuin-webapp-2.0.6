"use client";
import { cn } from "@genuin/ui/lib/utils";
import { Skeleton } from "@genuin/ui/skeleton";

import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { FEED_SKELETON_THEME } from "@genuin/components/templates/feed/feed-skeleton";

export type IHeartFeedSkeletonProps = {
  theme?: "light" | "dark";
};

/**
 * Fullscreen loading skeleton matching the iHeart expand-view layout.
 * Used instead of {@link FeedSkeleton} (no comments/heading/control-row) when
 * `brandLayoutType === "iheart"`. Pure shimmer — no context or data.
 */
export function IHeartFeedSkeleton({ theme = "dark" }: IHeartFeedSkeletonProps) {
  const { isMobile } = useDeviceDetectMediaQuery();

  const colors = FEED_SKELETON_THEME[theme];

  return (
    <div
      aria-busy="true"
      className={cn(
        "gencl:fixed gencl:inset-0 gencl:z-50 gencl:flex gencl:items-center gencl:justify-center",
        colors.container
      )}>
      {/* Top-left back button */}
      <Skeleton className={cn("gencl:absolute gencl:left-4 gencl:top-4 gencl:size-12 gencl:rounded-full", colors.secondary)} />
      {/* Top-right close button */}
      <Skeleton className={cn("gencl:absolute gencl:right-4 gencl:top-4 gencl:size-12 gencl:rounded-full", colors.secondary)} />

      {/* Up/down nav chevrons — right of tile, desktop only */}
      {!isMobile && (
        <div className="gencl:absolute gencl:right-8 gencl:top-1/2 gencl:-translate-y-1/2 gencl:space-y-3">
          <Skeleton className={cn("gencl:size-12 gencl:rounded-full", colors.secondary)} />
          <Skeleton className={cn("gencl:size-12 gencl:rounded-full", colors.secondary)} />
        </div>
      )}

      {/* Centered video tile */}
      <div
        className={cn(
          "gencl:relative gencl:overflow-hidden gencl:rounded-2xl",
          isMobile ? "gencl:w-full gencl:h-full" : "gencl:aspect-reel gencl:h-full"
        )}>
        {/* Plain div, not <Skeleton>: its light base bg survives twMerge (no gencl: prefix) and flashes white. */}
        <div className={cn("gencl:absolute gencl:inset-0 gencl:rounded-2xl gencl:animate-pulse", colors.primary)} />

        {/* Action column (like / mute / play / share) — right edge, 42px like IHeartControls */}
        <div className="gencl:absolute gencl:right-3 gencl:bottom-28 gencl:flex gencl:flex-col gencl:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className={cn("gencl:size-[42px] gencl:shrink-0 gencl:rounded-full", colors.secondary)}
            />
          ))}
        </div>

        {/* Bottom-left brand chip + name/title + 2-line description */}
        <div className="gencl:absolute gencl:bottom-28 gencl:left-4 gencl:right-20 gencl:space-y-3">
          <div className="gencl:flex gencl:items-center gencl:gap-3">
            <Skeleton className={cn("gencl:size-14 gencl:shrink-0 gencl:rounded-md", colors.secondary)} />
            <div className="gencl:w-full gencl:space-y-2">
              <Skeleton className={cn("gencl:h-3.5 gencl:w-1/4 gencl:rounded-md", colors.secondary)} />
              <Skeleton className={cn("gencl:h-3.5 gencl:w-3/5 gencl:rounded-md", colors.secondary)} />
            </div>
          </div>
          <div className="gencl:space-y-2">
            <Skeleton className={cn("gencl:h-3 gencl:w-full gencl:rounded-md", colors.secondary)} />
            <Skeleton className={cn("gencl:h-3 gencl:w-3/4 gencl:rounded-md", colors.secondary)} />
          </div>
        </div>

        {/* Progress bar with scrubber knob */}
        <div className="gencl:absolute gencl:bottom-20 gencl:left-4 gencl:right-4 gencl:flex gencl:items-center">
          <Skeleton className={cn("gencl:h-1 gencl:w-full gencl:rounded-full", colors.secondary)} />
          <Skeleton className={cn("gencl:absolute gencl:left-1/3 gencl:size-3 gencl:rounded-full", colors.secondary)} />
        </div>

        {/* Listen Live / Go to Episodes bar */}
        <Skeleton
          className="gencl:absolute gencl:bottom-4 gencl:left-4 gencl:right-4 gencl:h-14 gencl:rounded-full"
        />
      </div>
    </div>
  );
}
