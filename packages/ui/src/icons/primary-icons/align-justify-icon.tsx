import { AlignJustify } from "lucide-react";
import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "@genuin/ui/lib/utils";

const iconVariants = cva("", {
  variants: {
    theme: {
      light: "gencl:text-black",
      dark: "gencl:stroke-white",
    },
    size: {
      sm: "gencl:size-4",
      md: "gencl:size-5",
      lg: "gencl:size-6",
      xl: "gencl:size-8",
    },
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

export function AlignJustifyIcon({
  className,
  theme,
  size,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <AlignJustify
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}
    />
  );
}
