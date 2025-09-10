import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

export function DescIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      {...restProps}
    >
      <path
        d="M8 2.00008L4.5 5.50008L5.205 6.20508L8 3.41508L10.795 6.20508L11.5 5.50008L8 2.00008Z"
        fill="#3B3E40"
      />
      <path
        d="M8 14L11.5 10.5L10.795 9.795L8 12.585L5.205 9.795L4.5 10.5L8 14Z"
        fill="#DFE1E3"
      />
    </svg>
  );
}
