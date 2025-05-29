import { cn } from "src/lib/utils";

import type { SVGIconsProps } from "../type";

export function BagIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("gencl:stroke-black", className)}
      {...restProps}
    >
      <path
        d="M3.5625 9.1875C3.5625 8.69022 3.76004 8.21331 4.11167 7.86167C4.46331 7.51004 4.94022 7.3125 5.4375 7.3125H18.5625C19.0598 7.3125 19.5367 7.51004 19.8883 7.86167C20.24 8.21331 20.4375 8.69022 20.4375 9.1875V17.625C20.4375 18.1223 20.24 18.5992 19.8883 18.9508C19.5367 19.3025 19.0598 19.5 18.5625 19.5H5.4375C4.94022 19.5 4.46331 19.3025 4.11167 18.9508C3.76004 18.5992 3.5625 18.1223 3.5625 17.625V9.1875Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 7.3125V5.4375C8.25 4.94022 8.44754 4.46331 8.79917 4.11167C9.15081 3.76004 9.62772 3.5625 10.125 3.5625H13.875C14.3723 3.5625 14.8492 3.76004 15.2008 4.11167C15.5525 4.46331 15.75 4.94022 15.75 5.4375V7.3125"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12V12.0094"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5625 12.9375C6.17961 14.2563 9.0694 14.9432 12 14.9432C14.9306 14.9432 17.8204 14.2563 20.4375 12.9375"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
