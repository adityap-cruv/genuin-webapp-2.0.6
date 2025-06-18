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

export function HomeIcon({
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
        d="M5.53613 9.69189V20.3073H10.1515V15.449C10.1515 15.0929 10.2772 14.7534 10.4976 14.5016C10.7179 14.2498 11.0148 14.1064 11.3263 14.1064H12.669C12.9806 14.1064 13.2794 14.2478 13.4997 14.4996C13.72 14.7514 13.8438 15.0929 13.8438 15.449V20.3073H18.4592V9.69189"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.76758 11.9996L11.1278 4.03556C11.2421 3.92661 11.3778 3.84018 11.5272 3.78121C11.6765 3.72225 11.8367 3.69189 11.9983 3.69189C12.16 3.69189 12.3201 3.72225 12.4695 3.78121C12.6189 3.84018 12.7546 3.92661 12.8689 4.03556L21.2291 11.9996"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
