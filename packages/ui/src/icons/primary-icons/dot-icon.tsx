import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import { cva, type VariantProps } from "class-variance-authority";

const iconVariants = cva("gencl:w-1 gencl:h-1", {
  variants: {
    variant: {
      default: "gencl:fill-secondary-600",
      active: "gencl:fill-black",
      muted: "gencl:fill-secondary-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function DotIcon({
  className,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="3"
      height="4"
      viewBox="0 0 3 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, iconVariants({ variant }))}
      {...restProps}
    >
      <rect y="0.5" width="3" height="3" rx="1.5" />
    </svg>
  );
}
