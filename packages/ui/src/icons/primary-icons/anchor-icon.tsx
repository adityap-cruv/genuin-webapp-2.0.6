import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps } from "react";

type AnchorIconProps = ComponentProps<"svg">;

export function AnchorIcon({ className, ...restProps }: AnchorIconProps) {
  return (
    <svg
      width="25"
      height="16"
      viewBox="0 0 25 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("lucide lucide-anchor", className)}
      {...restProps}
    >
      <path
        d="M10.9881 15.2543C11.7857 16.1752 13.2143 16.1752 14.0119 15.2543L23.9235 3.80931C25.0452 2.51402 24.1251 0.5 22.4116 0.5H2.58838C0.874875 0.5 -0.0452271 2.51402 1.07652 3.80931L10.9881 15.2543Z"
        fill="#5786FF"
      />
    </svg>
  );
}
