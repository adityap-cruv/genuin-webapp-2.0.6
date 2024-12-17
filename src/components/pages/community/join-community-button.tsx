import { requestCommunity, joinCommunity, leaveCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useEffect, useState } from 'react'
import { Button } from '@components/ui/button'
import { openModal } from '@lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { joinCommunityDeepLink } from '@/lib/get-deeplink'

type UserRoleType = 'LEADER' | 'MEMBER' | 'REQUESTED' | null

type Props = {
  handle: string
  id: string
  isCommunityPrivate: boolean
  isJoinRequested: boolean
  buttonText: string
  userRole?: UserRoleType
  onStatusChange?: (role?: UserRoleType) => void
  communityName?: string
}

// TODO: Remove this component after the migration(to UpdatedJoinCommunityButton) is done
export function JoinCommunityButton({
  userRole,
  handle,
  id,
  isCommunityPrivate,
  isJoinRequested,
  buttonText,
  communityName,
  onStatusChange,
}: Props) {
  const queryClient = useQueryClient()
  const [role, setRole] = useState(userRole)
  const user = useGenuinOptions().user
  const searchParams = useSearchParams()

  useEffect(() => {
    onStatusChange?.(userRole)
  }, [userRole])

  async function toggleCommunityJoinState() {
    try {
      if (role !== 'MEMBER') {
        if (isCommunityPrivate) {
          await requestCommunity(id).then((res) => {
            if (res.code === 200) {
              setRole('REQUESTED')
            }
          })
        } else {
          await joinCommunity(
            false,
            [id],
            [
              {
                user_id: user?.id,
              },
            ]
          ).then((res) => {
            if (res.code === 200) {
              setRole('MEMBER')
            }
          })
        }
      } else {
        await leaveCommunity(id).then((res) => {
          if (res.code === 200) {
            setRole(undefined)
          }
        })
      }
    } finally {
      void queryClient.invalidateQueries({ queryKey: ['community', 'details'], type: 'all' })
    }
  }

  if (isJoinRequested)
    return (
      <Button size="custom" className="border border-primary" variant={'outline'}>
        <p className={`px-4 py-1.5 text-body-1-demi text-monochrome-white text-primary`}>Requested</p>
      </Button>
    )

  if (userRole === 'LEADER') return

  return (
    <Button
      size="custom"
      className={`${role && 'rounded border border-primary '}`}
      variant={role ? 'outline' : 'default'}
      onClick={
        user
          ? toggleCommunityJoinState
          : async () => {
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
            }
      }>
      <p
        className={`whitespace-nowrap px-4 py-1.5 text-body-1-demi  ${
          role ? 'text-primary' : 'text-monochrome-white'
        }`}>
        {role ? (role === 'REQUESTED' ? 'Requested' : 'Joined') : buttonText}
      </p>
    </Button>
  )
}
