import { Skeleton } from "@genuin/ui/skeleton";
import { TabsSkeleton } from "@genuin/ui/tabs";

import { GenericDetailsSkeleton } from "@genuin/components/organisms/generic-details";
import { CommunityGroupsSkeleton } from "@genuin/components/templates/community-details-tabs";

export function CommunityDetailsSkeleton() {
  return (
    <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:px-0 gencl:md:px-6! gencl:md:pt-6! gencl:relative">
      <div className="gencl:flex gencl:gap-6">
        <div className="gencl:flex-1 gencl:flex gencl:justify-center gencl:min-w-0">
          <div className="gencl:w-full gencl:max-w-7xl">
            <div className="gencl:relative gencl:h-auto">
              <Skeleton className="gencl:w-full gencl:aspect-[5/1] gencl:rounded-none gencl:sm:rounded-lg!" />
              <div className="gencl:absolute gencl:left-4 gencl:bottom-0 gencl:translate-y-1/2 gencl:block gencl:sm:hidden!">
                <Skeleton className="gencl:size-14 gencl:rounded-full" />
              </div>
            </div>
            <div className="gencl:pt-10 gencl:sm:pt-6!">
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
              <TabsSkeleton noOfTabs={3} className="gencl:pt-3 gencl:sm:pt-6! gencl:lg:[&>div>:last-child]:hidden!" />
              <div className="gencl:pt-6">
                <CommunityGroupsSkeleton />
              </div>
            </div>
          </div>
        </div>
        {/* Side Info Skeleton */}
        <div className="gencl:hidden gencl:lg:block!" style={{ width: "100%", maxWidth: "20rem" }}>
          <Skeleton className="gencl:w-full gencl:h-[600px]" />
        </div>
      </div>
    </div>
  );
}
