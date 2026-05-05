import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const plusIconVariants = cva("gencl:stroke-black", {
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

type PlusIconProps = SVGIconsProps & VariantProps<typeof plusIconVariants>;

export function PlusIcon({ className, variant, ...restProps }: PlusIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(plusIconVariants({ variant }), className)}
      {...restProps}>
      <line x1="12" y1="5" x2="12" y2="19" stroke="#1D1F20" strokeWidth="1.5" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="#1D1F20" strokeWidth="1.5" />
    </svg>
  );
}
