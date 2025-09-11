import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

// Define the playVariant function using cva to handle different styles based on props
const barGraphVariant = cva("", {
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
type BarGraphIconPropsType = ComponentProps<"svg"> &
  VariantProps<typeof barGraphVariant>;

export function BarGraphIcon({
  theme = "light",
  size,
  className,
  ...restProps
}: BarGraphIconPropsType) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(barGraphVariant({ theme, size }), className)}
      {...restProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 13C3.22386 13 3 13.2239 3 13.5L3 19.5C3 19.7761 3.22386 20 3.5 20H6.5C6.77614 20 7 19.7761 7 19.5V13.5C7 13.2239 6.77614 13 6.5 13H3.5Z"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5 4C10.2239 4 10 4.22386 10 4.5L10 19.5C10 19.7761 10.2239 20 10.5 20H13.5C13.7761 20 14 19.7761 14 19.5V4.5C14 4.22386 13.7761 4 13.5 4H10.5Z"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 8C17.2239 8 17 8.22386 17 8.5V19.5C17 19.7761 17.2239 20 17.5 20H20.5C20.7761 20 21 19.7761 21 19.5V8.5C21 8.22386 20.7761 8 20.5 8H17.5Z"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
