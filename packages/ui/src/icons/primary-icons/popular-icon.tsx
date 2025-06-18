import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "gencl:stroke-black",
      active:
        "gencl:fill-black gencl:stroke-black gencl:[&>path:nth-child(2)]:stroke-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function PopularIcon({
  className,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, iconVariants({ variant }))}
      {...restProps}
    >
      <path
        d="M2.25 12C2.25 14.5859 3.27723 17.0658 5.10571 18.8943C6.93419 20.7228 9.41414 21.75 12 21.75C14.5859 21.75 17.0658 20.7228 18.8943 18.8943C20.7228 17.0658 21.75 14.5859 21.75 12C21.75 9.41414 20.7228 6.93419 18.8943 5.10571C17.0658 3.27723 14.5859 2.25 12 2.25C9.41414 2.25 6.93419 3.27723 5.10571 5.10571C3.27723 6.93419 2.25 9.41414 2.25 12Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12.8345H7.22727L9.28182 7.90846C9.33354 7.78566 9.42297 7.68084 9.53825 7.60791C9.65353 7.53498 9.7892 7.4974 9.92727 7.50014C10.0653 7.50288 10.1993 7.54582 10.3113 7.62327C10.4233 7.70071 10.5082 7.80899 10.5545 7.93374L13.5473 16.0639C13.5907 16.1819 13.6686 16.2855 13.7717 16.3623C13.8748 16.4392 13.9987 16.486 14.1287 16.4973C14.2587 16.5086 14.3893 16.4839 14.5051 16.4261C14.6209 16.3682 14.7169 16.2797 14.7818 16.1711L16.7727 12.8345H19.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
