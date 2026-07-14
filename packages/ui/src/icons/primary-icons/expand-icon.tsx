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

// Define the Props type for the ExpandIcon component
type ExpandIconPropsType = ComponentProps<"svg"> & VariantProps<typeof iconVariant>;

export function ExpandIcon({ theme, size, className, ...restProps }: ExpandIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(iconVariant({ theme, size }), className)}
      {...restProps}>
      <path
        d="M3.99854 9V5.25C3.99854 4.55965 4.55819 4 5.24854 4H8.99854"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M14.9985 4H18.7485C19.4389 4 19.9985 4.55965 19.9985 5.25V9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M19.9985 15V18.75C19.9985 19.4404 19.4389 20 18.7485 20H14.9985"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M8.99854 20H5.24854C4.55819 20 3.99854 19.4404 3.99854 18.75V15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
