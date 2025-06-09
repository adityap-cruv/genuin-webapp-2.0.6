import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

export function PencilWithLineIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className={cn("gencl:stroke-black", className)}
      {...restProps}
    >
      <path
        d="M1.44824 20.5532H20.5447"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.40515 16.5124L4.63086 17.3682L5.42656 12.5502L16.1369 1.91558C16.2848 1.76704 16.4609 1.64912 16.6548 1.56867C16.8487 1.4882 17.0567 1.44678 17.2668 1.44678C17.4768 1.44678 17.6849 1.4882 17.8789 1.56867C18.0728 1.64912 18.2489 1.76704 18.3968 1.91558L20.0837 3.59557C20.2328 3.7429 20.3513 3.91818 20.432 4.11132C20.5127 4.30445 20.5545 4.5116 20.5545 4.72083C20.5545 4.93005 20.5127 5.13721 20.432 5.33033C20.3513 5.52347 20.2328 5.69875 20.0837 5.84609L9.40515 16.5124Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
