import { Avatar } from "@genuin/ui/avatar";
import { Chip } from "@genuin/ui/chip";
import { cn } from "@genuin/ui/utils";
import { Skeleton } from "@genuin/ui/skeleton";

import { Link } from "@genuin/components/molecules/link";
import { Stats } from "@genuin/components/molecules/stats";

import { ProfileLink } from "../profile-link";

import type {
  MemberItemProps,
  MemberItemSkeletonProps,
} from "./member-item.types";
import {
  memberItemVariants,
  memberItemUsernameVariants,
  memberItemNameVariants,
  memberItemBioVariants,
  memberItemAvatarVariants,
} from "./member-item.cva";
import { DotIcon } from "@genuin/ui/icons";

export function MemberItem({
  memberData: { name, url, profileImage, bio, userName, brand, stats },
  variant = "default",
  className,
  onClick,
  ...restProps
}: MemberItemProps) {
  // Configuration constants
  const STATS_CONFIG = {
    className:
      "gencl:flex gencl:gap-1 gencl:text-body-1-medium! gencl:text-secondary-600",
    valueFirst: true,
    valueClassName: "gencl:text-black! gencl:mr-1 gencl:text-body-2-medium",
    labelClassName: "gencl:mr-2 gencl:text-body-2-medium",
    pairClassName: "gencl:!gap-0",
    separator: <DotIcon />,
  };

  const ProfileLinkWithUsername = () => (
    <ProfileLink
      className={memberItemUsernameVariants({ variant })}
      userLogoType={brand?.brand_user_logo}
    >
      @{userName}
    </ProfileLink>
  );

  const StatsSection = () => {
    if (variant !== "suggestion" || !stats) return null;
    return (
      <Stats
        {...STATS_CONFIG}
        stats={{
          Communities: stats.communities,
          Groups: stats.groups,
          Posts: stats.posts,
        }}
      />
    );
  };

  const renderProfileLayout = () => (
    <div className="gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:mt-2">
      <ProfileLinkWithUsername />
    </div>
  );

  const renderDefaultLayout = () => (
    <div className="gencl:flex gencl:flex-col gencl:min-w-0 gencl:flex-1 gencl:gap-1">
      <div className="gencl:flex gencl:items-center gencl:gap-1">
        <ProfileLinkWithUsername />
      </div>
      {variant === "default" && name && (
        <p className={memberItemNameVariants({ variant })}>{name}</p>
      )}
      {bio && <p className={memberItemBioVariants({ variant })}>{bio}</p>}
      <StatsSection />
    </div>
  );

  const content = (
    <div
      className={cn(memberItemVariants({ variant }), className)}
      onClick={onClick}
      {...restProps}
    >
      <Avatar
        isAvatar={profileImage.isAvatar}
        imageUrl={profileImage.url}
        alt={name}
        size="md"
        className={memberItemAvatarVariants({ variant })}
      />
      {variant === "profile" ? renderProfileLayout() : renderDefaultLayout()}
    </div>
  );

  if (url) {
    // Default behavior: wrap with Link for navigation
    return (
      <Link href={url} className="gencl:w-full">
        {content}
      </Link>
    );
  }
  return content;
}

export function MemberItemSkeleton({
  variant = "default",
  className,
}: MemberItemSkeletonProps) {
  const renderProfileSkeleton = () => (
    <div
      className={cn(
        "gencl:flex gencl:flex-col gencl:items-center gencl:w-fit gencl:gap-2",
        className
      )}
    >
      <Skeleton className="gencl:size-20 gencl:rounded-full gencl:shrink-0" />
      <div className="gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:mt-2">
        <Skeleton className="gencl:w-20 gencl:h-3 gencl:rounded-md" />
      </div>
    </div>
  );

  const renderDefaultSkeleton = () => (
    <div className={cn(memberItemVariants({ variant }), className)}>
      <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
      <div className="gencl:w-full gencl:flex gencl:flex-col gencl:min-w-0 gencl:flex-1 gencl:gap-1">
        {/* Username skeleton */}
        <div className="gencl:flex gencl:items-center gencl:gap-1">
          <Skeleton className="gencl:w-24 gencl:h-4 gencl:rounded-md" />
        </div>

        {/* Name skeleton - only for default variant */}
        {variant === "default" && (
          <Skeleton className="gencl:w-32 gencl:h-4 gencl:rounded-md" />
        )}

        {/* Bio skeleton */}
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />

        {/* Stats skeleton - only for suggestion variant */}
        {variant === "suggestion" && (
          <div className="gencl:flex gencl:gap-1 gencl:mt-1">
            <Skeleton className="gencl:w-16 gencl:h-3 gencl:rounded-md" />
            <Skeleton className="gencl:w-16 gencl:h-3 gencl:rounded-md" />
            <Skeleton className="gencl:w-16 gencl:h-3 gencl:rounded-md" />
          </div>
        )}
      </div>
    </div>
  );

  return variant === "profile"
    ? renderProfileSkeleton()
    : renderDefaultSkeleton();
}
