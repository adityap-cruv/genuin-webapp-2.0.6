import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    theme: {
      dark: "gencl:stroke-white",
      light: "gencl:stroke-black",
      danger: "gencl:stroke-error-status",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

export function FlagIcon({
  size,
  theme,
  className,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(iconVariants({ size, theme }), className, "")}
      {...restProps}
    >
      <path d="M5 5V20" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5 6C5 6 6.75 4 9.375 4C12 4 14 6 16 6C18 6 19 5 19 5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 16C5 16 6.75 13.8 9.375 13.8C12 13.8 14 16 16 16C18 16 19 14.9 19 14.9V5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
