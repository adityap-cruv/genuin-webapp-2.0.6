import { cn } from "@genuin/ui/lib/utils";
import { type GenericDetailsProps } from "./generic-details.type";
import { genericDetailsVariants } from "./generic-details.cva";
import { Avatar } from "@genuin/ui/components/avatar";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { Stats } from "@genuin/components/molecules/stats";

/**
 * Mobile view for the GenericDetails component.
 * @returns
 */
export function GenericDetailsMobile({
  handle,
  title,
  metadata,
  profileImageDetails,
  ctas,
  stats,
  className,
  variant,
  ...restProps
}: GenericDetailsProps) {
  if (variant === "profile") {
    return (
      <div
        className={cn(genericDetailsVariants({ variant }), className)}
        {...restProps}
      >
        <div className="gencl:flex gencl:gap-4 gencl:items-center">
          <Avatar
            imageUrl={profileImageDetails?.imageUrl ?? ""}
            alt={profileImageDetails?.alt ?? ""}
            isAvatar={profileImageDetails?.isAvatar ?? false}
            size="2xl"
            shouldZoom
          />
          <div>
            {title && (
              <p className="gencl:text-headline-4-semi-bold">{title}</p>
            )}
            {handle && (
              <ProfileLink
                userLogoType={handle.brandUserLogo}
                className="gencl:text-body-1-medium gencl:text-secondary-600"
              >
                @{handle.userName}
              </ProfileLink>
            )}
          </div>
        </div>
        {stats && (
          <Stats
            className="gencl:flex gencl:gap-2 gencl:text-body-1-medium! gencl:text-secondary-600"
            valueClassName="gencl:text-secondary-900!"
            separator="•"
            pairClassName="gencl:gap-1"
            stats={stats}
            valueFirst
          />
        )}
        {ctas && ctas}
      </div>
    );
  }
  return (
    <div
      className={cn(genericDetailsVariants({ variant }), className)}
      {...restProps}
    >
      {title && <p className="gencl:text-headline-4-semi-bold">{title}</p>}
      {metadata && metadata}
      {ctas && ctas}
    </div>
  );
}
