import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";
import type { SVGIconsProps } from "../type";

const shareIconVariants = cva("gencl:stroke-black", {
  variants: {
    variant: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

type ShareIconProps = SVGIconsProps & VariantProps<typeof shareIconVariants>;

export function ShareIcon({
  className,
  variant,
  ...restProps
}: ShareIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(shareIconVariants({ variant }), className)}
      {...restProps}
    >
      <path
        d="M13.17 19.2565L21.75 11.5039L13.17 3.75122V8.97396H10.9167C6.15 8.97396 2.25 12.7784 2.25 17.185L2.25 19.0116C2.25 19.2564 2.51 19.5012 2.77 19.5012H2.85667C3.03 19.5012 3.20333 19.338 3.29 19.1748C4.2 16.9302 5.175 14.1968 10.9167 14.1968H13.17V19.2565Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
