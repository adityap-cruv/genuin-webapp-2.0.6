"use client";
import { Skeleton } from "@genuin/ui/skeleton";
import { CommentsItemSkeleton } from "@genuin/components/organisms/comments/comment-item";

export function FeedSkeleton() {
  return (
    <div className="gencl:grid gencl:mt-7 gencl:w-full gencl:h-full gencl:grid-cols-2 gencl:pb-7 ">
      <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-2 gencl:pe-4">
        <Skeleton className="gencl:w-100" />
        <div className="gencl:flex gencl:gap-4 gencl:flex-col-reverse gencl:w-13 gencl:mb-12">
          {Array.from({ length: 5 }).map(() => (
            <Skeleton className="gencl:size-12 gencl:rounded-full gencl:shrink-0" />
          ))}
        </div>
      </div>
      <div className="gencl:w-full gencl:grid gencl:overflow-auto gencl:gap-4 gencl:grid-rows-[auto_minmax(200px,1fr)]">
        <div className="gencl:border gencl:border-secondary-200 gencl:p-4 gencl:rounded-2xl gencl:h-[calc(100%-1px)]">
          <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-5 gencl:mt-0">
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
            <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
              <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
            </div>
          </div>
          <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
          <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mt-3">
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-9" />
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-9" />
          </div>
        </div>
        <div className="gencl:relative gencl:border gencl:border-secondary-200 gencl:p-4 gencl:rounded-2xl">
          {Array.from({ length: 8 }).map(() => (
            <CommentsItemSkeleton />
          ))}
          <div className="gencl:absolute gencl:bg-white gencl:bottom-0 gencl:right-0 gencl:flex gencl:w-full gencl:items-center gencl:justify-between gencl:gap-x-4 gencl:border-t gencl:border-secondary-200 gencl:p-4">
            <div className="gencl:w-full gencl:rounded-lg gencl:h-10 gencl:border gencl:border-secondary-150 gencl:p-2 gencl:flex gencl:justify-center gencl:items-center">
              <Skeleton className="gencl:h-3 gencl:w-full gencl:bg-secondary-150" />
            </div>
            <Skeleton className="gencl:h-6 gencl:w-10 gencl:shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
