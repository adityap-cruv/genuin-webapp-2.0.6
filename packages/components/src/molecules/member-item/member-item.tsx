import { Avatar } from "@genuin/ui/avatar";
import { Chip } from "@genuin/ui/chip";
import { cn } from "@genuin/ui/utils";
import { Skeleton } from "@genuin/ui/skeleton";

import { Link } from "@genuin/components/molecules/link";

import { ProfileLink } from "../profile-link";

import type { MemberItemProps } from "./member-item.types";

export function MemberItem({
  memberData: { isOwner, name, url, profileImage, bio, userName, brand },
  className,
  ...restProps
}: MemberItemProps) {
  return (
    <Link href={url}>
      <div
        className={cn(
          "gencl:flex gencl:gap-2 gencl:overflow-hidden",
          className
        )}
        {...restProps}
      >
        {/* {profileImage.url && ( */}
          <Avatar
            isAvatar={profileImage.isAvatar}
            imageUrl={profileImage.url}
            alt={name}
            size="md"
          />
    {/* }} */}
        <div>
          <div className="gencl:flex gencl:items-center gencl:gap-1">
            <ProfileLink
              className="gencl:text-body-1-medium gencl:text-secondary-600"
              userLogoType={brand?.userLogoType}
            >
              @{userName}
            </ProfileLink>
            {isOwner && (
              <Chip variant="default" rounded="full">
                Owner
              </Chip>
            )}
          </div>
          {name && <p className="gencl:text-body-1-semi-bold">{name}</p>}
          {bio && (
            <p className="gencl:text-body-1-semi-bold gencl:text-secondary-600 gencl:line-clamp-1">
              {bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function MemberItemSkeleton() {
  return (
    <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden">
      <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
      <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
      </div>
    </div>
  );
}
