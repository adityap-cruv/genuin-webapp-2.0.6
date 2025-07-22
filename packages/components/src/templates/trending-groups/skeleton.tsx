import { TrendingGroupCardSkeleton } from "@genuin/components/organisms/trending-groups-card";
import { Skeleton } from "@genuin/ui/components/skeleton";

export function TrendingGroupsSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-4">
      {/* Header with conditional "See more" button */}
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch">
        <Skeleton className="gencl:w-40 gencl:h-6" />
        <Skeleton className="gencl:hidden gencl:md:block gencl:w-20 gencl:h-6" />
      </div>

      {/* Mobile View Skeleton (default for smaller than md screens) */}
      <div className="gencl:flex gencl:overflow-x-auto gencl:gap-2 gencl:pb-4 gencl:md:hidden">
        <GroupsSkeleton noOfGroups={3} />
      </div>

      {/* Desktop View Skeleton (md and larger screens) */}
      <div className="gencl:hidden gencl:md:grid gencl:grid-cols-1 gencl:md:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-3">
        <GroupsSkeleton noOfGroups={3} />
      </div>
    </div>
  );
}

function GroupsSkeleton({ noOfGroups = 1 }: { noOfGroups: number }) {
  return (
    <>
      {Array.from({ length: noOfGroups }).map((_, index) => (
        <TrendingGroupCardSkeleton key={index} />
      ))}
    </>
  );
}
