import { type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the priceTagVariant function using cva to handle different styles based on props
const priceTagVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:text-black", // Light theme uses primary color
      dark: "gencl:text-white", // Dark theme uses white
      green: "gencl:text-[#0D8668]",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light", // Default to light theme
    size: "md", // Default size
  },
});

type PriceTagIconPropsType = ComponentProps<"svg"> &
  VariantProps<typeof priceTagVariant>;

export function PriceTagIcon({
  theme,
  size,
  className,
  ...restProps
}: PriceTagIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      className={cn(priceTagVariant({ theme, size }), className)}
      {...restProps}
    >
      <path
        d="M2.75 9.06348V3.06348H8.75L14.75 9.06348L8.75 15.0635L2.75 9.06348Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M1.02564 0.980456C0.703468 1.10437 0.542747 1.46599 0.666659 1.78816C0.790571 2.11033 1.15219 2.27105 1.47436 2.14714L1.02564 0.980456ZM1.25 1.5638L1.47436 2.14714C1.97753 1.95361 2.57065 1.79035 3.13933 1.72716C3.71899 1.66276 4.20749 1.70964 4.54952 1.86828C4.85049 2.00788 5.078 2.24851 5.15665 2.72886C5.24268 3.25423 5.14954 4.08395 4.66666 5.33944L5.25 5.5638L5.83334 5.78816C6.35046 4.44365 6.52815 3.3692 6.39022 2.52686C6.24492 1.6395 5.75368 1.04889 5.07548 0.734318C4.43834 0.438792 3.68726 0.408589 3.00129 0.484807C2.30435 0.562245 1.60581 0.757314 1.02564 0.980456L1.25 1.5638Z"
        fill="currentColor"
      />
      <circle cx="5.25" cy="5.5625" r="0.5" fill="none" stroke="currentColor" />
    </svg>
  );
}
