import React from 'react'
import GenuinBadge from './GenuinBadge'
import BrandBadge from './BrandBadge'
import VerifiedBadge from './VerifiedBadge'

interface BrandBadgeIconProps {
  userLogoType?: number
  className?: string
  variant: 'light' | 'primary' | 'dark'
}

const BrandBadgeIcon: React.FC<BrandBadgeIconProps> = ({ userLogoType = 1, className, variant = 'primary' }) => {
  return (
    <>
      {userLogoType === 1 && <GenuinBadge variant={variant} className={className} />}
      {userLogoType === 2 && <BrandBadge variant={variant} className={className} />}
      {userLogoType === 3 && <VerifiedBadge variant={variant} className={className} />}
    </>
  )
}

export default BrandBadgeIcon
