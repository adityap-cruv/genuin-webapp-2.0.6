import { cn } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import { cva, type VariantProps } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "gencl:stroke-secondary-600",
      active: "gencl:stroke-black",
      muted: "gencl:stroke-secondary-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function ClockIcon({
  className,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, iconVariants({ variant }))}
      {...restProps}
    >
      <path
        d="M2.625 12C2.625 14.4864 3.61272 16.871 5.37087 18.6291C7.12903 20.3873 9.5136 21.375 12 21.375C14.4864 21.375 16.871 20.3873 18.6291 18.6291C20.3873 16.871 21.375 14.4864 21.375 12C21.375 9.5136 20.3873 7.12903 18.6291 5.37087C16.871 3.61272 14.4864 2.625 12 2.625C9.5136 2.625 7.12903 3.61272 5.37087 5.37087C3.61272 7.12903 2.625 9.5136 2.625 12Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.375V12L15.75 13.875"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
