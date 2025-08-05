import { useCallback } from 'react'
import { CommunityUserRole } from '../tree-structure/utils'
import {
  JoinButtonPillUi,
  JoinButtonUi,
  type JoinButtonUiPropsType,
} from './ui'
import { joinCommunity, leaveCommunity, requestCommunity } from './api'
import { useAuth } from '@/context/auth'
import { useBrandDetails } from '@/context/brand-details'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { joinCommunityDeepLink } from '../download-app/get-deeplink'
import { useModalHandler } from '@/hooks/useModalHandler'
import { useSearchParams } from 'wouter'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '../ui/use-toast'

export type CommunityRoleChangedHandlerType = (
  role: CommunityUserRole,
) => void | Promise<void>

export type JoinButtonPropsType = {
  /**
   * Id of community
   */
  communityId: string
  communitySlug: string
  role: CommunityUserRole
  /**
   * Pass true if community is private.
   */
  isPrivate: boolean
  forEmbed?: boolean
  /**
   * function to invoke if user is not logged in.
   */
  fallbackFunc?: () => void
  onCommunityRoleChanged?: CommunityRoleChangedHandlerType
  communityName?: string | null | undefined
  communityHandle?: string
  buttonType?: 'default' | 'pill'
} & Omit<JoinButtonUiPropsType, 'onClick'>

export function JoinButton({
  communityId,
  role,
  communitySlug,
  isPrivate,
  forEmbed,
  onCommunityRoleChanged,
  fallbackFunc,
  communityName,
  communityHandle,
  buttonType,
  ...restProps
}: JoinButtonPropsType) {
  const { embedStyle } = useBrandDetails()
  const pathName = usePathNameWithSubdomain()
  const { user: authUser } = useAuth()
  const searchParams = useSearchParams()
  const { openModal } = useModalHandler()
  const { toast } = useToast()

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!authUser) throw new Error('Not authenticated')

      if (isPrivate) {
        const reqStatus = await requestCommunity(communityId)
        if (!reqStatus) throw new Error('Request failed')
        await onCommunityRoleChanged?.(CommunityUserRole.REQUESTED)
      } else {
        const joinStatus = await joinCommunity(false, communityId, authUser.id)
        if (!joinStatus) throw new Error('Join failed')
        await onCommunityRoleChanged?.(CommunityUserRole.MEMBER)
      }
    },
    onSuccess: () => {
      if (buttonType === 'pill') {
        toast({
          title: isPrivate
            ? 'This community changed to private, please request to join the community'
            : "You've joined this community",
          duration: 3000,
        })
      }
    },
    onError: (error) => {
      console.error('Error joining community:', error)
      toast({
        title: `Failed to ${isPrivate ? 'request to join' : 'join'} the community`,
        variant: 'destructive',
        duration: 3000,
      })
    },
  })

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const leaveStatus = await leaveCommunity(communityId)
      if (!leaveStatus) throw new Error('Leave failed')
      await onCommunityRoleChanged?.(CommunityUserRole.UNJOINED)
    },
    onError: (error) => {
      console.error('Error leaving community:', error)
    },
  })

  const handleJoinButtonClick = useCallback(
    async (e: any) => {
      e.stopPropagation()
      // embed style isn't standard_wall and user is not logged in than open new tab for community page.
      // Here authUser may come from auto login.
      if (embedStyle !== 'standard_wall' && !authUser) {
        window.open(pathName.community(communitySlug), '_blank')
        return
      }

      if (!authUser) {
        fallbackFunc?.()

        const generatedLink = await joinCommunityDeepLink({
          communityName: communityName ?? '',
          searchParams,
          slug: communitySlug ?? '',
        })

        openModal({
          deepLink: generatedLink,
          subtitle: (
            <>
              Download app to join the <br />
              <span className='font-bold'>@{communityHandle}</span> community.
            </>
          ),
        })
        return
      }

      if (role === CommunityUserRole.UNJOINED) {
        joinMutation.mutate()
      } else {
        leaveMutation.mutate()
      }
    },
    [
      authUser,
      role,
      joinMutation,
      leaveMutation,
      fallbackFunc,
      embedStyle,
      pathName,
    ],
  )

  const isLoading = joinMutation.isPending || leaveMutation.isPending

  if (buttonType === 'pill')
    return (
      <JoinButtonPillUi
        role={role}
        isLoading={isLoading}
        disabled={isLoading}
        onClick={handleJoinButtonClick}
        {...restProps}
      />
    )

  return (
    <JoinButtonUi
      role={role}
      isLoading={isLoading}
      disabled={isLoading}
      onClick={handleJoinButtonClick}
      {...restProps}
    />
  )
}
