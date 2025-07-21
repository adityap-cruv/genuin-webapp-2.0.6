import { cn } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";

export function TiktokIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"  className={cn("gencl:fill-secondary-600", className)}
      {...restProps}>
      <path d="M14.2284 0H10.8578V13.6232C10.8578 15.2464 9.56146 16.5797 7.94819 16.5797C6.33491 16.5797 5.03854 15.2464 5.03854 13.6232C5.03854 12.029 6.30611 10.7246 7.86178 10.6667V7.24639C4.43357 7.30433 1.66797 10.1159 1.66797 13.6232C1.66797 17.1594 4.49118 20 7.97701 20C11.4628 20 14.286 17.1304 14.286 13.6232V6.63767C15.5536 7.56522 17.1092 8.11594 18.7513 8.14495V4.72464C16.2162 4.63768 14.2284 2.55072 14.2284 0Z"/>
    </svg>
  );
}
