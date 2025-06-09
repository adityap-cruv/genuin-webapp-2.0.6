import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";

const repostIconVariants = cva("gencl:stroke-black", {
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

type RepostIconProps = SVGIconsProps & VariantProps<typeof repostIconVariants>;

export function RepostIcon({
  className,
  variant,
  ...restProps
}: RepostIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
      className={cn(repostIconVariants({ variant }), className)}
      {...restProps}
    >
      <path
        d="M24.8333 8.94187C23.3665 7.30746 21.4365 6.15555 19.2986 5.63857C17.1608 5.12158 14.9159 5.26388 12.861 6.04663C10.8061 6.82937 9.03793 8.21569 7.79048 10.0222C6.54304 11.8286 5.87508 13.9701 5.875 16.1633V17.0695"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5835 23.3895C10.0503 25.0248 11.9802 26.1772 14.1179 26.6944C16.2556 27.2118 18.5003 27.0695 20.5553 26.2865C22.6102 25.5035 24.3783 24.1167 25.6258 22.3094C26.8734 20.5022 27.5415 18.3598 27.5418 16.1656V15.2638"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.8335 17.9721L27.5418 15.2638L30.2502 17.9721"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.58317 15.2638L5.87484 17.9721L3.1665 15.2638"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.7085 12.5555V19.7778"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0977 16.1666H20.3199"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
