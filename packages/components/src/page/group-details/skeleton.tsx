import { Skeleton } from "@genuin/ui/components/skeleton";
import { TabsSkeleton } from "@genuin/ui/components/tabs";

import { GenericDetailsSkeleton } from "@genuin/components/organisms";
import { PostsGridSkeleton } from "@genuin/components/organisms/posts-grid";

export function GroupDetailsSkeleton() {
  return (
    <div className="gencl:sm:p-6! gencl:p-4 gencl:h-full gencl:flex-grow gencl:overflow-auto">
      <div className="gencl:flex gencl:gap-6">
        <div className="gencl:flex-1 gencl:flex gencl:justify-center gencl:min-w-0">
          <div className="gencl:w-full gencl:max-w-7xl gencl:sm:overflow-auto! gencl:flex gencl:flex-col gencl:gap-6">
            <GenericDetailsSkeleton variant="default" hasImage={false} hasLinks={false} />
            <TabsSkeleton noOfTabs={3} className="gencl:lg:[&>div>:last-child]:hidden!" />
            <PostsGridSkeleton className="gencl:grid-cols-2!" noOfPosts={6} />
          </div>
        </div>
        <div className="gencl:hidden gencl:lg:block!" style={{ width: "100%", maxWidth: "20rem" }}>
          <Skeleton className="gencl:w-full gencl:h-49" />
        </div>
      </div>
    </div>
  );
}
