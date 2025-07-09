import { cn } from "@genuin/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

import type { SVGIconsProps } from "../type";

const xIconVariants = cva("gencl:w-4 gencl:h-4 gencl:text-secondary-600", {
  variants: {
    size: {
      sm: "gencl:w-3 gencl:h-3",
      md: "gencl:w-4 gencl:h-4",
      lg: "gencl:w-5 gencl:h-5",
      xl: "gencl:w-6 gencl:h-6",
    },
    variant: {
      default: "gencl:text-secondary-600",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

type XIconProps = SVGIconsProps & VariantProps<typeof xIconVariants>;

export function XIcon({ className, size, variant, ...restProps }: XIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(xIconVariants({ size, variant }), className)}
      {...restProps}
    >
      <path
        d="M13 4.00714L11.9929 3L8 6.99286L4.00714 3L3 4.00714L6.99286 8L3 11.9929L4.00714 13L8 9.00714L11.9929 13L13 11.9929L9.00714 8L13 4.00714Z"
        fill="currentColor"
      />
    </svg>
  );
}
