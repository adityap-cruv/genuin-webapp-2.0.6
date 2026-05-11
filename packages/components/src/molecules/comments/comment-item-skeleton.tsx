import { Skeleton } from "@genuin/ui/components/skeleton";

/**
 * Lightweight skeleton component for comment items
 * Separated from comment-item.tsx to avoid bundling heavy dependencies
 * (VideoPlayer, Audio, Feed context, etc.) into skeleton chunks
 */
export function CommentsItemSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-4">
      <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
      <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
        <Skeleton className="gencl:w-4 gencl:h-5 gencl:rounded-md" />
      </div>
    </div>
  );
}
