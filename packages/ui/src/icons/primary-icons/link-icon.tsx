import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const iconVariants = cva("", {
  variants: {
    variant: {
      dark: "gencl:stroke-secondary-900",
      light: "gencl:stroke-white",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    size: "md",
    variant: "dark",
  },
});

export function LinkIcon({
  className,
  size,
  variant,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className={cn(iconVariants({ size, variant }), className)}
      {...restProps}>
      <path
        d="M8.15317 14.2566L7.50031 14.9095C6.90915 15.5006 6.10738 15.8327 5.27136 15.8327C4.43534 15.8327 3.63356 15.5006 3.0424 14.9095C2.45125 14.3183 2.11914 13.5165 2.11914 12.6805C2.11914 11.8445 2.45125 11.0427 3.0424 10.4516L6.38583 7.10742C6.94638 6.54561 7.69822 6.21591 8.49121 6.18417C9.2842 6.15242 10.06 6.42097 10.6636 6.93618C11.2673 7.45139 11.6544 8.17535 11.7477 8.96348C11.8409 9.75161 11.6334 10.5459 11.1667 11.1878"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9726 5.19863L12.498 4.67326C13.0891 4.08211 13.8909 3.75 14.7269 3.75C15.5629 3.75 16.3647 4.08211 16.9559 4.67326C17.547 5.26442 17.8791 6.0662 17.8791 6.90222C17.8791 7.73824 17.547 8.54001 16.9559 9.13117L13.6125 12.4746C13.0518 13.0362 12.2999 13.3656 11.507 13.3972C10.7141 13.4287 9.93848 13.1601 9.33497 12.6448C8.73145 12.1296 8.34448 11.4056 8.25131 10.6176C8.15813 9.82954 8.36561 9.03534 8.83232 8.39356"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
