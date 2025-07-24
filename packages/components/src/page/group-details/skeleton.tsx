import { PostsGridSkeleton } from "@genuin/components/organisms/posts-grid";
import { GenericDetailsSkeleton } from "@genuin/components/organisms";
import { TabsSkeleton } from "@genuin/ui/components/tabs";
import { Skeleton } from "@genuin/ui/components/skeleton";

export function GroupDetailsSkeleton() {
  return (
    <div className="gencl:sm:p-6! gencl:p-4 gencl:flex gencl:h-full gencl:gap-6 gencl:flex-grow gencl:overflow-auto">
      <div className="gencl:w-full gencl:sm:overflow-auto! gencl:flex gencl:flex-col gencl:gap-6">
        <GenericDetailsSkeleton
          variant="default"
          hasImage={false}
          hasLinks={false}
        />
        <TabsSkeleton />
        <PostsGridSkeleton className="gencl:grid-cols-2!" noOfPosts={6} />
      </div>
      <div
        className="gencl:hidden gencl:sm:block!"
        style={{ width: "100%", maxWidth: "320px" }}
      >
        <Skeleton className="gencl:w-full gencl:h-49" />
      </div>
    </div>
  );
}
