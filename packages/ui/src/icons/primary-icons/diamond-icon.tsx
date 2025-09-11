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

export function DiamondIcon({
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
        d="M18.0142 4.71313C17.8981 4.55842 17.7477 4.43284 17.5747 4.34636C17.4017 4.25987 17.211 4.21484 17.0176 4.21484H7.05193C6.85854 4.21484 6.66781 4.25987 6.49483 4.34636C6.32186 4.43284 6.1714 4.55842 6.05536 4.71313L3.28408 8.40956C3.11589 8.63394 3.02834 8.90851 3.03557 9.18883C3.04281 9.46915 3.14441 9.73883 3.32394 9.95424L11.0789 19.3386C11.1958 19.4782 11.3419 19.5905 11.5069 19.6675C11.6719 19.7446 11.8518 19.7845 12.0339 19.7845C12.216 19.7845 12.3959 19.7446 12.5609 19.6675C12.726 19.5905 12.8721 19.4782 12.989 19.3386L20.7439 9.95424C20.9235 9.73883 21.0251 9.46915 21.0323 9.18883C21.0395 8.90851 20.952 8.63394 20.7838 8.40956L18.0142 4.71313Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.48047 4.35352L12.0347 19.7862"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5885 4.35352L12.0352 19.7862"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.03516 9.19727H21.034"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.30078 9.19768L12.0379 4.21484L15.775 9.19768"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
