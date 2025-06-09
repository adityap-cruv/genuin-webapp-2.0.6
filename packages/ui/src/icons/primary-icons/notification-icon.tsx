import React from "react";

import { cn } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";
export function NotificationIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      className={cn("", className)}
      {...restProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.12817 1C12.4838 1 15.2042 3.72029 15.2042 7.07596C15.2042 8.96385 15.2042 10.8496 15.2042 12C15.2042 15 17.2295 16 17.2295 16L1.02685 16C1.02685 16 3.05218 15 3.05218 12C3.05218 10.8496 3.05218 8.96385 3.05218 7.07596C3.05218 3.72029 5.77249 1 9.12817 1V1Z"
        stroke="#1D1F20"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.10559 15.5C7.10559 16.6046 8.01236 17.5 9.13092 17.5C10.2495 17.5 11.1562 16.6046 11.1562 15.5"
        fill="#1D1F20"
      />
      <path
        d="M7.10559 15.5C7.10559 16.6046 8.01236 17.5 9.13092 17.5C10.2495 17.5 11.1562 16.6046 11.1562 15.5"
        stroke="#1D1F20"
        strokeWidth="1.5"
      />
    </svg>
  );
}
