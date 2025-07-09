import { ComponentProps, ReactNode } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { SEARCH_MODAL_CLASSES } from "../constants";

// Shared component types
export interface BaseSearchItemProps {
  id: string;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

// Shared Empty State Component
export function SearchEmptyState({
  title,
  subtitle,
  icon,
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        SEARCH_MODAL_CLASSES.CENTERED_MESSAGE,
        "gencl:min-h-[400px] gencl:text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="gencl:mb-4 gencl:text-secondary-200">{icon}</div>
      )}
      <div className="gencl:space-y-2 gencl:z-10">
        <h3 className="gencl:text-headline-2-semi-bold gencl:text-black gencl:mb-2">
          {title}
        </h3>
        {subtitle && (
          <p className="gencl:text-body-1-medium gencl:text-secondary-600">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

// Shared Error State Component
export function SearchErrorState({
  message = "Failed to load results. Please try again.",
  className,
  ...props
}: ComponentProps<"div"> & {
  message?: string;
}) {
  return (
    <div
      className={cn(SEARCH_MODAL_CLASSES.CENTERED_MESSAGE, className)}
      {...props}
    >
      <div className="gencl:text-sm gencl:text-red-500">{message}</div>
    </div>
  );
}

// Shared Loading State Component
export function SearchLoadingState({
  count = 5,
  SkeletonComponent,
  className,
  ...props
}: ComponentProps<"div"> & {
  count?: number;
  SkeletonComponent: React.ComponentType;
}) {
  return (
    <div className={cn("gencl:space-y-3 gencl:p-4", className)} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={`skeleton-${index}`} />
      ))}
    </div>
  );
}
