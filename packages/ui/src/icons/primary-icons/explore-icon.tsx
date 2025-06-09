import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

export function ExploreIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...restProps}
    >
      <path
        d="M12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61523 17.3848 2.25 12 2.25C6.61523 2.25 2.25 6.61523 2.25 12C2.25 17.3848 6.61523 21.75 12 21.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.0131 6.98691C16.9068 6.88062 16.773 6.80605 16.6267 6.77157C16.4803 6.73709 16.3274 6.74406 16.1848 6.7917L9.13969 9.1397L6.79168 16.1848C6.74405 16.3274 6.73709 16.4804 6.77158 16.6267C6.80607 16.773 6.88064 16.9068 6.98692 17.0131C7.09321 17.1193 7.22702 17.194 7.37332 17.2284C7.51963 17.2629 7.67265 17.256 7.81523 17.2083L14.8603 14.8603L17.2084 7.81524C17.2559 7.67267 17.2629 7.51964 17.2284 7.37334C17.194 7.22702 17.1194 7.09322 17.0131 6.98691Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="0.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
