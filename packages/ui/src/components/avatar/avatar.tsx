"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

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
        "3xl": "gencl:size-22 gencl:text-h2-bold",
        "4xl": "gencl:size-40 gencl:text-h2-bold",
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
    /**
     * When true, enables zoom functionality on click
     */
    shouldZoom?: boolean;
  };

function Avatar({
  className,
  imageUrl,
  alt,
  isAvatar,
  size = "sm",
  shouldZoom = false,
  ...props
}: AvatarPropsType) {
  const [isOpen, setIsOpen] = useState(false);
  const finalImageSrc = isAvatar ? getAvatarUrl(imageUrl) : imageUrl;
  // Generate a unique ID for this Avatar instance
  const uniqueId = React.useId();
  const layoutId = `avatar-zoom-${uniqueId}`;

  // Function to create avatar component with dynamic size
  const createAvatarComponent = (avatarSize = size) => (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        avatarVariants({ size: avatarSize }),
        isAvatar && "gencl:bg-secondary-300",
        shouldZoom && "gencl:cursor-pointer",
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

  // Create standard avatar component
  const AvatarComponent = createAvatarComponent();

  if (!shouldZoom) {
    return AvatarComponent;
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <motion.div
          layoutId={layoutId}
          transition={{
            type: "spring",
            bounce: 0.15,
            duration: 0.5,
          }}
        >
          {AvatarComponent}
        </motion.div>
      </div>

      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            onClick={() => setIsOpen(false)}
            className="gencl:fixed gencl:inset-0 gencl:z-50 gencl:bg-white/1 gencl:backdrop-blur-lg gencl:flex gencl:items-center gencl:justify-center"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1], // spring-like easing
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1], // ease-out for exits
              },
            }}
          >
            <motion.div
              layoutId={layoutId}
              transition={{
                type: "spring",
                bounce: 0.15,
                duration: 0.5,
              }}
            >
              {createAvatarComponent("4xl")}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
