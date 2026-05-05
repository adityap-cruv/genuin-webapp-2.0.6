import type { ComponentProps } from "react";

import { cn } from "@genuin/ui/lib/utils";

export function ChevronFirstIcon({ className, ...restProps }: ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      {...restProps}>
      <path d="M11.3333 4.66699L8 8.00033L11.3333 11.3337" stroke="#1D1F20" />
      <path d="M4.66699 4H5.66699V12H4.66699V4Z" fill="#1D1F20" />
    </svg>
  );
}
