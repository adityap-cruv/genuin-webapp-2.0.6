import { Skeleton } from "@genuin/ui/components/skeleton";

import type { SkeletonColumn } from "@genuin/components/organisms/skeleton-table/skeleton-table";
import { SkeletonTable } from "@genuin/components/organisms/skeleton-table/skeleton-table";

const draftVideosColumns: SkeletonColumn[] = [
  {
    width: "gencl:w-[50px]",
    header: <Skeleton className="gencl:h-4 gencl:w-4" />,
    cell: <Skeleton className="gencl:h-4 gencl:w-4" />,
  },
  {
    width: "gencl:w-[300px]",
    header: <Skeleton className="gencl:h-4 gencl:w-20" />,
    cell: (
      <div className="gencl:flex gencl:items-start gencl:space-x-2">
        <Skeleton className="gencl:h-16 gencl:w-9 gencl:rounded gencl:flex-shrink-0" />
        <div className="gencl:flex-1 gencl:space-y-2 gencl:py-1">
          <Skeleton className="gencl:h-3 gencl:w-full" />
          <Skeleton className="gencl:h-3 gencl:w-4/5" />
          <Skeleton className="gencl:h-3 gencl:w-3/5" />
        </div>
      </div>
    ),
  },
  {
    width: "gencl:w-[200px]",
    header: <Skeleton className="gencl:h-4 gencl:w-24" />,
    cell: (
      <div className="gencl:flex gencl:flex-col gencl:space-y-2">
        <Skeleton className="gencl:h-5 gencl:w-16 gencl:rounded-full" />
        <Skeleton className="gencl:h-5 gencl:w-14 gencl:rounded-full" />
      </div>
    ),
  },
  {
    width: "gencl:w-[100px]",
    header: <Skeleton className="gencl:h-4 gencl:w-16" />,
    cell: (
      <div className="gencl:flex gencl:flex-col gencl:space-y-1">
        <Skeleton className="gencl:h-3 gencl:w-12" />
        <Skeleton className="gencl:h-3 gencl:w-8" />
      </div>
    ),
  },
  {
    width: "gencl:w-[100px]",
    header: <Skeleton className="gencl:h-4 gencl:w-20" />,
    cell: <Skeleton className="gencl:h-4 gencl:w-16" />,
  },
  {
    width: "gencl:w-[150px]",
    header: <div className="gencl:flex gencl:items-center gencl:justify-center" />,
    cell: (
      <div className="gencl:flex gencl:items-center gencl:justify-center gencl:space-x-2">
        <Skeleton className="gencl:h-8 gencl:w-8" />
        <Skeleton className="gencl:h-8 gencl:w-8" />
        <Skeleton className="gencl:h-8 gencl:w-8" />
      </div>
    ),
  },
];

interface DraftVideosTableSkeletonProps {
  /** Number of skeleton rows to display. Defaults to 5 */
  rows?: number;
}

/**
 * Skeleton loader component for the Draft Videos table.
 * Displays a shimmer effect while the actual data is loading.
 *
 * @param rows - Number of skeleton rows to display (default: 5)
 */
export function DraftVideosTableSkeleton({ rows = 5 }: DraftVideosTableSkeletonProps) {
  return <SkeletonTable columns={draftVideosColumns} rows={rows} />;
}
