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
      {...restProps}>
      <path d="M8.56438 18C9.50724 18 10.2787 17.2286 10.2787 16.2857L10.2787 7.71429C10.2787 6.77143 9.50724 6 8.56438 6C7.62153 6 6.8501 6.77143 6.8501 7.71429L6.8501 16.2857C6.8501 17.2286 7.62153 18 8.56438 18ZM13.7072 7.71429L13.7072 16.2857C13.7072 17.2286 14.4787 18 15.4215 18C16.3644 18 17.1358 17.2286 17.1358 16.2857V7.71429C17.1358 6.77143 16.3644 6 15.4215 6C14.4787 6 13.7072 6.77143 13.7072 7.71429Z" />
    </svg>
  );
}
