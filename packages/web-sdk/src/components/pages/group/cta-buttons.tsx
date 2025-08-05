import ShareButton from '@/components/share-button'
import { ComponentProps } from 'react'
import { cn } from '@/utils'
import { Subscription } from './subscription'
import { JoinAsMemberButton } from './join-as-member'
import { mapMemberJoinStatus } from '@/components/tree-structure'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKeyForLoopDetails } from '@/utils/constants/keys'

type CTAButtonsPropsType = ComponentProps<'div'> & {
  isPrivate: boolean
  isSubscriber: boolean
  loopId: string
  shareUrl: string
  slug: string
  name?: string | null
  description: string | null | undefined
  loggedInUserStatus: number
}

export function CTAButtons({
  isPrivate,
  isSubscriber,
  loopId,
  shareUrl,
  className,
  name,
  slug,
  description,
  loggedInUserStatus,
  ...restProps
}: CTAButtonsPropsType) {
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
      className={cn('flex items-center gap-x-3', className)}
      {...restProps}>
      {!isPrivate && (
        <Subscription
          name={name ?? ''}
          slug={slug}
          isSubscribed={isSubscriber}
          loopId={loopId}
          ldDescription={ldDescription}
          shareUrl={shareUrl}
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: getQueryKeyForLoopDetails(slug),
              type: 'all',
            })
          }}
        />
      )}

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
  )
}
