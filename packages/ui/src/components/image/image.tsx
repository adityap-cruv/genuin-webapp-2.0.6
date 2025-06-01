import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn } from "../../lib/utils";
import { getWebpUrlForImage } from "../../lib/utils";

const imageVariants = cva("gencl:transition-all", {
  variants: {
    aspectRatio: {
      auto: "gencl:aspect-auto",
      square: "gencl:aspect-square",
      video: "gencl:aspect-video",
      portrait: "gencl:aspect-[3/4]",
      landscape: "gencl:aspect-[4/3]",
      banner: "gencl:aspect-[2/5]",
    },
    radius: {
      none: "gencl:rounded-none",
      sm: "gencl:rounded-sm",
      md: "gencl:rounded-md",
      lg: "gencl:rounded-lg",
      full: "gencl:rounded-full",
    },
    scale: {
      0: "gencl:scale-0",
      0.5: "gencl:scale-50",
      0.75: "gencl:scale-75",
      0.9: "gencl:scale-90",
      0.95: "gencl:scale-95",
      1: "gencl:scale-100",
      1.05: "gencl:scale-105",
      1.1: "gencl:scale-110",
      1.25: "gencl:scale-125",
      1.5: "gencl:scale-150",
    },
  },
  defaultVariants: {
    aspectRatio: "auto",
    radius: "none",
    scale: 1,
  },
});

export interface ImageProps
  extends ComponentProps<"img">,
    VariantProps<typeof imageVariants> {
  useWebp?: boolean;
}

export function Image({
  className,
  aspectRatio,
  radius,
  scale,
  src,
  useWebp = true,
  ...props
}: ImageProps) {
  const imageSrc =
    typeof src === "string" && useWebp ? getWebpUrlForImage(src) : src;

  return (
    <img
      className={cn(imageVariants({ aspectRatio, radius, scale }), className)}
      src={imageSrc}
      {...props}
    />
  );
}
