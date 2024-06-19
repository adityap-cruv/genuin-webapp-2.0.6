import { requestCommunity, joinCommunity, leaveCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useState } from 'react'
import { Button } from '@components/ui/button'
import { openModal } from '@lib/utils'
import { useQueryClient } from '@tanstack/react-query'

type Props = {
  userRole?: 'LEADER' | 'MEMBER' | 'REQUESTED'
  handle: string
  id: string
  isCommunityPrivate: boolean
  isJoinRequested: boolean
  buttonText: string
}

export function JoinCommunityButton({ userRole, handle, id, isCommunityPrivate, isJoinRequested, buttonText }: Props) {
  const queryClient = useQueryClient()
  const [role, setRole] = useState(userRole)
  const user = useGenuinOptions().user

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
          role ? 'text-primary' : 'text-monochrome-white'
        }`}>
        {role ? (role === 'REQUESTED' ? 'Requested' : 'Joined') : buttonText}
      </p>
    </Button>
  )
}
