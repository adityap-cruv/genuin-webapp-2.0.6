import { Button } from '@components/ui/button'
import { joinCommunity, leaveCommunity, requestCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { openModal } from '@lib/utils'

export function ToggleCommunityJoinState({
  userRole,
  handle,
  id,
  communityJoinStates,
  setCommunityJoinStates,
  isCommunityPrivate,
}: {
  userRole?: 'LEADER' | 'MEMBER' | null
  handle: string
  id: string
  communityJoinStates: any
  setCommunityJoinStates: any
  isCommunityPrivate: boolean | null
}) {
  const newState = !communityJoinStates[id]
  const user = useGenuinOptions().user
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
              openModal({
                title: 'Get the Genuin app',
                subtitle: (
                  <>
                    Get the app to join the <br />
                    <span className="font-bold">@{handle}</span> community.
                  </>
                ),
              })
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
