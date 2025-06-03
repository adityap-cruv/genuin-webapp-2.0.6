// Import necessary libraries and modules
import { GenuinIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

// Define the class variance authority (cva) for the badge variants
const badgeVariants = cva("", {
  variants: {
    size: {
      sm: "gencl:h-2 gencl:w-2", // Small size classes
      md: "gencl:h-4 gencl:w-4", // Medium size classes
      lg: "gencl:h-6 gencl:w-6", // Large size classes
    },
    variant: {
      light: "gencl:fill-foreground", // Light variant class
      dark: "gencl:fill-foreground", // Dark variant class
      primary: "gencl:fill-primary", // Primary variant class
    },
  },
  defaultVariants: {
    size: "md", // Default size is medium
    variant: "light", // Default variant is light
  },
});

// Define the class variance authority (cva) for the span variants
const spanVariants = cva("", {
  variants: {
    variant: {
      light: "gencl:bg-secondary-300", // Light variant class
      dark: "gencl:bg-secondary-300", // Dark variant class
      primary: "gencl:bg-primary", // Primary variant class
    },
  },
  defaultVariants: {
    variant: "light", // Default variant is light
  },
});

// Define the properties for the GenuinBadge component
type GenuinBadgeProps = {
  className?: string; // Optional className prop to apply additional custom classes
} & VariantProps<typeof badgeVariants>;

// Define the GenuinBadge component
const GenuinBadge: React.FC<GenuinBadgeProps> = ({
  size,
  variant,
  className,
}) => {
  return (
    // Container div with flexbox properties and additional custom classes
    <div className={cn("gencl:flex gencl:items-center gencl:gap-1", className)}>
      {/* Span element with variant-specific and additional classes */}
      <span
        className={cn(
          "gencl:h-1 gencl:w-1 gencl:rounded-full",
          spanVariants({ variant })
        )}
      ></span>
      {/* GenuinIcon component with size and variant-specific classes */}
      <GenuinIcon className={badgeVariants({ size, variant })} />
    </div>
  );
};

// Export the GenuinBadge component as the default export
export default GenuinBadge;
