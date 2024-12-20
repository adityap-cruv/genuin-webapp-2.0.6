import { requestCommunity, joinCommunity, leaveCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import { cn, openModal } from '@lib/utils'
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
  onStatusChange?: (role: CommunityUserRoleType) => void
}

// TODO: Rename this component to JoinCommunityButton after the migration is done
export const JoinCommunityButton = memo(function UpdatedJoinCommunityButton({
  role,
  handle,
  id,
  buttonText,
  type,
  communityName,
  onStatusChange,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const pathName = usePathname()
  const queryClient = useQueryClient()
  const user = useGenuinOptions().user
  const searchParams = useSearchParams()

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
      onStatusChange?.('UNJOINED')
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

  // If user comes on his/her own profile or brand page, then don't show the join button.
  if (pathName === PATH_NAME.profile(user?.nickname) || pathName === PATH_NAME.brand(handle)) return null

  if (role === 'LEADER' || role === 'MODERATOR') return

  if (role === 'REQUESTED')
    return (
      <Button size="custom" className="border border-primary" variant="outline">
        <p className="px-4 py-1.5 text-body-1-demi text-primary">Requested</p>
      </Button>
    )
  // According to design we have to go with text-monochrome-white and stroke, as we can't use primary, secondary or tertiary colors
  return (
    <Button
      size="custom"
      className="rounded border border-primary px-4 py-1.5"
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

// ----------------------------------------------------------------
// Old code
// ----------------------------------------------------------------
// import { requestCommunity, joinCommunity, leaveCommunity } from '@lib/api/video'
// import { useGenuinOptions } from '@lib/stores/genuin-options'
// import { useEffect, useState } from 'react'
// import { Button } from '@components/ui/button'
// import { openModal } from '@lib/utils'
// import { useQueryClient } from '@tanstack/react-query'
// import { useSearchParams } from 'next/navigation'
// import { joinCommunityDeepLink } from '@/lib/get-deeplink'
// import { type CommunityUserRoleType } from '@/lib/schemas/roles'

// type Props = {
//   handle: string
//   id: string
//   isCommunityPrivate: boolean
//   buttonText: string
//   userRole?: CommunityUserRoleType
//   onStatusChange?: (role?: CommunityUserRoleType) => void
//   communityName?: string
// }

// // TODO: Remove this component after the migration(to UpdatedJoinCommunityButton) is done
// export function JoinCommunityButton({
//   userRole,
//   handle,
//   id,
//   isCommunityPrivate,
//   buttonText,
//   communityName,
//   onStatusChange,
// }: Props) {
//   const queryClient = useQueryClient()
//   const [role, setRole] = useState(userRole)
//   const user = useGenuinOptions().user
//   const searchParams = useSearchParams()

//   useEffect(() => {
//     onStatusChange?.(userRole)
//   }, [userRole])

//   async function toggleCommunityJoinState() {
//     try {
//       if (role !== 'MEMBER') {
//         if (isCommunityPrivate) {
//           await requestCommunity(id).then((res) => {
//             if (res.code === 200) {
//               setRole('REQUESTED')
//             }
//           })
//         } else {
//           await joinCommunity(
//             false,
//             [id],
//             [
//               {
//                 user_id: user?.id,
//               },
//             ]
//           ).then((res) => {
//             if (res.code === 200) {
//               setRole('MEMBER')
//             }
//           })
//         }
//       } else {
//         await leaveCommunity(id).then((res) => {
//           if (res.code === 200) {
//             setRole(undefined)
//           }
//         })
//       }
//     } finally {
//       void queryClient.invalidateQueries({ queryKey: ['community', 'details'], type: 'all' })
//     }
//   }

//   if (userRole === 'LEADER' || userRole === 'MODERATOR') return

//   if (userRole === 'REQUESTED')
//     return (
//       <Button size="custom" className="border border-primary" variant={'outline'}>
//         <p className={`px-4 py-1.5 text-body-1-demi text-monochrome-white text-primary`}>Requested</p>
//       </Button>
//     )

//   return (
//     <Button
//       size="custom"
//       className={`${role && 'rounded border border-primary '}`}
//       variant={role ? 'outline' : 'default'}
//       onClick={
//         user
//           ? toggleCommunityJoinState
//           : async () => {
//               await joinCommunityDeepLink({
//                 communityName: communityName ?? '',
//                 searchParams: Object.fromEntries(searchParams),
//               }).then((generatedLink) => {
//                 openModal({
//                   deepLink: generatedLink,
//                   subtitle: (
//                     <>
//                       Get the app to join the <br />
//                       <span className="font-bold">@{handle}</span> community.
//                     </>
//                   ),
//                 })
//               })
//             }
//       }>
//       <p
//         className={`whitespace-nowrap px-4 py-1.5 text-body-1-demi  ${
//           role ? 'text-primary' : 'text-monochrome-white'
//         }`}>
//         {role ? (role === 'REQUESTED' ? 'Requested' : 'Joined') : buttonText}
//       </p>
//     </Button>
//   )
// }
