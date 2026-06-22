import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the pauseVariant function using cva to handle different styles based on props
const pauseVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:fill-black", // Light variant style
      dark: "gencl:fill-white", // Dark variant style
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light", // Default to dark theme
    size: "md", // Default size
  },
});

type PauseIconPropsType = ComponentProps<"svg"> & VariantProps<typeof pauseVariant>;

export function PauseIcon({ theme, size, className, ...restProps }: PauseIconPropsType) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
      className={cn(pauseVariant({ theme, size }), className)}>
      <path d="M6.85714 4H9.14286C9.14286 4 10 4 10 5.09091V18.9091C10 18.9091 10 20 9.14286 20H6.85714C6.85714 20 6 20 6 18.9091V5.09091C6 5.09091 6 4 6.85714 4Z" />
      <path d="M14.8571 4H17.1429C17.1429 4 18 4 18 5.09091V18.9091C18 18.9091 18 20 17.1429 20H14.8571C14.8571 20 14 20 14 18.9091V5.09091C14 5.09091 14 4 14.8571 4Z" />
    </svg>
  );
}
