import { Avatar } from "@genuin/ui/avatar";
import { ReadMore, type ReadMoreTextType } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import { Skeleton } from "@genuin/ui/skeleton";
import { type ComponentProps, type ReactNode } from "react";

import { Link } from "@molecules/link";
import type { LinksType } from "@molecules/social-links";
import { SocialLinks } from "@molecules/social-links";

/**
 * Configuration for the profile image displayed in the generic details component.
 */
type ProfileImageDetails = {
  /** Alternative text for the image, used for accessibility */
  alt: string;
  /** URL of the image to be displayed */
  imageUrl: string;
  /** Whether the image should be rendered as an avatar */
  isAvatar: boolean;
};

/**
 * Props for the GenericDetails component.
 */
type GenericDetailsProps = {
  /**
   * default - It will be rendered default for community, brand/profile, and group details pages.
   *
   * list - It can also be used for list view community, group details.
   */
  variant?: "default" | "list";
  /**
   * Optional profile image configuration. When provided, displays an avatar
   * with the specified image URL, alt text, and avatar styling.
   */
  profileImageDetails?: ProfileImageDetails;
  /**
   * Optional title text to display. When provided, renders as a headline
   * using the headline-2-semi-bold styling.
   */
  title: string;
  /**
   * Pass it if you want to render user.
   */
  userLogoType?: number | null;
  /**
   * Pass the url if you want to make the title clickable.
   */
  url?: string;
  /**
   * Optional metadata component for displaying additional information such as brand details and stats.
   */
  metadata: ReactNode;
  /**
   * Description text to display. This can be a string or a more complex structure
   */
  description?: ReadMoreTextType;
  /**
   * Links to social media or other external resources.
   */
  links?: LinksType;
  /**
   * Optional call-to-action buttons or components to display alongside the details.
   */
  ctas?: ReactNode;
} & ComponentProps<"div">;

/**
 * ##GenericDetails Component
 *
 * A flexible component for displaying generic details with an optional profile image and title.
 * This component is primarily used for community, brand/profile, and group details pages,
 * but can be adapted for any generic details view.
 *
 * @returns A JSX element containing the generic details layout
 */
export function GenericDetails({
  variant = "default",
  profileImageDetails,
  title,
  url,
  metadata,
  description,
  links,
  ctas,
  className,
  children,
  ...restProps
}: GenericDetailsProps) {
  return (
    <div
      className={cn(
        "",
        variant === "list" &&
          "gencl:gap-4 gencl:border-secondary-150 gencl:border gencl:rounded-xl",
        className
      )}
      {...restProps}
    >
      <div
        className={cn(
          "gencl:flex gencl:gap-6 gencl:w-full gencl:items-center",
          variant === "list" && "gencl:p-4"
        )}
      >
        {profileImageDetails && (
          <Avatar
            alt={profileImageDetails.alt}
            imageUrl={profileImageDetails.imageUrl}
            isAvatar={profileImageDetails.isAvatar}
            size={variant === "list" ? "2xl" : "3xl"}
          />
        )}
        <div className="gencl:flex gencl:w-full gencl:gap-4 gencl:justify-between">
          <div className="gencl:space-y-4">
            <div className="gencl:space-y-2">
              {title && (
                <Link href={url}>
                  <p
                    className={cn(
                      "gencl:line-clamp-2",
                      variant === "default"
                        ? "gencl:text-headline-2-semi-bold"
                        : "gencl:text-headline-3-semi-bold"
                    )}
                  >
                    {title}
                  </p>
                </Link>
              )}
              {metadata && metadata}
              {description && (
                <ReadMore
                  className="gencl:text-secondary-600! gencl:text-body-1-medium"
                  text={description}
                  maxLines={2}
                />
              )}
              {links && <SocialLinks links={links} />}
            </div>
            {ctas && variant === "default" && ctas}
          </div>
          {ctas && variant === "list" && ctas}
        </div>
      </div>
      {children}
    </div>
  );
}

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
          {Array.from({ length: 5 }).map((_, idx, arr) => (
            <div key={idx}>
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
          <Skeleton className="gencl:w-35 gencl:h-9 gencl:rounded-md" />
          <Skeleton className="gencl:w-25 gencl:h-9 gencl:rounded-md" />
        </div>
      </div>
    </div>
  );
}
