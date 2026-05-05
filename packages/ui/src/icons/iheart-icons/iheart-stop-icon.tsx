import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const iconVariants = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white",
      light: "gencl:fill-black",
      secondary: "gencl:fill-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

export function IHeartStopIcon({
  theme,
  size,
  className,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}>
      <path d="M9 7.5H15C15.8284 7.5 16.5 8.17157 16.5 9V15C16.5 15.8284 15.8284 16.5 15 16.5H9C8.17157 16.5 7.5 15.8284 7.5 15V9C7.5 8.17157 8.17157 7.5 9 7.5Z" />
    </svg>
  );
}
