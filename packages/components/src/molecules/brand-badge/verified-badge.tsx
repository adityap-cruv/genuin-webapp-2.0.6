// Import necessary libraries and modules
import { TickIcon } from "@genuin/ui/icons";
import { cva } from "class-variance-authority"; // Import the class variance authority (cva) function
import React from "react";
import { cn } from "@genuin/ui/utils";

// Define the properties for the VerifiedBadge component
type VerifiedBadgeProps = {
  className?: string; // Optional className prop to apply additional custom classes
  variant?: "light" | "primary" | "dark"; // Optional variant prop to determine the color scheme
  size?: "sm" | "md" | "lg"; // Optional size prop to determine the size of the badge
};

// Define the class variance authority (cva) for the badge classes
const badgeClasses = cva("", {
  variants: {
    size: {
      sm: "h-3 w-3", // Small size classes
      md: "h-4 w-4", // Medium size classes
      lg: "h-5 w-5", // Large size classes
    },
  },
  defaultVariants: {
    size: "md", // Default size is medium
  },
});

// Define the VerifiedBadge component
const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  className,
  variant,
  size,
}) => {
  return (
    // Container div with flexbox properties, size-specific classes, and additional custom classes
    <div
      className={cn(
        "flex items-center gap-1",
        badgeClasses({ size }),
        className
      )}
    >
      {/* TickIcon component with variant-specific and size-specific classes */}
      <TickIcon variant={variant} className={badgeClasses({ size })} />
    </div>
  );
};

// Export the VerifiedBadge component as the default export
export default VerifiedBadge;
