"use client";
import { FC } from "react";
import { Skeleton } from "@genuin/ui/skeleton";
import { cn } from "@genuin/ui/lib/utils";
import { CommentsItemSkeleton } from "@genuin/components/molecules/comments/comment-item";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

export type FeedSkeletonProps = {
  variant?: "default" | "fullscreen";
};

export const FeedSkeleton: FC<FeedSkeletonProps> = ({
  variant = "default",
}) => {
  const { isMobile } = useDeviceDetectMediaQuery();
  if (variant === "fullscreen") {
    return (
      <div className="gencl:fixed gencl:inset-0 gencl:bg-black gencl:z-50 gencl:flex gencl:items-center gencl:justify-center gencl:gap-6">
        <div className="gencl:h-full gencl:flex gencl:gap-2">
          <Skeleton className="gencl:aspect-reel gencl:h-full" />
          <div className="gencl:flex gencl:gap-4 gencl:flex-col gencl:justify-end gencl:w-13">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="gencl:size-12 gencl:rounded-full gencl:shrink-0"
              />
            ))}
          </div>
        </div>

        <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:py-6">
          <Skeleton className="gencl:w-full gencl:h-full gencl:py-6 gencl:rounded-2xl" />
        </div>

        <div className="gencl:absolute gencl:right-7.5 gencl:space-y-2">
          <Skeleton className="gencl:size-12 gencl:rounded-full gencl:shrink-0" />
          <Skeleton className="gencl:size-12 gencl:rounded-full gencl:shrink-0" />
        </div>
      </div>
    );
  }

  // Default (split) skeleton layout: main video area + side panel
  return (
    <div
      className={cn(
        "gencl:flex gencl:w-full gencl:sm:py-4 gencl:sm:pr-4 gencl:h-full gencl:sm:h-[calc(100vh-64px)]! gencl:gap-4"
      )}
    >
      {/* Main video area skeleton (matches PlayerList container) */}
      <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-3 ">
        <div
          className={cn(
            "gencl:relative",
            isMobile
              ? "gencl:w-full gencl:h-full"
              : "gencl:aspect-reel gencl:h-full"
          )}
        >
          <Skeleton className="gencl:w-full gencl:h-full gencl:bg-secondary-500 gencl:sm:bg-secondary-100!" />

          <div className="gencl:flex gencl:sm:hidden! gencl:absolute gencl:bottom-0 gencl:left-1/2 gencl:-translate-x-1/2 gencl:p-4 gencl:justify-between gencl:items-end gencl:gap-4 gencl:w-screen gencl:max-w-full">
            <div className="gencl:w-full">
              <div className="gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-3 gencl:mt-0">
                <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
                <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
                  <Skeleton className="gencl:w-1/2 gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
                </div>
              </div>
              <div className="gencl:mb-3 gencl:mt-0">
                <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
                <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
              </div>
              <div className="gencl:flex gencl:gap-2">
                <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7" />
                <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7" />
              </div>
            </div>
            <div className="gencl:flex gencl:sm:hidden! gencl:gap-4 gencl:flex-col gencl:justify-end gencl:w-12">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="gencl:size-10 gencl:rounded-full gencl:shrink-0"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="gencl:hidden gencl:sm:flex! gencl:gap-4 gencl:flex-col gencl:justify-end gencl:w-13">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className="gencl:size-12 gencl:rounded-full gencl:shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Side panel skeleton (matches PostSidePanel) */}
      <div className="gencl:hidden gencl:lg:grid! gencl:w-full gencl:h-full gencl:overflow-auto gencl:max-w-[520px] gencl:gap-4 gencl:grid-rows-[auto_minmax(300px,1fr)]">
        <div className="gencl:border gencl:border-secondary-150 gencl:p-4 gencl:rounded-2xl ">
          <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-3 gencl:mt-0">
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
            <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
              <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
            </div>
          </div>
          <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
          <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mt-3">
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7" />
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-7" />
          </div>
        </div>
        <div className="gencl:relative gencl:border gencl:border-secondary-150 gencl:p-4 gencl:rounded-2xl">
          {Array.from({ length: 4 }).map((_, index) => (
            <CommentsItemSkeleton key={index} />
          ))}
          <div className="gencl:absolute gencl:bg-white gencl:rounded-b-3xl gencl:bottom-0 gencl:right-0 gencl:flex gencl:w-full gencl:items-center gencl:justify-between gencl:gap-x-4 gencl:border-t gencl:border-secondary-150 gencl:p-4">
            <div className="gencl:w-full gencl:rounded-lg gencl:h-10 gencl:border gencl:border-secondary-150 gencl:p-2 gencl:flex gencl:justify-center gencl:items-center">
              <Skeleton className="gencl:h-3 gencl:w-full gencl:bg-secondary-150" />
            </div>
            <Skeleton className="gencl:h-6 gencl:w-10 gencl:shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
