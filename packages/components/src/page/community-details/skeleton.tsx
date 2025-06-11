import { Skeleton } from "@genuin/ui/skeleton";
import { TabsSkeleton } from "@genuin/ui/tabs";
import { GenericDetailsSkeleton } from "@organisms/generic-details";
import { CommunityGroupsSkeleton } from "src/templates/community-details-tabs";

export function CommunityDetailsSkeleton() {
  return (
    <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:px-6">
      <Skeleton className="gencl:w-full gencl:h-40" />
      <div className="gencl:flex gencl:pt-6 gencl:gap-6">
        <div style={{ width: "100%" }}>
          <GenericDetailsSkeleton variant="default" />
          <TabsSkeleton className="gencl:pt-6" />
          <div className="gencl:pt-6">
            {Array.from({ length: 5 }).map(() => (
              <CommunityGroupsSkeleton />
            ))}
          </div>
        </div>
        {/* Side Info Skeleton */}
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <Skeleton className="gencl:w-full gencl:h-100" />
        </div>
      </div>
    </div>
  );
}
