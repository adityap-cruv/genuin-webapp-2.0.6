import { requestCommunity, joinCommunity, leaveCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import { cn, openModal } from '@lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { joinCommunityDeepLink } from '@/lib/get-deeplink'
import { Loader } from '@/components/ui/loader'
import { memo, useCallback, useState } from 'react'

export type CommunityUserRoleType = 'LEADER' | 'MEMBER' | 'REQUESTED' | null

type Props = {
  handle: string
  type: 'public' | 'private'
  id: string
  buttonText: string
  onStatusChange: (role: CommunityUserRoleType) => void
  role?: CommunityUserRoleType
  communityName?: string
}

// TODO: Rename this component to JoinCommunityButton after the migration is done
export const UpdatedJoinCommunityButton = memo(function UpdatedJoinCommunityButton({
  role,
  handle,
  id,
  buttonText,
  type,
  communityName,
  onStatusChange,
}: Props) {
  const queryClient = useQueryClient()
  const user = useGenuinOptions().user
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const handleJoinCommunity = async () => {
    if (type === 'private') {
      const response = await requestCommunity(id)
      if (response.code === 200) {
        onStatusChange?.('REQUESTED')
      } else {
        throw new Error('Failed to request to join the community')
      }
    } else {
      const response = await joinCommunity(false, [id], [{ user_id: user?.id }])
      if (response.code === 200) {
        onStatusChange?.('MEMBER')
      } else {
        throw new Error('Failed to join the community')
      }
    }
  }

  const handleLeaveCommunity = async () => {
    const response = await leaveCommunity(id)
    if (response.code === 200) {
      onStatusChange?.(null)
    }
  }

  const toggleCommunityJoinState = useCallback(async () => {
    try {
      setIsLoading(true)
      if (role !== 'MEMBER') {
        await handleJoinCommunity()
      } else {
        await handleLeaveCommunity()
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setIsLoading(false)
      // Invalidate cached queries related to community details
      void queryClient.invalidateQueries({
        queryKey: ['community', 'details'],
        type: 'all',
      })
    }
  }, [id, role, user])

  const joinCommunityDeepLinkHandler = useCallback(async () => {
    await joinCommunityDeepLink({
      communityName: communityName ?? '',
      searchParams: Object.fromEntries(searchParams),
    }).then((generatedLink) => {
      openModal({
        deepLink: generatedLink,
        subtitle: (
          <>
            Get the app to join the <br />
            <span className="font-bold">@{handle}</span> community.
          </>
        ),
      })
    })
  }, [communityName, searchParams])

  if (role === 'LEADER') return

  if (role === 'REQUESTED')
    return (
      <Button size="custom" className="border border-primary" variant={'outline'}>
        <p className={`px-4 py-1.5 text-body-1-demi text-monochrome-white text-primary`}>Requested</p>
      </Button>
    )

  // TODO: Have discussion with design team to decide the color of the button. It should be primary or secondary or tertiary.
  return (
    <Button
      size="custom"
      className="rounded border border-primary px-4 py-1.5"
      variant={role ? 'outline' : 'default'}
      onClick={user ? toggleCommunityJoinState : joinCommunityDeepLinkHandler}>
      {isLoading ? (
        <Loader size="xs" className={cn(role ? 'stroke-primary' : 'stroke-monochrome-white')} />
      ) : (
        <p className={cn('whitespace-nowrap text-body-1-demi', role ? 'text-primary' : 'text-monochrome-white')}>
          {role === 'MEMBER' ? 'Joined' : buttonText}
        </p>
      )}
    </Button>
  )
})
