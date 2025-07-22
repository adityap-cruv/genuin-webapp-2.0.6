import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";

const threeDotsIconVariants = cva("", {
  variants: {
    theme: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

type ThreeDotsIconProps = SVGIconsProps &
  VariantProps<typeof threeDotsIconVariants>;

export function ThreeDotsIcon({
  className,
  theme,
  ...restProps
}: ThreeDotsIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(threeDotsIconVariants({ theme }), className)}
      {...restProps}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
