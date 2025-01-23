import { requestCommunity, joinCommunity, leaveCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import { cn, openGeneratedLink, openModal } from '@lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useSearchParams } from 'next/navigation'
import { joinCommunityDeepLink } from '@/lib/get-deeplink'
import { Loader } from '@/components/ui/loader'
import { memo, useCallback, useState } from 'react'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { PATH_NAME } from '@/lib/utils/constants/path'

type Props = {
  handle: string
  type: 'public' | 'private'
  id: string
  buttonText: string
  role: CommunityUserRoleType
  communityName?: string
  isMobile: boolean
  onStatusChange?: (role: CommunityUserRoleType) => void
  shareUrl?: string
}

export const JoinCommunityButton = memo(function JoinCommunityButton({
  role,
  handle,
  id,
  buttonText,
  type,
  communityName,
  onStatusChange,
  isMobile,
  shareUrl,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const pathName = usePathname()
  const queryClient = useQueryClient()
  const user = useGenuinOptions().user
  const searchParams = useSearchParams()

  const handleJoinCommunity = async () => {
    // If community is private than we have to request to join the community
    if (type === 'private') {
      const response = await requestCommunity(id)
      if (response.code === 200) {
        onStatusChange?.('REQUESTED')
      } else {
        throw new Error('Failed to request to join the community')
      }
    } else {
      // This will join the user to the community.
      const response = await joinCommunity(false, [id], [{ user_id: user?.id }])
      if (response.code === 200) {
        onStatusChange?.('MEMBER')
      } else {
        throw new Error('Failed to join the community')
      }
    }
  }

  // This will leave the community
  const handleLeaveCommunity = async () => {
    const response = await leaveCommunity(id)
    if (response.code === 200) {
      onStatusChange?.('UNJOINED')
    }
  }

  const toggleCommunityJoinState = useCallback(async () => {
    try {
      setIsLoading(true)
      // If user is not a member of the community then join the community else leave the community
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

  // In case of user not authenticated, and user clicks on join button, then we have to show the deep link modal.
  const joinCommunityDeepLinkHandler = useCallback(async () => {
    // TODO: Remove embed path condition once we rlease the standard wall on the web-SDK
    const pathname = window.location.pathname
    if (pathname.includes('embed')) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    } else {
      await joinCommunityDeepLink({
        communityName: communityName ?? '',
        searchParams: Object.fromEntries(searchParams),
      }).then((generatedLink) => {
        if (isMobile) {
          openGeneratedLink(generatedLink)
        } else {
          openModal({
            deepLink: generatedLink,
            subtitle: (
              <>
                Get the app to join the <br />
                <span className="font-bold">@{handle}</span> community.
              </>
            ),
          })
        }
      })
    }
  }, [communityName, searchParams])

  // If user comes on his/her own profile or brand page, then don't show the join button.
  if (pathName === PATH_NAME.profile(user?.nickname) || pathName === PATH_NAME.brand(handle)) return null

  // If user is leader or moderator of the community, then don't show the join button.
  if (role === 'LEADER' || role === 'MODERATOR') return

  // If user has requested to join the community, then show the requested button.
  if (role === 'REQUESTED')
    return (
      <Button size="custom" className="border border-primary" variant="outline">
        <p className="h-[32px] px-4 text-body-1-demi text-primary">Requested</p>
      </Button>
    )
  // According to design we have to go with text-monochrome-white and stroke, as we can't use primary, secondary or tertiary colors
  return (
    <Button
      size="custom"
      className="h-[32px] rounded border border-primary px-4"
      variant={role === 'MEMBER' ? 'outline' : 'default'}
      onClick={user ? toggleCommunityJoinState : joinCommunityDeepLinkHandler}>
      {isLoading ? (
        <Loader size="xs" className={cn(role !== 'UNJOINED' ? 'stroke-primary' : 'stroke-monochrome-white')} />
      ) : (
        <p
          className={cn(
            'whitespace-nowrap text-body-1-demi',
            role === 'MEMBER' ? 'text-primary' : 'text-monochrome-white'
          )}>
          {role === 'MEMBER' ? 'Joined' : buttonText}
        </p>
      )}
    </Button>
  )
})
