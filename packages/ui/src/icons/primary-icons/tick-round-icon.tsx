import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

// Define the class variance authority (cva) for the TickIcon component
const tickIconClasses = cva("", {
  variants: {
    variant: {
      light: "gencl:fill-white", // Light variant class
      primary: "gencl:fill-success-status", // Primary variant class
      dark: "gencl:fill-primary", // Map 'dark' to 'primary' variant class
    },
  },
  defaultVariants: {
    variant: "primary", // Default variant is 'primary'
  },
});

export function TickRoundIcon({
  className,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof tickIconClasses>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={cn("gencl:fill-primary", tickIconClasses({ variant }), className)}
      {...restProps}>
      <rect width="16" height="16" rx="8" fill="white" />
      <path d="M7.99911 1.97056e-07C6.4169 0.000175764 4.87027 0.469517 3.5548 1.34867C2.23932 2.22783 1.21408 3.47732 0.608713 4.93915C0.00334783 6.40097 -0.154952 8.00948 0.15383 9.56126C0.462611 11.1131 1.22461 12.5384 2.34346 13.6572C3.46232 14.7759 4.88778 15.5377 6.43961 15.8463C7.99143 16.155 9.59992 15.9965 11.0617 15.3909C12.5234 14.7854 13.7728 13.76 14.6518 12.4445C15.5308 11.1289 16 9.58221 16 8C16.0001 6.94932 15.7932 5.9089 15.3912 4.93819C14.9891 3.96747 14.3998 3.08547 13.6568 2.34257C12.9138 1.59967 12.0318 1.01042 11.061 0.608471C10.0902 0.206527 9.0498 -0.000233009 7.99911 1.97056e-07ZM12.0941 5.79228L6.95162 10.9578C6.83439 11.08 6.67654 11.1552 6.50777 11.1691C6.33515 11.1565 6.174 11.078 6.0577 10.9498L3.8988 8.79272C3.88423 8.77842 3.87265 8.76136 3.86475 8.74254C3.85685 8.72371 3.85277 8.7035 3.85277 8.68309C3.85277 8.66267 3.85685 8.64246 3.86475 8.62364C3.87265 8.60481 3.88423 8.58775 3.8988 8.57346L4.58322 7.88904C4.59715 7.87445 4.61389 7.86285 4.63243 7.85492C4.65096 7.84699 4.67092 7.8429 4.69108 7.8429C4.71124 7.8429 4.7312 7.84699 4.74974 7.85492C4.76827 7.86285 4.78501 7.87445 4.79894 7.88904L6.50688 9.59698L11.1993 4.86906C11.2133 4.85465 11.2299 4.84315 11.2484 4.83523C11.2668 4.8273 11.2866 4.82311 11.3067 4.8229C11.3269 4.82236 11.3469 4.8262 11.3655 4.83417C11.384 4.84214 11.4006 4.85405 11.4141 4.86906L12.087 5.56502C12.1035 5.57876 12.117 5.59585 12.1264 5.61516C12.1358 5.63447 12.1411 5.65557 12.1417 5.67705C12.1424 5.69853 12.1385 5.71991 12.1303 5.73978C12.1221 5.75964 12.1097 5.77754 12.0941 5.79228Z" />
    </svg>
  );
}
