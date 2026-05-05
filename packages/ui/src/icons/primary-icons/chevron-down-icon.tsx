import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the chevronDownVariant function using cva to handle different styles based on props
const chevronDownVariant = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white", // Dark variant style
      light: "gencl:fill-black", // Light variant style
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light", // Default to light theme
    size: "sm", // Default size
  },
});

// Define the Props type for the ChevronDownIcon component
type ChevronDownIconPropsType = ComponentProps<"svg"> & VariantProps<typeof chevronDownVariant>;

export function ChevronDownIcon({ theme, size, className, ...restProps }: ChevronDownIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 25"
      fill="none"
      className={cn(chevronDownVariant({ theme, size }), className)}
      {...restProps}>
      <path d="M6.31409 9.28299C5.8953 9.70178 5.8953 10.3783 6.31409 10.7971L11.243 15.7259C11.6617 16.1447 12.3383 16.1447 12.757 15.7259L17.6859 10.7971C18.1047 10.3783 18.1047 9.70178 17.6859 9.28299C17.2671 8.8642 16.5906 8.8642 16.1718 9.28299L11.9946 13.4494L7.82819 9.28299C7.4094 8.87494 6.72215 8.87494 6.31409 9.28299Z" />
    </svg>
  );
}
