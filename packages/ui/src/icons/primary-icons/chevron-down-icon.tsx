import { type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
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
type ChevronDownIconPropsType = ComponentProps<"svg"> &
  VariantProps<typeof chevronDownVariant>;

export function ChevronDownIcon({
  theme,
  size,
  className,
  ...restProps
}: ChevronDownIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      className={cn(chevronDownVariant({ theme, size }), className)}
      {...restProps}
    >
      <path
        d="M6.00044 7.70474L0.000976562 1.70528L1.41085 0.29541L6.00044 4.87499L10.59 0.29541L11.9999 1.70528L6.00044 7.70474Z"
        // fill="#767B81"
      />
    </svg>
  );
}
