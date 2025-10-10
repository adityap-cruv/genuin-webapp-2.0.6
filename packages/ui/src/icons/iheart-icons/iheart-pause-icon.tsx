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

export function IHeartPauseIcon({
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
      <path d="M8.5 18C9.44286 18 10.2143 17.2286 10.2143 16.2857V7.71429C10.2143 6.77143 9.44286 6 8.5 6C7.55714 6 6.78571 6.77143 6.78571 7.71429V16.2857C6.78571 17.2286 7.55714 18 8.5 18ZM13.6429 7.71429V16.2857C13.6429 17.2286 14.4143 18 15.3571 18C16.3 18 17.0714 17.2286 17.0714 16.2857V7.71429C17.0714 6.77143 16.3 6 15.3571 6C14.4143 6 13.6429 6.77143 13.6429 7.71429Z" />
    </svg>
  );
}
