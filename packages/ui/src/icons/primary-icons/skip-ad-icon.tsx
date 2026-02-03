import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    size: "md",
  },
});

export function SkipAdIcon({
  className,
  size,
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("gencl:fill-white", iconVariants({ size }), className)}
    >
      <path d="M8.5 6L0 0V12L8.5 6ZM10 0H12V12H10V0Z" />
    </svg>
  );
}
