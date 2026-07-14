import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the iconVariant function using cva to handle different styles based on props
const iconVariant = cva("", {
  variants: {
    theme: {
      dark: "gencl:stroke-white", // Dark variant style
      light: "gencl:stroke-black", // Light variant style
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "dark",
    size: "md",
  },
});

// Define the Props type for the CollapseIcon component
type CollapseIconPropsType = ComponentProps<"svg"> & VariantProps<typeof iconVariant>;

export function CollapseIcon({ theme, size, className, ...restProps }: CollapseIconPropsType) {
  return (
    <svg
      className={cn(iconVariant({ theme, size }), className)}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...restProps}>
      <path d="M9 4V9H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d="M9 20V15H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d="M15 4V9H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d="M15 20V15H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
