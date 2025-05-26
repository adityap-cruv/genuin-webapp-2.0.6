import { cn } from "src/lib/utils";

import type { SVGIconsProps } from "../type";

export function XIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(className)}
      {...restProps}
    >
      <path
        d="M13 4.00714L11.9929 3L8 6.99286L4.00714 3L3 4.00714L6.99286 8L3 11.9929L4.00714 13L8 9.00714L11.9929 13L13 11.9929L9.00714 8L13 4.00714Z"
        fill="#1D1F20"
      />
    </svg>
  );
}
