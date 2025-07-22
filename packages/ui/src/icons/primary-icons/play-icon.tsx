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
type PlayIconPropsType = ComponentProps<"svg"> &
  VariantProps<typeof playVariant>;

export function PlayIcon({
  theme = "light",
  fill,
  stroke,
  size,
  className,
  ...restProps
}: PlayIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(playVariant({ theme, size }), className)}
      {...restProps}
    >
      <path
        d="M20.3219 10.6786L8.25449 3.20581C8.02671 3.07138 7.76839 3.00041 7.50535 3C7.24232 2.99959 6.98379 3.06976 6.75561 3.20348C6.52742 3.3372 6.33756 3.5298 6.20502 3.76202C6.07248 3.99424 6.00189 4.25795 6.0003 4.5268V19.4571C5.99792 19.729 6.06623 19.9967 6.19825 20.2329C6.33026 20.469 6.52126 20.6651 6.7517 20.8011C6.98157 20.9315 7.24017 21 7.5031 21C7.76603 21 8.02462 20.9315 8.25449 20.8011L20.2768 13.3283C20.4977 13.1914 20.6803 12.9986 20.807 12.7685C20.9337 12.5385 21.0002 12.279 21.0002 12.015C21.0002 11.751 20.9337 11.4914 20.807 11.2614C20.6803 11.0313 20.4977 10.8386 20.2768 10.7017L20.3219 10.6786Z"
        strokeWidth={1.5}
      />
    </svg>
  );
}
