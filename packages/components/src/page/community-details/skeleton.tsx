import { Skeleton } from "@genuin/ui/skeleton";
import { TabsSkeleton } from "@genuin/ui/tabs";
import { GenericDetailsSkeleton } from "@genuin/components/organisms/generic-details";
import { CommunityGroupsSkeleton } from "@genuin/components/templates/community-details-tabs";

export function CommunityDetailsSkeleton() {
  return (
    <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:px-0 gencl:sm:px-6! gencl:relative">
      <Skeleton className="gencl:w-full gencl:h-15 gencl:sm:h-40!" />
      <div className="gencl:w-full gencl:h-15 gencl:sm:h-40! gencl:left-6 gencl:top-8 gencl:block gencl:sm:hidden! gencl:absolute">
        <Skeleton className="gencl:size-14 gencl:rounded-full" />
      </div>
      <div className="gencl:flex gencl:pt-10 gencl:sm:pt-6 gencl:gap-6 gencl:px-4 gencl:sm:px-0!">
        <div style={{ width: "100%" }}>
          <GenericDetailsSkeleton
            className="gencl:hidden gencl:md:flex!"
            variant="default"
            hasImage={true}
            hasLinks={true}
          />
          <GenericDetailsSkeleton
            className="gencl:flex gencl:md:hidden!"
            variant="default"
            hasImage={false}
            hasLinks={false}
          />
          <TabsSkeleton className="gencl:pt-3 gencl:sm:pt-6!" />
          <div className="gencl:pt-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <CommunityGroupsSkeleton key={idx} />
            ))}
          </div>
        </div>
        {/* Side Info Skeleton */}
        <div
          className="gencl:hidden gencl:md:block!"
          style={{ width: "100%", maxWidth: "384px" }}
        >
          <Skeleton className="gencl:w-full gencl:h-100" />
        </div>
      </div>
    </div>
  );
}
