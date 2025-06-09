import { Avatar } from "@genuin/ui/avatar";
import { cn } from "@genuin/ui/utils";
import { Skeleton } from "@genuin/ui/skeleton";

import { BrandBadge } from "../brand-badge";
import { Link } from "../link";

import type { TagProps } from "./tag.types";

/**
 * This tag is mostly used to display a brand or community in a compact form.
 * @param param0
 * @returns
 */
export function Tag({
  profileImage,
  alt,
  userName,
  url,
  userLogoType,
  title,
  className,
  ...restProps
}: TagProps) {
  const hasProfileImage = profileImage;
  return (
    <Link href={url}>
      <div
        className={cn(
          "gencl:p-0.5 gencl:pr-2 gencl:flex gencl:bg-secondary-100 gencl:rounded-full gencl:items-center gencl:gap-1",
          !hasProfileImage && "gencl:pl-2",
          className
        )}
        title={title ?? userName}
        {...restProps}
      >
        {hasProfileImage && (
          <Avatar
            isAvatar={profileImage.isAvatar ?? false}
            size="sm"
            alt={alt}
            imageUrl={profileImage.url}
          />
        )}
        <p
          title={userName}
          className="gencl:text-body-1-semi-bold gencl:line-clamp-1 gencl:break-all"
        >
          {/* No userName will be bigger than 24 characters */}
          {userName.length > 24 ? `${userName.slice(0, 21)}...` : userName}
        </p>
        {userLogoType && (
          <BrandBadge userLogoType={userLogoType} variant="dark" />
        )}
      </div>
    </Link>
  );
}

export function TagSkeleton() {
  return <Skeleton className="gencl:w-full gencl:h-9 gencl:rounded-full" />;
}
