import { Skeleton } from "@genuin/ui/components/skeleton";
import { CommunityCardSkeleton } from "@genuin/components/organisms/community-card";

export function TrendingCommunitiesSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-4">
        <Skeleton className="gencl:w-[25%] gencl:h-8" />
        {/* Only show the "See more" button on tablet and up */}
        <Skeleton className="gencl:hidden gencl:md:block gencl:w-32 gencl:h-6" />
      </div>

      {/* Mobile view (default) */}
      <div className="gencl:flex gencl:overflow-x-auto gencl:gap-2 gencl:pb-4 gencl:md:hidden">
        <CommunitiesSkeleton noOfCommunities={3} />
      </div>

      {/* Desktop view (md and up) */}
      <div className="gencl:hidden gencl:md:grid gencl:grid-cols-1 gencl:md:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-x-2 gencl:gap-y-4">
        <CommunitiesSkeleton noOfCommunities={3} />
      </div>
    </div>
  );
}

function CommunitiesSkeleton({
  noOfCommunities = 1,
}: {
  noOfCommunities: number;
}) {
  return (
    <>
      {Array.from({ length: noOfCommunities }).map((_, index) => (
        <CommunityCardSkeleton key={index} />
      ))}
    </>
  );
}
