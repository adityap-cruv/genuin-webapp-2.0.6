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

export function IHeartPlayIcon({
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
      <path d="M8.07031 6.97202V17.028C8.07031 17.7948 8.91478 18.2607 9.56512 17.8433L17.4662 12.8153C18.068 12.4368 18.068 11.5632 17.4662 11.1749L9.56512 6.15667C8.91478 5.73929 8.07031 6.2052 8.07031 6.97202Z" />
    </svg>
  );
}
