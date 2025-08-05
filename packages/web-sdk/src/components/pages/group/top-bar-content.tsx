import { ComponentProps } from 'react'
import { Subscription } from './subscription'
import { cn } from '@/utils'
import ShareButton from '@/components/share-button'
import { getQueryKeyForLoopDetails } from '@/utils/constants/keys'
import { useQueryClient } from '@tanstack/react-query'
import { JoinAsMemberButton } from './join-as-member'
import { mapMemberJoinStatus } from '@/components/tree-structure'

type TopBarContentPropsType = {
  loopName: string
  loopId: string
  isSubscribed: boolean
  shareUrl: string
  slug: string
  name: string
  description: string | null | undefined
  loggedInUserStatus: number
} & ComponentProps<'div'>

export function TopBarContent({
  loopId,
  isSubscribed,
  loopName,
  shareUrl,
  className,
  slug,
  name,
  description,
  loggedInUserStatus,
  ...restProps
}: TopBarContentPropsType) {
  const ldDescription = `${
    description !== null &&
    description !== undefined &&
    description.replace(/\s+/g, '') !== ''
      ? description + ' | '
      : ''
  } • Join ${name} to talk about it`
  const queryClient = useQueryClient()

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-between',
        className,
      )}
      {...restProps}>
      <div className='flex items-center gap-x-2'>
        <p className='text-title-2-demi'>{loopName}</p>
      </div>
      <div className='my-2 hidden md:flex items-center gap-x-3'>
        <Subscription
          isSubscribed={isSubscribed}
          loopId={loopId}
          slug={slug}
          name={name}
          ldDescription={ldDescription}
          shareUrl={shareUrl}
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: getQueryKeyForLoopDetails(slug),
              type: 'all',
            })
          }}
        />
        <JoinAsMemberButton
          joinStatus={mapMemberJoinStatus(loggedInUserStatus)}
          chatId={loopId}
          groupName={name ?? ''}
          ldDescription={ldDescription}
          shareUrl={shareUrl}
          slug={slug}
        />
        <ShareButton url={shareUrl} />
      </div>
    </div>
  )
}
