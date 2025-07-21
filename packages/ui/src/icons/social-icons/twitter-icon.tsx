import { cn } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";

export function TwitterIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className={cn("gencl:fill-secondary-600", className)}
      {...restProps}>
      <path d="M15.2706 1.58594H18.0818L11.9401 8.60551L19.1654 18.1576H13.5081L9.07706 12.3643L4.00699 18.1576H1.19406L7.76323 10.6493L0.832031 1.58594H6.63296L10.6382 6.88121L15.2706 1.58594ZM14.284 16.4749H15.8417L5.78653 3.18021H4.11492L14.284 16.4749Z"/>
    </svg>
  );
}
