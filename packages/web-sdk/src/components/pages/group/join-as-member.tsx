import { ModalShell } from '@/components/authentication/modal-shell'
import { joinGroupDeepLink } from '@/components/download-app/get-deeplink'
import { CloseIcon } from '@/components/icons/close-icon'
import { Loader } from '@/components/loader'
import { GroupUserStatusType } from '@/components/tree-structure'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@/context/auth'
import { cn } from '@/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ButtonHTMLAttributes, memo, useCallback, useState } from 'react'
import { useSearchParams } from 'wouter'
import { joinGroupAsMember, leaveGroupAsMember } from './api'
import { useModalHandler } from '@/hooks/useModalHandler'
import {
  getQueryKeyForLoopDetails,
  getQueryKeyForLoopMembers,
} from '@/utils/constants/keys'

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
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const { openModal } = useModalHandler()

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
            queryKey: getQueryKeyForLoopMembers(slug),
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
      name: groupName,
      shareUrl,
      searchParams,
    })
    openModal({
      deepLink: generatedLink,
      subtitle: (
        <>
          Get the app to Join as Member to
          <span className='font-bold'> {groupName}</span> Group.
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

  if (joinStatus === 'REQUESTED')
    return (
      <Button
        size='custom'
        className='h-[32px] border-solid border border-primary'
        variant='outline'>
        <p className='px-4 text-center text-body-1-demi text-primary'>
          Requested
        </p>
      </Button>
    )

  return (
    <>
      <Button
        size='custom'
        className='h-[32px] rounded border-solid border-primary px-4 text-center'
        variant={joinStatus === 'JOINED' ? 'outline' : 'default'}
        onClick={handleButtonClick}
        {...buttonProps}>
        {isJoining ? (
          <Loader
            className={cn(
              joinStatus === 'JOINED' ? 'stroke-primary' : 'stroke-white',
            )}
          />
        ) : (
          <p
            className={cn(
              'whitespace-nowrap text-body-1-demi',
              joinStatus === 'JOINED' ? 'text-primary' : 'text-white',
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

function LeaveGroupModal({
  open,
  onClose,
  chatId,
  slug,
}: LeaveGroupModalProps) {
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
            queryKey: getQueryKeyForLoopMembers(slug),
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
        className='rounded-t-lg !p-8'>
        <DialogClose className='absolute right-4 top-4 outline-none'>
          <CloseIcon onClick={onClose} />
        </DialogClose>
        <ModalShell>
          <div className='flex flex-col items-center gap-4 text-center'>
            <p className='text-title-1-bold sm:text-heading-3'>
              Leave this Group?
            </p>
            <p className='text-cap-1-med sm:text-title-3-med'>
              You won't be able to add any more posts to this Group
              conversation.
            </p>
            <Button
              variant='default'
              onClick={() => {
                leaveMutate()
              }}
              disabled={isLeaving}
              className='w-full text-body-1-demi text-white sm:text-title-3-demi'>
              {isLeaving ? <Loader className='stroke-white' /> : 'Continue'}
            </Button>
          </div>
        </ModalShell>
      </DialogContent>
    </Dialog>
  )
}
