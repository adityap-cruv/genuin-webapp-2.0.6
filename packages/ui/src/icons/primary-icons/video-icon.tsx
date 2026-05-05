import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "gencl:stroke-black",
      active: "gencl:fill-black gencl:stroke-black",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function VideoIcon({ className, variant, ...restProps }: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className, iconVariants({ variant }))}
      {...restProps}>
      <path
        d="M14.5633 1H5.43538C4.59519 1 3.91406 1.73263 3.91406 2.63636V17.3636C3.91406 18.2674 4.59519 19 5.43538 19H14.5633C15.4035 19 16.0846 18.2674 16.0846 17.3636V2.63636C16.0846 1.73263 15.4035 1 14.5633 1Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6492 1H5.52132C4.68112 1 4 1.73263 4 2.63636V17.3636C4 18.2674 4.68112 19 5.52132 19H14.6492C15.4894 19 16.1705 18.2674 16.1705 17.3636V2.63636C16.1705 1.73263 15.4894 1 14.6492 1Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.75 12.4906V7.4803C7.75 7.1075 8.12866 6.88383 8.425 7.06277L12.4585 9.56792C12.5301 9.61654 12.5882 9.67957 12.6282 9.75204C12.6682 9.82451 12.689 9.90442 12.689 9.98545C12.689 10.0665 12.6682 10.1464 12.6282 10.2188C12.5882 10.2913 12.5301 10.3544 12.4585 10.403L8.425 12.9678C8.12866 13.0871 7.75 12.8634 7.75 12.4906Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn({
          "gencl:fill-white gencl:stroke-white": variant === "active",
        })}
      />
      <path d="M1 3.86328V16.9542" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 3.86328V16.9542" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
