import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the playVariant function using cva to handle different styles based on props
const boostVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
      secondary: "gencl:stroke-secondary-600",
      "fill-dark": "gencl:fill-white",
      "fill-light": "gencl:fill-black",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

// Define the Props type for the PlayIcon component
// theme: controls the overall theme (light/dark)
// fill: controls the fill color (light/dark)
// stroke: controls the stroke color (light/dark)
type BoostIconPropsType = ComponentProps<"svg"> & VariantProps<typeof boostVariant>;

export function BoostIcon({ theme = "light", size, className, ...restProps }: BoostIconPropsType) {
  return (
    <svg
      width="17"
      height="20"
      viewBox="0 0 17 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(boostVariant({ theme, size }), className)}
      {...restProps}>
      <path
        d="M10 1V7.92308H16.2308L7.23077 19V12.0769H1L10 1Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
