/**
 * GenericDetailsSkeleton Component
 *
 * A loading skeleton component that provides visual feedback while the GenericDetails
 * component is loading or when content is being fetched. This component helps maintain
 * a smooth user experience by showing a loading state instead of a blank area.
 *
 * Features:
 * - Displays a loader component from the UI library
 * - Consistent with the overall design system
 * - Lightweight and performant
 *
 * @example
 * ```tsx
 * // Show loading state while fetching data
 * {isLoading ? <GenericDetailsSkeleton /> : <GenericDetails {...props} />}
 * ```
 *
 * @returns A JSX element containing the loading skeleton
 */

import { Skeleton } from "@genuin/ui/components/skeleton";
import { cn } from "@genuin/ui/lib/utils";

type SkeletonProps = {
  variant?: "default" | "list";
  className?: string;
  hasImage?: boolean;
  hasLinks?: boolean;
};

export function GenericDetailsSkeleton({
  variant = "default",
  className,
  hasImage = true,
  hasLinks = true,
}: SkeletonProps) {
  if (variant === "list") {
    return (
      <div className={cn("gencl:w-full gencl:flex", className)}>
        <div className="gencl:w-full gencl:flex gencl:gap-6">
          {hasImage && (
            <Skeleton className="gencl:size-16 gencl:rounded-full gencl:shrink-0" />
          )}
          <div className="gencl:flex gencl:flex-col gencl:justify-center gencl:gap-3">
            <Skeleton className="gencl:w-[50%] gencl:h-6 gencl:rounded-md" />
            <div className="gencl:flex gencl:items-center gencl:gap-2">
              {Array.from({ length: 4 }).map((_, idx, arr) => (
                <>
                  <Skeleton
                    key={idx}
                    className="gencl:w-18 gencl:h-4 gencl:rounded-md"
                  />
                  {idx < arr.length - 1 && (
                    <Skeleton
                      key={idx}
                      className="gencl:w-1 gencl:h-1 gencl:rounded-md"
                    />
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="gencl:w-[25%] gencl:h-9 gencl:rounded-md" />
      </div>
    );
  }

  return (
    <div className={cn("gencl:flex gencl:gap-6 gencl:items-center", className)}>
      {hasImage && (
        <Skeleton className="gencl:size-40 gencl:rounded-full gencl:shrink-0" />
      )}
      <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-2">
        <Skeleton className="gencl:w-full gencl:h-9 gencl:rounded-md" />
        <div className="gencl:flex gencl:items-center gencl:gap-2">
          {Array.from({ length: 4 }).map((_, idx, arr) => (
            <div
              key={idx}
              className="gencl:flex gencl:items-center gencl:gap-2"
            >
              <Skeleton className="gencl:w-18 gencl:h-4 gencl:rounded-md" />
              {idx < arr.length - 1 && (
                <Skeleton className="gencl:w-1 gencl:h-1 gencl:rounded-md" />
              )}
            </div>
          ))}
        </div>
        <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-2">
          <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
          <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
        </div>
        {hasLinks && (
          <div className="gencl:flex gencl:gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="gencl:w-6 gencl:h-6 gencl:rounded-md"
              />
            ))}
          </div>
        )}
        <div className="gencl:flex gencl:gap-2">
          <Skeleton className="gencl:sm:w-35! gencl:w-[80%] gencl:h-9 gencl:rounded-md" />
          <Skeleton className="gencl:sm:w-25! gencl:w-[20%] gencl:h-9 gencl:rounded-md" />
        </div>
      </div>
    </div>
  );
}
