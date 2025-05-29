import { cn } from "src/lib/utils";

import type { SVGIconsProps } from "../type";

export function CreatedProfileIcon({ className, ...restProps }: SVGIconsProps) {
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
      <g clipPath="url(#clip0_2003_51653)">
        <path
          d="M-207.999 -103V-61.0005H-255.999V81.9995H229.001V-103H-207.999Z"
          strokeWidth="0.75"
          strokeMiterlimit="10"
        />
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
        <circle cx="12.0928" cy="9.56154" r="2.81154" strokeWidth="1.5" />
        <path
          d="M6.75 16.5954C8.36683 14.6245 12.953 12.3512 17.1972 16.5954"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
