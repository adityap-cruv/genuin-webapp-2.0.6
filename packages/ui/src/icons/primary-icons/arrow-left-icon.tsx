import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { SVGIconsProps } from "../type";
import { cn } from "@genuin/ui/lib/utils";

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

export function ArrowLeftIcon({
  className,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className, iconVariants({ variant }))}
      {...restProps}
    >
      <g clip-path="url(#clip0_1155_304241)">
        <path
          d="M12 4L13.41 5.41L7.83 11H20V13H7.83L13.41 18.59L12 20L4 12L12 4Z"
          fill="#1D1F20"
        />
      </g>
      <defs>
        <clipPath id="clip0_1155_304241">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="matrix(-1 0 0 1 24 0)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
