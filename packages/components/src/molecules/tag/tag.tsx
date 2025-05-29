import { Avatar } from "@genuin/ui/avatar";
import { TickIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";

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
  isVerified = false,
  className,
  ...restProps
}: TagProps) {
  const hasProfileImage = profileImage && profileImage.url;
  return (
    <Link href={url}>
      <div
        className={cn(
          "gencl:p-0.5 gencl:pr-2 gencl:flex gencl:bg-secondary-100 gencl:rounded-full gencl:items-center gencl:gap-1",
          !hasProfileImage && "gencl:pl-2",
          className
        )}
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
        <p className="gencl:text-body-1-semi-bold">{userName}</p>
        {isVerified && <TickIcon className="gencl:size-3" />}
      </div>
    </Link>
  );
}
