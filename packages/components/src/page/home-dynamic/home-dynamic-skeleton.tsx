import { Skeleton } from "@genuin/ui/components/skeleton";

function PanelSkeleton() {
  return (
    <div className="gencl:flex gencl:h-full gencl:min-h-[420px] gencl:flex-col gencl:gap-4 gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-4">
      <div className="gencl:flex gencl:items-center gencl:justify-between">
        <Skeleton className="gencl:h-7 gencl:w-36" />
        <Skeleton className="gencl:size-8 gencl:rounded-full" />
      </div>
      <Skeleton className="gencl:min-h-48 gencl:flex-1 gencl:rounded-lg" />
      <div className="gencl:grid gencl:grid-cols-2 gencl:gap-3">
        <Skeleton className="gencl:h-24 gencl:rounded-lg" />
        <Skeleton className="gencl:h-24 gencl:rounded-lg" />
      </div>
    </div>
  );
}

function LinkListSkeleton() {
  return (
    <div className="gencl:flex gencl:h-full gencl:min-h-80 gencl:flex-col gencl:gap-3 gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-4">
      <Skeleton className="gencl:h-7 gencl:w-32" />
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="gencl:flex gencl:items-center gencl:gap-3">
          <Skeleton className="gencl:size-16 gencl:shrink-0 gencl:rounded-lg" />
          <div className="gencl:flex gencl:min-w-0 gencl:flex-1 gencl:flex-col gencl:gap-2">
            <Skeleton className="gencl:h-4 gencl:w-full" />
            <Skeleton className="gencl:h-4 gencl:w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EventStripSkeleton() {
  return (
    <div className="gencl:grid gencl:h-full gencl:min-h-40 gencl:grid-cols-1 gencl:gap-4 gencl:sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="gencl:flex gencl:min-h-36 gencl:flex-col gencl:justify-between gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-4">
          <div className="gencl:flex gencl:items-center gencl:justify-between">
            <Skeleton className="gencl:h-5 gencl:w-24" />
            <Skeleton className="gencl:size-8 gencl:rounded-full" />
          </div>
          <div className="gencl:flex gencl:flex-col gencl:gap-2">
            <Skeleton className="gencl:h-5 gencl:w-4/5" />
            <Skeleton className="gencl:h-4 gencl:w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Page-shaped loading state that mirrors the first Home manifest viewport. */
export function HomeDynamicSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading home content" role="status" className="gencl:w-full">
      <div className="gencl:p-4 gencl:lg:p-5">
        <div className="gencl:grid gencl:grid-cols-1 gencl:gap-4 gencl:lg:h-[574px] gencl:lg:grid-cols-[minmax(0,2fr)_minmax(0,0.75fr)]">
          <Skeleton className="gencl:aspect-video gencl:w-full gencl:rounded-lg gencl:lg:aspect-auto gencl:lg:h-full" />
          <PanelSkeleton />
        </div>
      </div>

      <div className="gencl:p-4 gencl:lg:p-5">
        <div className="gencl:lg:h-[190px]">
          <EventStripSkeleton />
        </div>
      </div>

      <div className="gencl:p-4 gencl:lg:p-5">
        <div className="gencl:grid gencl:grid-cols-1 gencl:gap-4 gencl:lg:h-[441px] gencl:lg:grid-cols-[minmax(0,1.259fr)_minmax(0,0.741fr)_minmax(0,0.75fr)]">
          <Skeleton className="gencl:aspect-video gencl:w-full gencl:rounded-lg gencl:lg:aspect-auto gencl:lg:h-full" />
          <LinkListSkeleton />
          <LinkListSkeleton />
        </div>
      </div>

      <div className="gencl:p-4 gencl:lg:p-5">
        <Skeleton className="gencl:aspect-video gencl:w-full gencl:rounded-lg gencl:lg:h-[419px] gencl:lg:aspect-auto" />
      </div>
    </div>
  );
}
