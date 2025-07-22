import { Chip } from "@genuin/ui/chip";

import GenuinBadge from "./genuin-badge";
import VerifiedBadge from "./verified-badge";

// Define the properties for the BrandBadgeIcon component
type BrandBadgeIconProps = {
  userLogoType?: number; // Optional prop to determine the type of badge to display
  className?: string; // Optional prop to apply additional custom classes
  variant: "light" | "primary" | "dark"; // Required prop to determine the color scheme of the badge
};

// Define the BrandBadgeIcon component
export const BrandBadge: React.FC<BrandBadgeIconProps> = ({
  userLogoType = 2,
  className,
  variant = "primary",
}) => {
  return (
    <>
      {/* Render the GenuinBadge component if userLogoType is 1 */}
      {/* This means that brand has just signed up but not white labeled or signed the contract */}
      {userLogoType === 1 && (
        <GenuinBadge variant={variant} className={className} />
      )}
      {/* Render the BrandBadge component if userLogoType is 2 */}
      {/* This means that brand has signed up, white labeled but not signed the contract */}
      {userLogoType === 2 && <Chip>Brand</Chip>}
      {/* Render the VerifiedBadge component if userLogoType is 3 */}
      {/* This means that brand has signed up, white labeled and signed the contract */}
      {userLogoType === 3 && (
        <VerifiedBadge variant={variant} className={className} />
      )}
    </>
  );
};
