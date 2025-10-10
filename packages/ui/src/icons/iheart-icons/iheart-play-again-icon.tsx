import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white",
      light: "gencl:fill-black",
      secondary: "gencl:fill-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

export function IHeartPlayAgainIcon({
  theme,
  size,
  className,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}
    >
      <path d="M7.03879 6.82332L5.23324 5.01777C4.94204 4.72654 4.45021 4.93363 4.45667 5.34133L4.45021 10.2532C4.45021 10.5121 4.65081 10.7127 4.90968 10.7127L9.81509 10.7127C10.2228 10.7062 10.4299 10.2144 10.1387 9.92318L8.3331 8.11763C10.7469 5.70375 14.8693 6.00791 16.8432 9.04305C18.008 10.8163 18.0015 13.1913 16.8432 14.958C15.0182 17.7537 11.3747 18.2262 8.92201 16.3947C8.56608 16.1294 8.05483 16.1618 7.73772 16.4788C7.34943 16.8671 7.38179 17.5208 7.82186 17.8572C11.0641 20.2969 15.8724 19.6951 18.3381 16.0387C19.9625 13.6249 19.9625 10.3762 18.3381 7.9623C15.6588 4.00173 10.2357 3.62639 7.03879 6.82332Z" />
    </svg>
  );
}
