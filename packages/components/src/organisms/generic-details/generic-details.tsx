import { Avatar } from "@genuin/ui/avatar";
import { Loader } from "@genuin/ui/loader";
import { ReadMore, type ReadMoreTextType } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps, ReactNode } from "react";

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
          "gencl:gap-4 gencl:border-secondary-200 gencl:border gencl:rounded-xl",
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
          <div className="gencl:flex gencl:flex-col gencl:gap-2">
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
// TODO: DEVELOP THIS SKELETON.
export function GenericDetailsSkeleton() {
  return (
    <div className="">
      <Loader />
    </div>
  );
}
