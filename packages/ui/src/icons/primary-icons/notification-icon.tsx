import React from "react";

import { cn } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";
export function NotificationIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1331 4C15.4887 4 18.209 6.72029 18.209 10.076C18.209 11.9639 18.209 13.8496 18.209 15C18.209 18 20.2344 19 20.2344 19L4.03173 19C4.03173 19 6.05706 18 6.05706 15C6.05706 13.8496 6.05706 11.9639 6.05706 10.076C6.05706 6.72029 8.77738 4 12.1331 4V4Z"
        stroke="#1D1F20"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1056 18.5C10.1056 19.6046 11.0124 20.5 12.1309 20.5C13.2495 20.5 14.1562 19.6046 14.1562 18.5"
        fill="#1D1F20"
      />
      <path
        d="M10.1056 18.5C10.1056 19.6046 11.0124 20.5 12.1309 20.5C13.2495 20.5 14.1562 19.6046 14.1562 18.5"
        stroke="#1D1F20"
        strokeWidth="1.5"
      />
      <circle cx="12.125" cy="2.5" r="1" stroke="#1D1F20" />
    </svg>
  );
}
