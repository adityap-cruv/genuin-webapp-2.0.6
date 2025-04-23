import { LockIcon } from '@/components/icons/lock-icon'
import { BrandCommunityTag } from '@/components/brand-community-tag'
import { CustomAvatar } from '@/components/custom-avatar'
import { ComponentProps } from 'react'
import { cn, CommunityPrivacyEnum } from '@/utils'
import { CommunityRoleChangedHandlerType, JoinButton } from './join-button'
import { CommunityUserRole } from './tree-structure'
import { AuthenticationModal } from './authentication'
import { navigate } from '@/router/context'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type CommunityDetailsType = {
  id: string
  slug: string
  profileImage: string
  name: string
  type: CommunityPrivacyEnum
  memberCount: number
  description?: string
  userRole?: CommunityUserRole
  brand?: {
    slug: string
    logo: string
    name: string
  }
}

type CommunityTileProps = {
  communityDetails: CommunityDetailsType
  onCommunityRoleChanged?: CommunityRoleChangedHandlerType
  /**
   * pass true if want to show join button for the respective community.
   */
  showJoinButton?: boolean
  /**
   * pass true if you want to redirect to community page on click.
   */
  redirectOnClick: boolean
} & ComponentProps<'div'>

export function CommunityTile({
  communityDetails,
  className,
  showJoinButton = false,
  redirectOnClick,
  onCommunityRoleChanged,
  onClick,
  ...restProps
}: CommunityTileProps) {
  const pathName = usePathNameWithSubdomain()

  return (
    <div
      className={cn(
        'flex flex-col gap-y-2 rounded-[10px] border border-tertiary-300 p-4',
        { 'cursor-pointer': redirectOnClick },
        className,
      )}
      {...restProps}
      onClick={(e) => {
        onClick?.(e)
        redirectOnClick && navigate(pathName.community(communityDetails.slug))
      }}>
      <div className='flex items-center justify-between'>
        <div className='flex w-full items-center gap-x-2'>
          <CustomAvatar
            imageUrl={communityDetails.profileImage ?? ''}
            fallbackString={communityDetails.name ?? ''}
            isAvatar={false}
            className='h-12 w-12'
          />
          <div className='w-full'>
            <p className='text-body-1-bold line-clamp-1 break-all'>
              {communityDetails.name}
            </p>
            <div className='flex items-center gap-1'>
              {communityDetails.brand && (
                <BrandCommunityTag
                  brandSlug={communityDetails.brand?.slug}
                  brandLogo={communityDetails.brand?.logo}
                  brandName={communityDetails.brand?.name}
                />
              )}
              <p className='text-body-1-demi text-tertiary line-clamp-1 break-all'>{`${communityDetails.memberCount} members`}</p>
              {communityDetails.type === CommunityPrivacyEnum.PRIVATE && (
                <div className='flex items-center justify-center'>
                  <LockIcon className='h-4 w-4 stroke-tertiary' />
                  <p className='text-cap-1-demi text-tertiary'>Private</p>
                </div>
              )}
            </div>
          </div>
          {showJoinButton && communityDetails.userRole && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}>
              <JoinButton
                textForStates={{
                  UNJOINED: 'Join',
                  MEMBER: 'Joined',
                }}
                communityId={communityDetails.id}
                communitySlug={communityDetails.slug}
                isPrivate={
                  communityDetails.type === CommunityPrivacyEnum.PRIVATE
                }
                role={communityDetails.userRole}
                onCommunityRoleChanged={(newRole) => {
                  onCommunityRoleChanged?.(newRole)
                }}
                fallbackFunc={() => {
                  AuthenticationModal.open()
                }}
              />
            </div>
          )}
        </div>
      </div>
      <p className='line-clamp-2 h-10 break-all text-body-1-demi'>
        {communityDetails.description}
      </p>
    </div>
  )
}
