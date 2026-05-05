import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the chevronUpVariant function using cva to handle different styles based on props
const chevronUpVariant = cva("", {
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

// Define the Props type for the ChevronUpIcon component
type ChevronUpIconPropsType = ComponentProps<"svg"> & VariantProps<typeof chevronUpVariant>;

export function ChevronUpIcon({ theme, size, className, ...restProps }: ChevronUpIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 25"
      fill="none"
      className={cn(chevronUpVariant({ theme, size }), className)}
      {...restProps}>
      <path d="M17.6859 15.717C18.1047 15.2982 18.1047 14.6217 17.6859 14.2029L12.757 9.27405C12.3383 8.85526 11.6617 8.85526 11.243 9.27405L6.31409 14.2029C5.8953 14.6217 5.8953 15.2982 6.31409 15.717C6.73289 16.1358 7.4094 16.1358 7.82819 15.717L12.0054 11.5506L16.1718 15.717C16.5906 16.1251 17.2779 16.1251 17.6859 15.717Z" />
    </svg>
  );
}
