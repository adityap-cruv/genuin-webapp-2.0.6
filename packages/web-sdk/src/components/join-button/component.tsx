import { useCallback, useState } from 'react'
import { CommunityUserRole } from '../tree-structure/utils'
import { JoinButtonUi, type JoinButtonUiPropsType } from './ui'
import { joinCommunity, leaveCommunity, requestCommunity } from './api'
import { useAuth } from '@/context/auth'
import { useBrandDetails } from '@/context/brand-details'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

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
} & Omit<JoinButtonUiPropsType, 'onClick'>

export function JoinButton({
  communityId,
  role,
  communitySlug,
  isPrivate,
  forEmbed,
  onCommunityRoleChanged,
  fallbackFunc,
  ...restProps
}: JoinButtonPropsType) {
  const { embedStyle } = useBrandDetails()
  const pathName = usePathNameWithSubdomain()
  const [isLoading, setIsLoading] = useState(false)
  const { user: authUser } = useAuth()

  // TODO: How to handle errors here discuss with team.
  const handleJoinCommunity = useCallback(async () => {
    if (!authUser) return false

    try {
      if (isPrivate) {
        const reqStatus = await requestCommunity(communityId)
        if (reqStatus) {
          await onCommunityRoleChanged?.(CommunityUserRole.REQUESTED)
          return true
        }
      } else {
        const joinStatus = await joinCommunity(false, communityId, authUser.id)
        if (joinStatus) {
          await onCommunityRoleChanged?.(CommunityUserRole.MEMBER)
          return true
        }
      }
    } catch (error) {
      console.error('Error joining community:', error)
    }
    return false
  }, [isPrivate, communityId, authUser, onCommunityRoleChanged])

  const handleLeaveCommunity = useCallback(async () => {
    try {
      const leaveStatus = await leaveCommunity(communityId)
      if (leaveStatus) {
        await onCommunityRoleChanged?.(CommunityUserRole.UNJOINED)
        return true
      }
    } catch (error) {
      console.error('Error leaving community:', error)
    }
    return false
  }, [communityId, onCommunityRoleChanged])

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
        return
      }

      setIsLoading(true)
      try {
        if (role === CommunityUserRole.UNJOINED) {
          await handleJoinCommunity()
        } else {
          await handleLeaveCommunity()
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      authUser,
      role,
      handleJoinCommunity,
      handleLeaveCommunity,
      fallbackFunc,
      embedStyle,
      pathName,
    ],
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
