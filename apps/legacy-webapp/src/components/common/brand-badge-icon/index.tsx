// Import necessary libraries and components
import React from 'react'
import GenuinBadge from './GenuinBadge'
import BrandBadge from './BrandBadge'
import VerifiedBadge from './VerifiedBadge'

// Define the properties for the BrandBadgeIcon component
interface BrandBadgeIconProps {
  userLogoType?: number // Optional prop to determine the type of badge to display
  className?: string // Optional prop to apply additional custom classes
  variant: 'light' | 'primary' | 'dark' // Required prop to determine the color scheme of the badge
}

// Define the BrandBadgeIcon component (updated for React 19)
function BrandBadgeIcon({ userLogoType = 1, className, variant = 'primary' }: BrandBadgeIconProps) {
  return (
    <>
      {/* Render the GenuinBadge component if userLogoType is 1 */}
      {/* This means that brand has just signed up but not white labeled or signed the contract */}
      {userLogoType === 1 && <GenuinBadge variant={variant} className={className} />}
      {/* Render the BrandBadge component if userLogoType is 2 */}
      {/* This means that brand has signed up, white labeled but not signed the contract */}
      {userLogoType === 2 && <BrandBadge variant={variant} className={className} />}
      {/* Render the VerifiedBadge component if userLogoType is 3 */}
      {/* This means that brand has signed up, white labeled and signed the contract */}
      {userLogoType === 3 && <VerifiedBadge variant={variant} className={className} />}
    </>
  )
}

// Export the BrandBadgeIcon component as the default export
export default BrandBadgeIcon
