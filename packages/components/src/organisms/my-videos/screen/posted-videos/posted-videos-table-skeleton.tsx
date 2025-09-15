import {
  SkeletonColumn,
  SkeletonTable,
} from "@genuin/components/organisms/skeleton-table/skeleton-table";
import { Skeleton } from "@genuin/ui/components/skeleton";
import {
  PlayIcon,
  SparkIcon,
  ShareIcon,
  CommentIcon,
  RepostIcon,
} from "@genuin/ui/icons";

const postedVideosColumns: SkeletonColumn[] = [
  {
    width: "gencl:w-[50px]",
    header: <Skeleton className="gencl:h-4 gencl:w-4" />,
    cell: <Skeleton className="gencl:h-4 gencl:w-4" />,
  },
  {
    width: "gencl:w-[400px]",
    header: <Skeleton className="gencl:h-4 gencl:w-12" />,
    cell: (
      <div className="gencl:flex gencl:items-center gencl:space-x-3">
        <Skeleton className="gencl:h-16 gencl:w-9 gencl:rounded" />
        <div className="gencl:space-y-2">
          <Skeleton className="gencl:h-4 gencl:w-48" />
          <Skeleton className="gencl:h-3 gencl:w-32" />
        </div>
      </div>
    ),
  },
  {
    width: "gencl:w-[200px]",
    header: <Skeleton className="gencl:h-4 gencl:w-24" />,
    cell: (
      <div className="gencl:flex gencl:flex-col gencl:space-y-1">
        <Skeleton className="gencl:h-5 gencl:w-16 gencl:rounded-full" />
        <Skeleton className="gencl:h-5 gencl:w-14 gencl:rounded-full" />
      </div>
    ),
  },
  {
    width: "gencl:w-[150px]",
    header: <Skeleton className="gencl:h-4 gencl:w-8" />,
    cell: <Skeleton className="gencl:h-4 gencl:w-16" />,
  },
  {
    width: "gencl:w-[100px]",
    header: <Skeleton className="gencl:h-4 gencl:w-8" />,
    cell: <Skeleton className="gencl:h-4 gencl:w-16" />,
  },
  {
    width: "gencl:w-[50px]",
    header: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <PlayIcon theme="light" size={"lg"} className="gencl:opacity-30" />
      </div>
    ),
    cell: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <Skeleton className="gencl:h-4 gencl:w-6" />
      </div>
    ),
  },
  {
    width: "gencl:w-[50px]",
    header: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <SparkIcon theme="light" size={"lg"} className="gencl:opacity-30" />
      </div>
    ),
    cell: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <Skeleton className="gencl:h-4 gencl:w-6" />
      </div>
    ),
  },
  {
    width: "gencl:w-[50px]",
    header: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <ShareIcon theme="light" size={"lg"} className="gencl:opacity-30" />
      </div>
    ),
    cell: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <Skeleton className="gencl:h-4 gencl:w-6" />
      </div>
    ),
  },
  {
    width: "gencl:w-[50px]",
    header: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <CommentIcon theme="light" size={"lg"} className="gencl:opacity-30" />
      </div>
    ),
    cell: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <Skeleton className="gencl:h-4 gencl:w-6" />
      </div>
    ),
  },
  {
    width: "gencl:w-[50px]",
    header: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <RepostIcon theme="light" size={"lg"} className="gencl:opacity-30" />
      </div>
    ),
    cell: (
      <div className="gencl:flex gencl:items-center gencl:justify-center">
        <Skeleton className="gencl:h-4 gencl:w-6" />
      </div>
    ),
  },
  {
    width: "gencl:w-[150px]",
    header: (
      <div className="gencl:flex gencl:items-center gencl:justify-center" />
    ),
    cell: (
      <div className="gencl:flex gencl:items-center gencl:justify-center gencl:space-x-2">
        <Skeleton className="gencl:h-8 gencl:w-8" />
        <Skeleton className="gencl:h-8 gencl:w-8" />
        <Skeleton className="gencl:h-8 gencl:w-8" />
      </div>
    ),
  },
];

interface PostedVideosTableSkeletonProps {
  /** Number of skeleton rows to display. Defaults to 5 */
  rows?: number;
}

/**
 * Skeleton loader component for the My Videos table.
 * Displays a shimmer effect while the actual data is loading.
 *
 * @param rows - Number of skeleton rows to display (default: 5)
 */
export function PostedVideosTableSkeleton({
  rows = 5,
}: PostedVideosTableSkeletonProps) {
  return <SkeletonTable columns={postedVideosColumns} rows={rows} />;
}
