import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

export function TwitterIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={cn("gencl:fill-black", className)}
      {...restProps}
    >
      <path d="M15.2745 1.58594H18.0857L11.944 8.60551L19.1693 18.1576H13.512L9.08097 12.3643L4.01089 18.1576H1.19796L7.76713 10.6493L0.835938 1.58594H6.63686L10.6421 6.88121L15.2745 1.58594ZM14.2879 16.4749H15.8456L5.79043 3.18021H4.11882L14.2879 16.4749Z" />
    </svg>
  );
}
