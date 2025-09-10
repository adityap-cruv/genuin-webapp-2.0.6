import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

export function SortIcon({ className, ...restProps }: SVGIconsProps) {
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
        d="M8 13.9999L4.5 10.4999L5.205 9.79492L8 12.5849L10.795 9.79492L11.5 10.4999L8 13.9999Z"
        fill="#3B3E40"
      />
      <path
        d="M8 2L11.5 5.5L10.795 6.205L8 3.415L5.205 6.205L4.5 5.5L8 2Z"
        fill="#3B3E40"
      />
    </svg>
  );
}
