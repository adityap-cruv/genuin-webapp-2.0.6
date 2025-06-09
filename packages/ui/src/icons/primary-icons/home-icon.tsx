import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

export function HomeIcon({ className, ...restProps }: SVGIconsProps) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0569 3.37231L2 12H4.99878V21H9.99878V15.7369C9.99878 15.3511 10.135 14.9833 10.3737 14.7105C10.6123 14.4377 10.934 14.2824 11.2715 14.2824H12.7261C13.0636 14.2824 13.3873 14.4356 13.626 14.7084C13.8647 14.9812 13.9988 15.3511 13.9988 15.7369V21H18.9988V12H22L12.9431 3.37231C12.8193 3.25428 12.6723 3.16064 12.5104 3.09676C12.3486 3.03288 12.1752 3 12 3C11.8248 3 11.6514 3.03288 11.4896 3.09676C11.3277 3.16064 11.1807 3.25428 11.0569 3.37231Z"
        fill="currentColor"
      />
    </svg>
  );
}
