"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn, isValidHTTPS } from "@genuin/ui/lib/utils";
import { getWebpUrlForImage } from "@genuin/ui/utils";

const avatarVariants = cva(
  "gencl:relative gencl:flex gencl:w-min gencl:shrink-0 gencl:overflow-hidden gencl:rounded-full",
  {
    variants: {
      size: {
        xs: "gencl:size-6 gencl:text-body-2-medium",
        sm: "gencl:size-8 gencl:text-body-1-semi-bold",
        md: "gencl:size-10 gencl:text-headline-4-medium",
        lg: "gencl:size-12 gencl:text-headline-4-semi-bold",
        xl: "gencl:size-14 gencl:text-headline-3-bold",
        "2xl": "gencl:size-16 gencl:text-headline-3-semi-bold",
        "3xl": "gencl:size-40 gencl:text-h2-bold",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

export type AvatarPropsType = React.ComponentProps<
  typeof AvatarPrimitive.Root
> &
  VariantProps<typeof avatarVariants> & {
    isAvatar: boolean;
    /**
     * This will work as a fallback string for the avatar.
     */
    alt: string;
    imageUrl: string;
  };

function Avatar({
  className,
  imageUrl,
  alt,
  isAvatar,
  size = "sm",
  ...props
}: AvatarPropsType) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        avatarVariants({ size }),
        isAvatar && "gencl:bg-secondary-300",
        className
      )}
      {...props}
    >
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        className="gencl:aspect-square gencl:rounded-full gencl:size-full"
        src={isAvatar ? getAvatarUrl(imageUrl) : getWebpUrlForImage(imageUrl)}
        alt={alt}
        loading="lazy"
      />
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className="gencl:bg-secondary-300 gencl:flex gencl:size-full gencl:items-center gencl:justify-center gencl:rounded-full"
      >
        {getAvatarFallback(alt)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar };

function getAvatarUrl(avatarUrl: string) {
  if (avatarUrl) {
    return isValidHTTPS(avatarUrl)
      ? avatarUrl
      : `https://media.qa.begenuin.com/webapp_assets/assets/avatar/${avatarUrl}.gif`;
  }
}

function getAvatarFallback(str: string | undefined) {
  if (!str) return "U";
  const words = str.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}
