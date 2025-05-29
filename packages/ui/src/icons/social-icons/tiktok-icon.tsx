import { cn } from "src/lib/utils";

import type { SVGIconsProps } from "../type";

export function TiktokIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={cn("gencl:fill-black", className)}
      {...restProps}
    >
      <path d="M14.2245 0H10.8539V13.6232C10.8539 15.2464 9.55755 16.5797 7.94428 16.5797C6.33101 16.5797 5.03464 15.2464 5.03464 13.6232C5.03464 12.029 6.3022 10.7246 7.85787 10.6667V7.24639C4.42966 7.30433 1.66406 10.1159 1.66406 13.6232C1.66406 17.1594 4.48728 20 7.9731 20C11.4589 20 14.2821 17.1304 14.2821 13.6232V6.63767C15.5497 7.56522 17.1053 8.11594 18.7474 8.14495V4.72464C16.2123 4.63768 14.2245 2.55072 14.2245 0Z" />
    </svg>
  );
}
