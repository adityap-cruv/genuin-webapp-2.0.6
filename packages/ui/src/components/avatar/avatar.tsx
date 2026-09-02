"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Suspense } from "react";

import { cn, isValidHTTPS } from "@genuin/ui/lib/utils";
import { getWebpUrlForImage } from "@genuin/ui/utils";

const AvatarWithZoom = React.lazy(() =>
  import("./avatar-with-zoom").then((m) => ({
    default: m.AvatarWithZoom,
  }))
);

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
        "3xl": "gencl:size-22 gencl:text-h2-bold",
        "4xl": "gencl:size-40 gencl:text-h2-bold",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

export type AvatarPropsType = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants> & {
    isAvatar: boolean;
    /**
     * This will work as a fallback string for the avatar.
     */
    alt: string;
    imageUrl: string;
    imageClassName?: string;
    fallbackClassName?: string;
    /**
     * Overrides the initials derived from `alt`, for callers that need a specific
     * fallback (a single initial, say) without degrading the image's alt text.
     */
    fallback?: string;
    /**
     * When true, enables zoom functionality on click
     */
    shouldZoom?: boolean;
  };

const Avatar = React.memo(function Avatar({
  className,
  imageUrl,
  alt,
  isAvatar,
  size = "sm",
  imageClassName,
  fallbackClassName,
  fallback,
  shouldZoom = false,
  ...props
}: AvatarPropsType) {
  const finalImageSrc = isAvatar ? getAvatarUrl(imageUrl) : getWebpUrlForImage(imageUrl);

  const BasicAvatar = React.memo(function BasicAvatar({ addCursor = false }: { addCursor?: boolean }) {
    return (
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(
          avatarVariants({ size }),
          isAvatar && "gencl:bg-secondary-300",
          addCursor && "gencl:cursor-pointer",
          className
        )}
        {...props}>
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          className={cn("gencl:aspect-square gencl:rounded-full gencl:size-full", imageClassName)}
          src={finalImageSrc}
          alt={alt}
          loading="lazy"
        />
        <AvatarPrimitive.Fallback
          data-slot="avatar-fallback"
          className={cn(
            "gencl:bg-secondary-300 gencl:flex gencl:size-full gencl:items-center gencl:justify-center gencl:rounded-full",
            fallbackClassName
          )}>
          {fallback ?? getAvatarFallback(alt)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  });

  if (shouldZoom) {
    return (
      // eslint-disable-next-line no-restricted-syntax -- packages/ui (atoms) cannot depend on @genuin/components (molecules/SafeSuspense) without a circular dependency; bare Suspense is intentional here.
      <Suspense fallback={<BasicAvatar addCursor={true} />}>
        <AvatarWithZoom
          className={className}
          imageUrl={imageUrl}
          alt={alt}
          isAvatar={isAvatar}
          size={size}
          imageClassName={imageClassName}
          fallbackClassName={fallbackClassName}
          shouldZoom={shouldZoom}
          {...props}
        />
      </Suspense>
    );
  }

  return <BasicAvatar />;
});

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
