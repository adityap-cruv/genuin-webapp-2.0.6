import { type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
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
type ChevronUpIconPropsType = ComponentProps<"svg"> &
  VariantProps<typeof chevronUpVariant>;

export function ChevronUpIcon({
  theme,
  size,
  className,
  ...restProps
}: ChevronUpIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      className={cn(chevronUpVariant({ theme, size }), className)}
      {...restProps}
    >
      <path
        d="M6.00044 0.29541L0.000976562 6.29487L1.41085 7.70474L6.00044 3.12516L10.59 7.70474L11.9999 6.29487L6.00044 0.29541Z"
        // fill="#767B81"
      />
    </svg>
  );
}
