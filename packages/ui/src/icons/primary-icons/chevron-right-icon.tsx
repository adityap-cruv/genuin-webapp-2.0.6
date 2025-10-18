import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { SVGIconsProps } from "../type";
import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

const chevronRightVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:fill-black",
      dark: "gencl:fill-white",
      secondary: "gencl:fill-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "dark",
    size: "md",
  },
});

export function ChevronRightIcon({
  className,
  theme,
  size,
  ...restProps
}: SVGIconsProps & VariantProps<typeof chevronRightVariant>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className, chevronRightVariant({ theme, size }))}
      {...restProps}
    >
      <path d="M8.77528 6.3157C8.35616 6.73482 8.35616 7.41186 8.77528 7.83097L12.945 12.0007L8.77528 16.1704C8.35616 16.5895 8.35616 17.2665 8.77528 17.6857C9.1944 18.1048 9.87144 18.1048 10.2906 17.6857L15.2233 12.7529C15.6424 12.3338 15.6424 11.6568 15.2233 11.2377L10.2906 6.30495C9.88218 5.89658 9.1944 5.89658 8.77528 6.3157Z" />
    </svg>
  );
}
