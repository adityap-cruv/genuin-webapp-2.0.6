import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

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

export function IHeartPlusIcon({
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
      {...restProps}
    >
      <path d="M11 13H5C4.71667 13 4.47933 12.904 4.288 12.712C4.096 12.5207 4 12.2833 4 12C4 11.7167 4.096 11.4793 4.288 11.288C4.47933 11.096 4.71667 11 5 11H11V5C11 4.71667 11.096 4.47933 11.288 4.288C11.4793 4.096 11.7167 4 12 4C12.2833 4 12.5207 4.096 12.712 4.288C12.904 4.47933 13 4.71667 13 5V11H19C19.2833 11 19.5207 11.096 19.712 11.288C19.904 11.4793 20 11.7167 20 12C20 12.2833 19.904 12.5207 19.712 12.712C19.5207 12.904 19.2833 13 19 13H13V19C13 19.2833 12.904 19.5207 12.712 19.712C12.5207 19.904 12.2833 20 12 20C11.7167 20 11.4793 19.904 11.288 19.712C11.096 19.5207 11 19.2833 11 19V13Z" />
    </svg>
  );
}
