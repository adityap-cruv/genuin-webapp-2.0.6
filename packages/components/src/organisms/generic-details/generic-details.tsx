import { Link } from "@genuin/components/molecules/link";
import { SocialLinks } from "@genuin/components/molecules/social-links";
import { GenericDetailsProps } from "./generic-details.type";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { GenericDetailsMobile } from "./generic-details-mobile";
import { PinIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { Avatar, ReadMore } from "@genuin/ui/components";

/**
 * Props for the GenericDetails component.
 */
export function GenericDetails({ variant, ...restProps }: GenericDetailsProps) {
  const { isMobile } = useDeviceDetectMediaQuery();

  return isMobile &&
    (variant === "default" ||
      variant === "community" ||
      variant === "profile") ? (
    <GenericDetailsMobile variant={variant} {...restProps} />
  ) : (
    <Default variant={variant === "list" ? "list" : "default"} {...restProps} />
  );
}

/**
 * ##GenericDetails Component
 *
 * A flexible component for displaying generic details with an optional profile image and title.
 * This component is primarily used for community, brand/profile, and group details pages,
 * but can be adapted for any generic details view.
 *
 * @returns A JSX element containing the generic details layout
 */
function Default({
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
  showPinned = false,
  ownerInfo,
  ...restProps
}: GenericDetailsProps) {
  const { isMobile } = useDeviceDetectMediaQuery();
  return (
    <div
      className={cn(
        "",
        variant === "list" &&
          "gencl:gap-4 gencl:border-secondary-150 gencl:border gencl:rounded-lg gencl:sm:!rounded-xl",
        className
      )}
      {...restProps}
    >
      {showPinned && (
        <div
          className={
            "gencl:flex gencl:text-body-1-medium gencl:text-secondary-600 gencl:gap-2 gencl:w-full gencl:items-center gencl:px-4 gencl:pt-4"
          }
        >
          <PinIcon /> Pinned by @{ownerInfo?.userName}
        </div>
      )}
      <div
        className={cn(
          "gencl:flex gencl:w-full gencl:items-start",
          variant === "list" && "gencl:p-4",
          variant === "list" && isMobile ? "gencl:gap-2" : "gencl:gap-6"
        )}
      >
        {profileImageDetails && (
          <Avatar
            alt={profileImageDetails.alt}
            imageUrl={profileImageDetails.imageUrl}
            isAvatar={profileImageDetails.isAvatar}
            size={variant === "list" ? "2xl" : "4xl"}
          />
        )}
        <div className="gencl:flex gencl:w-full gencl:gap-4 gencl:justify-between">
          <div className="gencl:space-y-4">
            <div className="gencl:space-y-2">
              {title && (
                <div>
                  <Link href={url}>
                    <p
                      className={cn(
                        "gencl:line-clamp-2 gencl:text-headline-2-semi-bold",
                        {
                          "gencl:text-body-0-semi-bold  gencl:sm:!text-headline-3-semi-bold":
                            variant === "list",
                        }
                      )}
                    >
                      {title}
                    </p>
                  </Link>
                </div>
              )}
              {metadata && metadata}
              {description && (
                <ReadMore
                  className="gencl:text-secondary-600! gencl:text-body-1-medium"
                  text={description}
                  viewLessText=""
                  viewMoreText=""
                  maxLines={1}
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
