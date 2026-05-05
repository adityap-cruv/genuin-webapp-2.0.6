"use client";
import { cn } from "@genuin/ui/lib/utils";
import { Skeleton } from "@genuin/ui/skeleton";
import type { FC } from "react";

import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { CommentsItemSkeleton } from "@genuin/components/molecules/comments/comment-item-skeleton";

export type FeedSkeletonProps = {
  variant?: "default" | "fullscreen" | "player-list" | "side-panel";
  theme?: "light" | "dark";
  showCommentsSkeleton?: boolean;
};

type SkeletonColors = {
  container: string;
  primary: string;
  secondary: string;
};

// Internal sub-component for mobile player overlay (owner info, description, pills, action buttons)
const MobilePlayerOverlay: FC<{ colors: SkeletonColors }> = ({ colors }) => (
  <div className="gencl:flex gencl:sm:hidden! gencl:absolute gencl:bottom-0 gencl:left-1/2 gencl:-translate-x-1/2 gencl:p-4 gencl:justify-between gencl:items-end gencl:gap-4 gencl:w-screen gencl:max-w-full">
    <div className="gencl:w-full">
      {/* Owner info */}
      <div className="gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-3 gencl:mt-0">
        <Skeleton className={cn("gencl:size-10 gencl:rounded-full gencl:shrink-0", colors.secondary)} />
        <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
          <Skeleton className={cn("gencl:w-1/2 gencl:h-3 gencl:rounded-md gencl:mt-1.5", colors.secondary)} />
        </div>
      </div>
      {/* Description */}
      <div className="gencl:mb-3 gencl:mt-0">
        <Skeleton className={cn("gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5", colors.secondary)} />
        <Skeleton className={cn("gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5", colors.secondary)} />
      </div>
      {/* Pills */}
      <div className="gencl:flex gencl:gap-2">
        <Skeleton
          className={cn("gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7", colors.secondary)}
        />
        <Skeleton
          className={cn("gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7", colors.secondary)}
        />
      </div>
    </div>
    {/* Mobile action buttons */}
    <div className="gencl:flex gencl:sm:hidden! gencl:gap-4 gencl:flex-col gencl:justify-end gencl:w-12">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className={cn("gencl:size-10 gencl:rounded-full gencl:shrink-0", colors.secondary)} />
      ))}
    </div>
  </div>
);

// Internal sub-component for vertical action buttons (desktop)
const ActionButtonsSkeleton: FC<{ colors: SkeletonColors }> = ({ colors }) => (
  <div className="gencl:flex gencl:gap-4 gencl:flex-col gencl:justify-end gencl:w-13 gencl:pb-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <Skeleton key={index} className={cn("gencl:size-12 gencl:rounded-full gencl:shrink-0", colors.secondary)} />
    ))}
  </div>
);

// Internal sub-component for player skeleton (video)
const PlayerSkeleton: FC<{ colors: SkeletonColors; isMobile: boolean }> = ({ colors, isMobile }) => (
  <div className={cn("gencl:relative", isMobile ? "gencl:w-full gencl:h-full" : "gencl:aspect-reel gencl:h-full")}>
    <Skeleton
      className={cn("gencl:w-full gencl:h-full gencl:bg-secondary-500 gencl:sm:bg-secondary-100!", colors.primary)}
    />
    <MobilePlayerOverlay colors={colors} />
  </div>
);

// Internal sub-component for side panel skeleton
const SidePanelSkeleton: FC<{ theme: "light" | "dark" }> = ({ theme }) => (
  <div className="gencl:w-full gencl:h-full gencl:overflow-auto gencl:max-w-[520px] gencl:gap-4 gencl:grid gencl:grid-rows-[auto_minmax(300px,1fr)]">
    {/* Post details section */}
    <div
      className={cn(
        "gencl:border gencl:p-4 gencl:rounded-2xl",
        theme === "light" ? "gencl:border-secondary-150" : "gencl:border-secondary-800"
      )}>
      {/* Owner info */}
      <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-3 gencl:mt-0">
        <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
        <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
          <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
        </div>
      </div>
      {/* Description */}
      <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
      {/* Pills */}
      <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mt-3">
        <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7" />
        <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7" />
      </div>
    </div>
    {/* Comments section */}
    <div
      className={cn(
        "gencl:relative gencl:border gencl:p-4 gencl:rounded-2xl",
        theme === "light" ? "gencl:border-secondary-150" : "gencl:border-secondary-800"
      )}>
      {Array.from({ length: 4 }).map((_, index) => (
        <CommentsItemSkeleton key={index} />
      ))}
      {/* Comment input */}
      <div
        className={cn(
          "gencl:absolute gencl:rounded-b-3xl gencl:bottom-0 gencl:right-0 gencl:flex gencl:w-full gencl:items-center gencl:justify-between gencl:gap-x-4 gencl:border-t gencl:p-4",
          theme === "light" ? "gencl:bg-white gencl:border-secondary-150" : "gencl:bg-black gencl:border-secondary-800"
        )}>
        <div
          className={cn(
            "gencl:w-full gencl:rounded-lg gencl:h-10 gencl:border gencl:p-2 gencl:flex gencl:justify-center gencl:items-center",
            theme === "light" ? "gencl:border-secondary-150" : "gencl:border-secondary-800"
          )}>
          <Skeleton
            className={cn(
              "gencl:h-3 gencl:w-full",
              theme === "light" ? "gencl:bg-secondary-150" : "gencl:bg-secondary-800"
            )}
          />
        </div>
        <Skeleton className="gencl:h-6 gencl:w-10 gencl:shrink-0" />
      </div>
    </div>
  </div>
);

export const FeedSkeleton: FC<FeedSkeletonProps> = ({
  variant = "default",
  theme = "dark",
  showCommentsSkeleton = false,
}) => {
  const { isMobile } = useDeviceDetectMediaQuery();
  const skeletonTheme = {
    light: {
      container: "gencl:bg-secondary-100",
      primary: "gencl:bg-secondary-200",
      secondary: "gencl:bg-secondary-300",
    },
    dark: {
      container: "gencl:bg-black",
      primary: "gencl:bg-secondary-900",
      secondary: "gencl:bg-secondary-800",
    },
  } as const;
  const colors = skeletonTheme[theme];

  // Player-list variant: Just the video player with action buttons
  if (variant === "player-list") {
    return (
      <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-3">
        <PlayerSkeleton colors={colors} isMobile={isMobile} />
        <div className="gencl:hidden gencl:sm:flex! gencl:gap-4 gencl:flex-col gencl:justify-end gencl:w-13">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className={cn("gencl:size-12 gencl:rounded-full gencl:shrink-0", colors.secondary)} />
          ))}
        </div>
      </div>
    );
  }

  // Side-panel variant: Just the side panel skeleton
  if (variant === "side-panel") {
    return <SidePanelSkeleton theme={theme} />;
  }

  // Fullscreen variant: Fixed overlay with player + action buttons + optional comments
  if (variant === "fullscreen") {
    return (
      <div
        className={cn(
          "gencl:fixed gencl:inset-0 gencl:z-50 gencl:flex gencl:items-center gencl:justify-center gencl:gap-6",
          colors.container
        )}>
        {/* Mobile view */}
        <div
          className={cn(
            "gencl:relative gencl:block gencl:sm:hidden!",
            isMobile ? "gencl:w-full gencl:h-full" : "gencl:aspect-reel gencl:h-full"
          )}>
          <Skeleton className={cn("gencl:w-full gencl:h-full gencl:sm:bg-secondary-900!", colors.primary)} />
          <MobilePlayerOverlay colors={colors} />
        </div>

        {/* Desktop view: action items shimmer */}
        <div className="gencl:h-full gencl:gap-6 gencl:hidden gencl:sm:flex!">
          <Skeleton className={cn("gencl:aspect-reel gencl:h-full", colors.primary)} />
          <ActionButtonsSkeleton colors={colors} />
        </div>

        {/* comment box shimmer */}
        {showCommentsSkeleton && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:py-6 gencl:hidden gencl:sm:block!">
            <Skeleton className={cn("gencl:w-full gencl:h-full gencl:py-6 gencl:rounded-2xl", colors.primary)} />
          </div>
        )}

        {/* Top right action buttons (close/expand) */}
        <div className="gencl:absolute gencl:right-7.5 gencl:space-y-4 gencl:hidden gencl:sm:block!">
          <Skeleton className={cn("gencl:size-12 gencl:rounded-full gencl:shrink-0", colors.secondary)} />
          <Skeleton className={cn("gencl:size-12 gencl:rounded-full gencl:shrink-0", colors.secondary)} />
        </div>
      </div>
    );
  }

  // Default (split) skeleton layout: main video area + side panel
  return (
    <div
      className={cn(
        "gencl:flex gencl:w-full gencl:sm:py-4 gencl:sm:pr-4 gencl:h-full gencl:sm:h-[calc(100vh-64px)]! gencl:gap-4"
      )}>
      {/* Main video area skeleton (matches PlayerList container) */}
      <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-3">
        <PlayerSkeleton colors={colors} isMobile={isMobile} />
        <div className="gencl:hidden gencl:sm:flex! gencl:gap-4 gencl:flex-col gencl:justify-end gencl:w-13">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className={cn("gencl:size-12 gencl:rounded-full gencl:shrink-0", colors.secondary)} />
          ))}
        </div>
      </div>

      {/* Side panel skeleton (matches PostSidePanel) */}
      <div className="gencl:hidden gencl:lg:block!">
        <SidePanelSkeleton theme={theme} />
      </div>
    </div>
  );
};
