import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

import { cva, type VariantProps } from "class-variance-authority";

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

export function LatestIcon({
  className,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className, iconVariants({ variant }))}
      {...restProps}
    >
      <path
        d="M15.6999 13.3339C11.664 14.7357 10.3339 16.2977 9.34996 20.1869C8.36607 16.2985 7.03588 14.7365 3 13.3339C7.03588 11.9321 8.36607 10.37 9.34996 6.47998C10.3339 10.37 11.664 11.9312 15.6999 13.3339Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.702 6.84741C18.4252 7.6351 17.6751 8.5129 17.1201 10.6982C16.565 8.5129 15.8141 7.63593 13.5381 6.84741C15.8141 6.05972 16.5642 5.18192 17.1201 2.99658C17.6751 5.18275 18.4252 6.05889 20.702 6.84741Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.0023 18.2107C19.3178 18.7814 18.7619 19.4173 18.3517 21.001C17.9406 19.4173 17.3848 18.7814 15.7002 18.2107C17.3848 17.64 17.9406 17.0041 18.3517 15.4204C18.7619 17.0041 19.3178 17.64 21.0023 18.2107Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
