import { CommunityGroupSelectorSkeleton } from "@genuin/components/molecules/community-group-selector";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { ChevronRightIcon } from "@genuin/ui/icons";

export function EditPostSkeleton() {
  return (
    <div className="gencl:bg-secondary-50 gencl:h-full">
      <div className="gencl:flex gencl:flex-col gencl:h-full bg-white gencl:overflow-hidden gencl:max-w-5xl gencl:m-auto">
        {/* Sticky Header */}
        <div className="gencl:sticky gencl:top-0 gencl:z-10 gencl:flex gencl:justify-between gencl:items-center gencl:border-b gencl:border-secondary-150 gencl:bg-white gencl:p-6">
          <div className="gencl:w-full gencl:flex gencl:items-center">
            <Skeleton className="gencl:h-4 gencl:w-1/6" />
            <span className="gencl:px-4">
              <ChevronRightIcon className="gencl:size-3" />
            </span>
            <Skeleton className="gencl:h-4 gencl:w-1/6" />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="gencl:flex gencl:h-full">
          <Skeleton className="gencl:h-full gencl:rounded-none gencl:flex-shrink-0 gencl:w-100" />

          <div className="gencl:flex gencl:flex-col gencl:space-y-5 gencl:w-full gencl:p-6">
            <div className="gencl:flex gencl:gap-2 gencl:items-center">
              <Skeleton className="gencl:w-20 gencl:h-4" />
              <Skeleton className="gencl:w-30 gencl:h-10 gencl:rounded-full" />
            </div>
            {/* Description Text Area */}
            <Skeleton className="gencl:w-full gencl:h-30 gencl:rounded-lg" />

            {/* Linkout & Location Fields */}
            <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-2">
              <Skeleton className="gencl:w-full gencl:h-10 gencl:rounded-lg" />
              <Skeleton className="gencl:w-full gencl:h-10 gencl:rounded-lg" />
            </div>

            <div className="gencl:flex gencl:flex-col gencl:gap-4">
              <Skeleton className="gencl:w-30 gencl:h-4" />
              <CommunityGroupSelectorSkeleton />
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="gencl:sticky gencl:bottom-0 gencl:z-10 gencl:flex gencl:justify-between gencl:items-center gencl:border-t gencl:border-secondary-150 gencl:bg-white gencl:p-3">
          <span className="gencl:flex gencl:w-full gencl:gap-2 gencl:items-center gencl:text-body-1-medium gencl:text-secondary-900 gencl:transition-opacity gencl:duration-300">
            <Skeleton className="gencl:w-4 gencl:h-4" />
            <Skeleton className="gencl:w-1/2 gencl:h-4" />
          </span>
          <div className="flex gap-2">
            <Skeleton className="gencl:w-[100px] gencl:h-10 gencl:rounded-lg" />
            <Skeleton className="gencl:w-[100px] gencl:h-10 gencl:rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
