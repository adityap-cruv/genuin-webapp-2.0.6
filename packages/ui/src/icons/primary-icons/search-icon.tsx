import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    theme: {
      default: "gencl:fill-secondary-900",
      light: "gencl:fill-black",
      dark: "gencl:fill-white",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "default",
    size: "md",
  },
});

export function SearchIcon({
  className,
  theme = "default",
  size,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}
    >
      <path d="M13.1276 11.8796H12.4693L12.2359 11.6546C13.0526 10.7046 13.5443 9.47122 13.5443 8.12956C13.5443 5.13789 11.1193 2.71289 8.1276 2.71289C5.13594 2.71289 2.71094 5.13789 2.71094 8.12956C2.71094 11.1212 5.13594 13.5462 8.1276 13.5462C9.46927 13.5462 10.7026 13.0546 11.6526 12.2379L11.8776 12.4712V13.1296L16.0443 17.2879L17.2859 16.0462L13.1276 11.8796ZM8.1276 11.8796C6.0526 11.8796 4.3776 10.2046 4.3776 8.12956C4.3776 6.05456 6.0526 4.37956 8.1276 4.37956C10.2026 4.37956 11.8776 6.05456 11.8776 8.12956C11.8776 10.2046 10.2026 11.8796 8.1276 11.8796Z" />
    </svg>
  );
}
