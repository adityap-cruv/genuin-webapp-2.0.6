import { Skeleton } from "@genuin/ui/components/skeleton";
import { cn } from "@genuin/ui/lib/utils";
import { CommunityGroupsSkeleton } from "../community-details-tabs";

function CommunitySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("gencl:w-full gencl:flex", className)}>
      <div className="gencl:w-full gencl:flex gencl:gap-6">
        <Skeleton className="gencl:size-16 gencl:rounded-full gencl:shrink-0" />
        <div className="gencl:flex gencl:flex-col gencl:justify-center gencl:gap-3">
          <Skeleton className="gencl:w-[50%] gencl:h-6 gencl:rounded-md" />
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            {Array.from({ length: 4 }).map((_, idx, arr) => (
              <>
                <Skeleton className="gencl:w-18 gencl:h-4 gencl:rounded-md" />
                {idx < arr.length - 1 && (
                  <Skeleton className="gencl:w-1 gencl:h-1 gencl:rounded-md" />
                )}
              </>
            ))}
          </div>
        </div>
      </div>
      <div className="gencl:flex gencl:gap-2">
        <Skeleton className="gencl:w-20 gencl:h-9 gencl:rounded-full" />
        <Skeleton className="gencl:w-15 gencl:h-9 gencl:rounded-md" />
        <Skeleton className="gencl:w-25 gencl:h-9 gencl:rounded-md" />
      </div>
    </div>
  );
}

function CommunityListSkeleton() {
  return (
    <div className="gencl:w-full gencl:space-y-6 gencl:pb-6">
      <CommunitySkeleton />
      <GroupsSkeleton />
    </div>
  );
}

function GroupsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("gencl:ps-19", className)}>
      {Array.from({ length: 3 }).map(() => (
        <CommunityGroupsSkeleton />
      ))}
    </div>
  );
}

export { CommunitySkeleton, CommunityListSkeleton, GroupsSkeleton };
