import { Avatar } from "@genuin/ui/avatar";
import { cn } from "@genuin/ui/utils";
import { Skeleton } from "@genuin/ui/skeleton";
import { cva } from "class-variance-authority";

import { BrandBadge } from "../brand-badge";
import { Link } from "../link";

import type { TagProps } from "./tag.types";

const tagVariants = cva(
  "gencl:flex gencl:bg-secondary-50 gencl:rounded-full gencl:items-center gencl:gap-1",
  {
    variants: {
      size: {
        sm: "gencl:p-0.5 gencl:pr-1.5",
        md: "gencl:p-0.5 gencl:pr-2",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const tagTextVariants = cva("gencl:line-clamp-1 gencl:break-all", {
  variants: {
    size: {
      sm: "gencl:text-body-2-medium",
      md: "gencl:text-body-1-semi-bold",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const tagSkeletonVariants = cva("gencl:w-full gencl:rounded-full", {
  variants: {
    size: {
      sm: "gencl:h-6",
      md: "gencl:h-9",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

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
  size = "md",
  className,
  ...restProps
}: TagProps) {
  const hasProfileImage = profileImage;
  const avatarSize = size === "sm" ? "xs" : "sm";
  const maxLength = size === "sm" ? 16 : 24;
  const truncateLength = size === "sm" ? 13 : 21;

  return (
    <Link href={url}>
      <div
        className={cn(
          tagVariants({ size }),
          !hasProfileImage && (size === "sm" ? "gencl:pl-1.5" : "gencl:pl-2"),
          className
        )}
        title={title ?? userName}
        {...restProps}
      >
        {hasProfileImage && (
          <Avatar
            isAvatar={profileImage.isAvatar ?? false}
            size={avatarSize}
            alt={alt}
            imageUrl={profileImage.url}
          />
        )}
        <p title={userName} className={tagTextVariants({ size })}>
          {/* Truncate username based on size */}
          {userName.length > maxLength
            ? `${userName.slice(0, truncateLength)}...`
            : userName}
        </p>
        {userLogoType && (
          <BrandBadge userLogoType={userLogoType} variant="dark" />
        )}
      </div>
    </Link>
  );
}

export function TagSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  return <Skeleton className={tagSkeletonVariants({ size })} />;
}
