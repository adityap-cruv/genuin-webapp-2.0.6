import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const iconVariants = cva("", {
  variants: {
    theme: {
      secondary: "gencl:fill-secondary-600",
      light: "gencl:fill-black",
      dark: "gencl:fill-white",
      muted: "gencl:fill-secondary-400",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

export function ArrowLeftIcon({ className, theme, ...restProps }: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={cn(iconVariants({ theme }), className)}
      {...restProps}>
      <path d="M9.9974 16.6641L11.1724 15.4891L6.5224 10.8307H16.6641V9.16406H6.5224L11.1724 4.50573L9.9974 3.33073L3.33073 9.9974L9.9974 16.6641Z" />
    </svg>
  );
}
