// import { CustomAvatar } from '@components/custom/custom-avatar'
import { CustomAvatar } from '@/components/custom-avatar'
import BrandBadgeIcon from '@/components/brand-badge-icon'
import type { ComponentProps } from 'react'
import { cn } from '@/utils'

export type ListItemPropsType = {
  title: string
  subtitle?: string
  description?: string
  image?: string
  isAvatar: boolean
  isOwner: boolean
  brand?: {
    brand_id: number
    brand_slug: string
    brand_user_logo: number
  } | null
} & ComponentProps<'div'>

export function ListItem({
  title,
  subtitle,
  description,
  image,
  isAvatar,
  brand,
  isOwner,
  className,
  ...restProps
}: ListItemPropsType) {
  return (
    <div
      className={cn(
        'flex items-center gap-x-1 rounded-lg p-2 hover:bg-tertiary-200',
        className,
      )}
      {...restProps}>
      <CustomAvatar
        className='h-12 w-12 bg-red-40'
        imageUrl={image ?? ''}
        fallbackString={title ?? ''}
        isAvatar={isAvatar}
      />
      <div className='mx-2'>
        <div className='flex items-center gap-2'>
          <p className='line-clamp-1 text-body-1-demi'>{subtitle}</p>
          {brand && (
            <BrandBadgeIcon
              userLogoType={brand?.brand_user_logo}
              variant='dark'
            />
          )}
          {isOwner && (
            <p className='flex items-center gap-1 rounded-full bg-primary-200 p-1 pr-1.5 text-cap-1-demi text-primary'>
              Owner
            </p>
          )}
        </div>
        {title && <p className='line-clamp-1 text-body-1-med'>{title}</p>}
        {description && (
          <p className='line-clamp-1 text-body-1-med text-tertiary'>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
