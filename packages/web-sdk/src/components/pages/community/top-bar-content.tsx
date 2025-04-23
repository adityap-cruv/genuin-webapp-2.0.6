import { CustomAvatar } from '@/components/custom-avatar'
import { JoinButton } from '@/components/join-button'
import ShareButton from '@/components/share-button'
import { CommunityUserRole } from '@/components/tree-structure'
import { cn } from '@/utils'
import { getQueryKeyForCommunityDetails } from '@/utils/constants/keys'
import { useQueryClient } from '@tanstack/react-query'
import { ComponentProps } from 'react'

type TopBarContentPropsType = {
  communityProfileImage: string
  communityName: string
  communityId: string
  role: CommunityUserRole
  isCommunityPrivate: boolean
  shareUrl: string
  communitySlug: string
} & ComponentProps<'div'>

export function TopBarContent({
  communityId,
  communityName,
  communityProfileImage,
  isCommunityPrivate,
  role,
  shareUrl,
  communitySlug,
  className,
  ...restProps
}: TopBarContentPropsType) {
  const queryClient = useQueryClient()
  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-between',
        className,
      )}
      {...restProps}>
      <div className='flex items-center gap-x-2'>
        <CustomAvatar
          imageUrl={communityProfileImage}
          fallbackString={communityName}
          isAvatar={false}
          className='h-8 w-8'
        />
        <p className='text-title-2-demi line-clamp-1 break-all'>
          {communityName}
        </p>
      </div>
      <div className='hidden md:flex items-center gap-x-2'>
        <JoinButton
          communitySlug={communitySlug}
          communityId={communityId}
          isPrivate={isCommunityPrivate}
          role={role}
          onCommunityRoleChanged={async () => {
            await queryClient.invalidateQueries({
              exact: true,
              queryKey: getQueryKeyForCommunityDetails(communitySlug),
            })
          }}
        />
        <ShareButton url={shareUrl} />
      </div>
    </div>
  )
}
