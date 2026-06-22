import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the playVariant function using cva to handle different styles based on props
const playVariant = cva("", {
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
type PlayIconPropsType = ComponentProps<"svg"> & VariantProps<typeof playVariant>;

export function PlayIcon({ theme = "light", size, className, strokeWidth = 1.5, ...restProps }: PlayIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(playVariant({ theme, size }), className)}
      {...restProps}>
      <path
        d="M20.3217 10.6786L8.25425 3.20581C8.02646 3.07138 7.76814 3.00041 7.50511 3C7.24208 2.99959 6.98355 3.06976 6.75536 3.20348C6.52717 3.3372 6.33732 3.5298 6.20478 3.76202C6.07223 3.99424 6.00164 4.25795 6.00006 4.5268V19.4571C5.99768 19.729 6.06599 19.9967 6.198 20.2329C6.33002 20.469 6.52101 20.6651 6.75146 20.8011C6.98133 20.9315 7.23992 21 7.50285 21C7.76578 21 8.02438 20.9315 8.25425 20.8011L20.2766 13.3283C20.4974 13.1914 20.68 12.9986 20.8067 12.7685C20.9334 12.5385 21 12.279 21 12.015C21 11.751 20.9334 11.4914 20.8067 11.2614C20.68 11.0313 20.4974 10.8386 20.2766 10.7017L20.3217 10.6786Z"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
