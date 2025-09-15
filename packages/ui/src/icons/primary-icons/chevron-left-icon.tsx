import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { SVGIconsProps } from "../type";

// Define the playVariant function using cva to handle different styles based on props
const chevronLeftVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
      secondary: "gencl:stroke-secondary-600",
      "fill-dark": "gencl:fill-white",
      "fill-light": "gencl:fill-black",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

// Define the Props type for the ChevronLeftIcon component
type ChevronLeftIconPropsType = SVGIconsProps &
  VariantProps<typeof chevronLeftVariant>;

export function ChevronLeftIcon({
  theme = "dark",
  size,
  className,
  ...restProps
}: ChevronLeftIconPropsType) {
  return (
    <svg
      width="24"
      height="32"
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(chevronLeftVariant({ theme, size }), className)}
      {...restProps}
    >
      <path d="M13.6663 12.6665L10.333 15.9998L13.6663 19.3332" />
    </svg>
  );
}
