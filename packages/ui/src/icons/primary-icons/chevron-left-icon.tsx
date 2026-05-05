import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

// Define the playVariant function using cva to handle different styles based on props
const chevronLeftVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:fill-black",
      dark: "gencl:fill-white",
      secondary: "gencl:fill-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

// Define the Props type for the ChevronLeftIcon component
type ChevronLeftIconPropsType = SVGIconsProps & VariantProps<typeof chevronLeftVariant>;

export function ChevronLeftIcon({ theme = "light", size, className, ...restProps }: ChevronLeftIconPropsType) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(chevronLeftVariant({ theme, size }), className)}
      {...restProps}>
      <path d="M15.218 6.31409C14.7992 5.8953 14.1227 5.8953 13.7039 6.31409L8.77503 11.243C8.35624 11.6617 8.35624 12.3383 8.77503 12.757L13.7039 17.6859C14.1227 18.1047 14.7992 18.1047 15.218 17.6859C15.6368 17.2671 15.6368 16.5906 15.218 16.1718L11.0515 11.9946L15.218 7.82819C15.626 7.4094 15.626 6.72215 15.218 6.31409Z" />
    </svg>
  );
}
