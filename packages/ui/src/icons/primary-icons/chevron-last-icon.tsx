import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

export function ChevronLastIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      {...restProps}
    >
      <path d="M32 8C32 3.58172 28.4183 0 24 0H0V32H24C28.4183 32 32 28.4183 32 24V8Z" />
      <path d="M12.6667 12.667L16 16.0003L12.6667 19.3337" stroke="#1D1F20" />
      <path d="M19.333 12H18.333V20H19.333V12Z" fill="#1D1F20" />
    </svg>
  );
}
