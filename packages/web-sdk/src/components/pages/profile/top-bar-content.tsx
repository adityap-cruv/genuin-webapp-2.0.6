import BrandBadgeIcon from '@/components/brand-badge-icon'
import { CustomAvatar } from '@/components/custom-avatar'
import ShareButton from '@/components/share-button'
import { cn } from '@/utils'
import { ComponentProps } from 'react'

type TopBatContentProps = {
  profileImage: string
  profileName: string
  profileNickname: string
  isAvatar: boolean
  shareUrl: string
  brandUserLogo?: number
} & ComponentProps<'div'>

export function TopBarContent({
  isAvatar,
  profileImage,
  profileName,
  profileNickname,
  shareUrl,
  brandUserLogo,
  className,
  ...restProps
}: TopBatContentProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-between',
        className,
      )}
      {...restProps}>
      <div className='flex items-center gap-x-2'>
        <CustomAvatar
          imageUrl={profileImage}
          fallbackString={profileName}
          isAvatar={isAvatar}
          className='h-8 w-8'
        />
        {profileName ? (
          <p className='text-title-2-demi'>{profileName}</p>
        ) : (
          <p className='text-title-2-demi'>@{profileNickname}</p>
        )}
        <BrandBadgeIcon
          userLogoType={brandUserLogo}
          variant='dark'
        />
      </div>
      <ShareButton
        url={shareUrl}
        className='hidden md:block'
      />
    </div>
  )
}
