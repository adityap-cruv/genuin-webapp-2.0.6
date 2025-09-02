import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { SVGIconsProps } from "../type";
import { cn } from "@genuin/ui/lib/utils";

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "gencl:stroke-secondary-600",
      active: "gencl:stroke-black",
      muted: "gencl:stroke-secondary-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function ChevronRightIcon({
  className,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="7"
      height="10"
      viewBox="0 0 7 10"
      fill="none"
      className={cn(className, iconVariants({ variant }))}
      {...restProps}
    >
      <path d="M1.0013 1L5.16797 5.16667L1.0013 9.33333" strokeWidth="1.5" />
    </svg>
  );
}
