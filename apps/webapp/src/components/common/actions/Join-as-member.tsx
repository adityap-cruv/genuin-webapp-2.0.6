import { Button } from '@components/ui/button'
import { cn, openModal } from '@lib/utils'
import { Loader } from '@/components/ui/loader'
import { memo, useCallback, useState } from 'react'
import { type GroupUserStatusType } from '@/lib/schemas/roles'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useSearchParams } from 'next/navigation'
import { joinGroupDeepLink } from '@/lib/get-deeplink'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { CloseIcon } from '@icons/close-icon'
import { ModalShell } from '../modals/authentication/modal-shell'
import { joinGroupAsMember, leaveGroupAsMember } from '@/lib/api/loop'
import { getQueryKeyForGroupMembers, getQueryKeyForLoopDetails } from '@/lib/utils/react-query/keys'
import type { ButtonHTMLAttributes } from 'react'

type Props = {
  joinStatus: GroupUserStatusType
  chatId: string
  ldDescription: string
  groupName: string
  shareUrl: string
  slug: string
  onJoinSuccess?: () => void
} & ButtonHTMLAttributes<HTMLButtonElement>

export const JoinAsMemberButton = memo(function JoinAsMemberButton({
  joinStatus,
  chatId,
  ldDescription,
  groupName,
  shareUrl,
  slug,
  onJoinSuccess,
  ...buttonProps
}: Props) {
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useGenuinOptions((state) => ({ user: state.user }))
  const searchParams = Object.fromEntries(useSearchParams())

  const { mutate: joinMutate, isPending: isJoining } = useMutation({
    mutationFn: async () => await joinGroupAsMember(chatId),
    onSuccess: async (res) => {
      if (res.code === 200) {
        onJoinSuccess?.()
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getQueryKeyForLoopDetails(slug),
            type: 'all',
          }),
          queryClient.invalidateQueries({
            queryKey: getQueryKeyForGroupMembers(slug),
            type: 'all',
          }),
        ])
      }
    },
    onError: (error) => {
      console.error('Join group error:', error)
    },
  })

  const joinGroupDeepLinkHandler = useCallback(async () => {
    const generatedLink = await joinGroupDeepLink({
      ldDescription,
      groupName,
      shareUrl,
      searchParams,
    })
    openModal({
      deepLink: generatedLink,
      subtitle: (
        <>
          Get the app to Join as Member to
          <span className="font-bold"> {groupName}</span> Group.
        </>
      ),
    })
  }, [ldDescription, groupName, shareUrl, searchParams])

  const handleButtonClick = useCallback(() => {
    if (joinStatus === 'JOINED') {
      setShowLeaveModal(true)
    } else {
      if (user) {
        joinMutate()
      } else {
        void joinGroupDeepLinkHandler()
      }
    }
  }, [joinStatus, user, joinMutate, joinGroupDeepLinkHandler])

  if (joinStatus === 'REQUESTED') {
    return (
      <Button size="custom" className="border-primary h-[32px] border" variant="outline" {...buttonProps}>
        <p className="text-body-1-demi text-primary px-4 text-center">Requested</p>
      </Button>
    )
  }

  return (
    <>
      <Button
        size="custom"
        className="border-primary h-[32px] rounded border px-4 text-center"
        variant={joinStatus === 'JOINED' ? 'outline' : 'default'}
        onClick={handleButtonClick}
        {...buttonProps}>
        {isJoining ? (
          <Loader size="xs" className={cn(joinStatus === 'JOINED' ? 'stroke-primary' : 'stroke-monochrome-white')} />
        ) : (
          <p
            className={cn(
              'text-body-1-demi whitespace-nowrap',
              joinStatus === 'JOINED' ? 'text-primary' : 'text-monochrome-white'
            )}>
            {joinStatus === 'JOINED' ? 'Joined' : 'Join as Member'}
          </p>
        )}
      </Button>

      <LeaveGroupModal
        open={showLeaveModal}
        onClose={() => {
          setShowLeaveModal(false)
        }}
        chatId={chatId}
        slug={slug}
      />
    </>
  )
})

type LeaveGroupModalProps = {
  open: boolean
  onClose: () => void
  chatId: string
  slug: string
}

function LeaveGroupModal({ open, onClose, chatId, slug }: LeaveGroupModalProps) {
  const queryClient = useQueryClient()

  const { mutate: leaveMutate, isPending: isLeaving } = useMutation({
    mutationFn: async () => await leaveGroupAsMember(chatId),
    onSuccess: async (res) => {
      if (res.code === 200) {
        onClose()
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getQueryKeyForLoopDetails(slug),
            type: 'all',
          }),
          queryClient.invalidateQueries({
            queryKey: getQueryKeyForGroupMembers(slug),
            type: 'all',
          }),
        ])
      }
    },
    onError: (err) => {
      console.error('Leave group error:', err)
    },
  })

  return (
    <Dialog open={open}>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className="rounded-t-lg !p-8">
        <DialogClose className="absolute top-4 right-4 outline-none">
          <CloseIcon onClick={onClose} />
        </DialogClose>
        <ModalShell>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-title-1-bold sm:text-heading-3">Leave this Group?</p>
            <p className="text-cap-1-med sm:text-title-3-med">
              You won't be able to add any more posts to this Group conversation.
            </p>
            <Button
              variant="default"
              onClick={() => {
                leaveMutate()
              }}
              disabled={isLeaving}
              className="text-body-1-demi text-monochrome-white sm:text-title-3-demi w-full">
              {isLeaving ? <Loader size="sm" className="stroke-monochrome-white" /> : 'Continue'}
            </Button>
          </div>
        </ModalShell>
      </DialogContent>
    </Dialog>
  )
}
