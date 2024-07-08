import { Button } from '@components/ui/button'
import { joinCommunity, leaveCommunity, requestCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { generateDeepLink, openModal } from '@lib/utils'
import { useSearchParams } from 'next/navigation'

export function ToggleCommunityJoinState({
  userRole,
  handle,
  id,
  communityJoinStates,
  setCommunityJoinStates,
  isCommunityPrivate,
  communityName,
}: {
  userRole?: 'LEADER' | 'MEMBER' | null
  handle: string
  id: string
  communityJoinStates: any
  setCommunityJoinStates: any
  isCommunityPrivate: boolean | null
  communityName: string
}) {
  const newState = !communityJoinStates[id]
  const user = useGenuinOptions().user
  const searchParams = Object.fromEntries(useSearchParams())

  async function toggleCommunityJoinState() {
    if (newState) {
      if (isCommunityPrivate) {
        await requestCommunity(id).then((res) => {
          if (res.code === 200) {
            setCommunityJoinStates((prevState: any) => ({
              ...prevState,
              [id]: 'REQUESTED',
            }))
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
            setCommunityJoinStates((prevState: any) => ({
              ...prevState,
              [id]: 'MEMBER',
            }))
          }
        })
      }
    } else {
      await leaveCommunity(id).then((res) => {
        if (res.code === 200) {
          setCommunityJoinStates((prevState: any) => ({
            ...prevState,
            [id]: '',
          }))
        }
      })
    }
  }

  if (userRole === 'LEADER') return

  return (
    <Button
      size="custom"
      className={`${communityJoinStates[id] && 'rounded border border-primary '}`}
      variant={communityJoinStates[id] ? 'outline' : 'default'}
      onClick={
        user
          ? async () => {
              await toggleCommunityJoinState()
            }
          : () => {
              generateDeepLink({
                action: 'join',
                contentType: 'community',
                description: `Find your people. Find what you love. | Join ${communityName} to talk about it`,
                title: `join ${communityName}`,
                previewImage: null,
                fromUserName: null,
                pathName: window.location.pathname,
                utmCampaign: 'share',
                utmMedium: 'web',
                utmSource: window.location.hostname,
                searchParams,
              })
                .then((generatedLink) => {
                  openModal({
                    deepLink: generatedLink,
                  })
                })
                .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
            }
      }>
      <p
        className={`whitespace-nowrap px-4 py-1.5 text-body-1-demi  ${
          communityJoinStates[id] ? 'text-primary' : 'text-monochrome-white'
        }`}>
        {communityJoinStates[id] ? (communityJoinStates[id] === 'REQUESTED' ? 'Requested' : 'Joined') : 'Join'}
      </p>
    </Button>
  )
}
