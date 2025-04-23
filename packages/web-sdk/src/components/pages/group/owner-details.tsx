import { CustomLink } from '@/router/custom-link'
import { CustomAvatar } from '@/components/custom-avatar'
import BrandBadgeIcon from '@/components/brand-badge-icon'
import { PrivateCommunityTooltip } from '../community/private'
import { Stats } from '@/components/stats'
import type { LoopDetailsType } from './schema'
import type { ComponentProps } from 'react'
import { cn } from '@/utils'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type LoopOwnerDetailsPropsType = {
  loopOwner: LoopDetailsType['owner']
  loopCommunity: LoopDetailsType['community']
  noOfPosts: number
  noOfMembers: number
} & ComponentProps<'div'>

export function LoopOwnerDetails({
  loopOwner,
  loopCommunity,
  noOfMembers,
  noOfPosts,
  className,
  ...restProps
}: LoopOwnerDetailsPropsType) {
  const pathName = usePathNameWithSubdomain()

  return (
    <div
      className={cn(
        'my-3 w-full rounded-xl border border-tertiary-200 p-4',
        className,
      )}
      {...restProps}>
      <div className='flex gap-x-2'>
        <div className='flex-1'>
          <p className='text-cap-1-demi text-tertiary'>Created by</p>
          <CustomLink
            href={
              loopOwner.brand?.brand_slug
                ? pathName.brand(loopOwner.brand.brand_slug)
                : pathName.profile(loopOwner.username)
            }>
            <div className='my-2 flex items-center gap-1'>
              <CustomAvatar
                fallbackString={loopOwner.name ?? ''}
                imageUrl={loopOwner.profile_image ?? ''}
                isAvatar={loopOwner.is_avatar}
                className='h-8 w-8'
              />
              <p className='line-clamp-1 break-all text-cap-1-bold md:text-body-1-bold text-secondary'>
                @{loopOwner.username}
              </p>
              {loopOwner.brand && (
                <BrandBadgeIcon
                  userLogoType={loopOwner.brand?.brand_user_logo ?? 1}
                  variant='dark'
                />
              )}
            </div>
          </CustomLink>
        </div>
        <div className='flex-1'>
          <p className='text-cap-1-demi text-tertiary'>Posted in</p>
          <div className='my-2 flex items-center'>
            <CustomLink href={pathName.community(loopCommunity.slug)}>
              <div className='flex items-center'>
                <CustomAvatar
                  imageUrl={loopCommunity.dp ?? ''}
                  fallbackString={loopCommunity.name ?? ''}
                  isAvatar={false}
                  className='h-8 w-8'
                />
                <p className='ml-1 line-clamp-1 break-all text-cap-1-bold md:text-body-1-bold text-secondary'>
                  {loopCommunity.name}
                </p>
              </div>
            </CustomLink>
            {loopCommunity.type === 2 && <PrivateCommunityTooltip />}
          </div>
        </div>
      </div>
      <Stats
        values={{
          Posts: noOfPosts ?? 0,
          Members: noOfMembers ?? 0,
        }}
      />
    </div>
  )
}
