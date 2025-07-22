import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

import type { SVGIconsProps } from "../type";

const iconsVariant = cva("gencl:fill-black", {
  variants: {
    theme: {
      default: "gencl:fill-black",
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

export function XIcon({
  className,
  theme,
  size,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconsVariant>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(iconsVariant({ theme, size }), className)}
      {...restProps}
    >
      <path d="M13 4.00714L11.9929 3L8 6.99286L4.00714 3L3 4.00714L6.99286 8L3 11.9929L4.00714 13L8 9.00714L11.9929 13L13 11.9929L9.00714 8L13 4.00714Z" />
    </svg>
  );
}
