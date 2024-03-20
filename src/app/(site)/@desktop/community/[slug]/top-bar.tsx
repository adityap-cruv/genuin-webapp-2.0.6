import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { getCurrentShareUrl, openModal } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { joinCommunity } from '@lib/api/video'

type Props = {
  /**
   * @default true
   */
  defaultOpen?: boolean
  /**
   * @default false
   */
  isOpen: boolean
  communityName: string
  communityProfileImage: string
  communtiyHandle: string
  communityId?: string
  isCommunityJoined?: any
  setIsCommunityJoined?: any
}

export const TopStickyBar = {
  mobile: Mobile,
  desktop: Desktop,
}

export function Desktop({
  defaultOpen = true,
  isOpen = false,
  communityName,
  communityProfileImage,
  communtiyHandle,
  communityId,
  isCommunityJoined,
  setIsCommunityJoined,
  ...props
}: Props) {
  const navAnimationControl = useAnimationControls()
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const { isEmbed, parentUrl } = useGenuinOptions((state) => ({ isEmbed: state.embed, parentUrl: state.parentUrl }))
  const user = useGenuinOptions().user

  useEffect(() => {
    if (defaultOpen || isOpen) {
      open()
    }
    if (!isOpen) {
      close()
    }
  }, [defaultOpen, isOpen])

  function open() {
    void navAnimationControl.start({ translateY: 0, transition: { duration: 0.2, ease: 'linear' } })
  }

  function close() {
    void navAnimationControl.start({ translateY: '-100%', transition: { duration: 0.2, ease: 'linear' } })
  }
  return (
    <motion.div
      animate={navAnimationControl}
      initial={{
        translateY: '-100%',
      }}
      className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-monochrome-9 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar
          imageUrl={communityProfileImage}
          fallbackString={communityName}
          isAvatar={false}
          className="h-8 w-8"
        />
        <p className="text-title-2-demi">{communityName}</p>
      </span>
      <span className="flex items-center gap-x-2">
        <Button
          size="custom"
          className={`${isCommunityJoined && 'border border-primary '}`}
          variant={isCommunityJoined ? 'outline' : 'default'}
          onClick={
            user
              ? async () => {
                  !isCommunityJoined &&
                    (await joinCommunity(
                      false,
                      [communityId],
                      [
                        {
                          user_id: user?.id,
                        },
                      ]
                    ))
                  setIsCommunityJoined((prev: any) => !prev)
                }
              : () => {
                  openModal({
                    title: 'Get the Genuin app',
                    subtitle: (
                      <>
                        Get the app to join the <br />
                        <span className="font-bold">{communityName}</span> community.
                      </>
                    ),
                  })
                }
          }>
          <p className={`px-4 py-1.5 text-body-1-demi ${isCommunityJoined && 'text-primary'}`}>
            {isCommunityJoined ? 'Joined' : 'Join Community'}
          </p>
        </Button>
        <Button
          variant="outline"
          size="custom"
          className="border border-primary p-0.5"
          onClick={async () =>
            await shareFn({
              shareLink: getCurrentShareUrl({ isEmbed, parentUrl }),
              toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
            })
          }>
          <Image src={icShare} alt="share" className="h-7 w-7" />
        </Button>
      </span>
    </motion.div>
  )
}

export function Mobile({
  defaultOpen = true,
  isOpen = false,
  communityName,
  communityProfileImage,
  communtiyHandle,
  ...props
}: Props) {
  const navAnimationControl = useAnimationControls()

  useEffect(() => {
    if (defaultOpen || isOpen) {
      open()
    }
    if (!isOpen) {
      close()
    }
  }, [defaultOpen, isOpen])

  function open() {
    void navAnimationControl.start({ translateY: 0, transition: { duration: 0.2, ease: 'linear' } })
  }

  function close() {
    void navAnimationControl.start({ translateY: '-100%', transition: { duration: 0.2, ease: 'linear' } })
  }
  return (
    <motion.div
      animate={navAnimationControl}
      initial={{
        translateY: '-100%',
      }}
      className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-monochrome-9 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar
          imageUrl={communityProfileImage}
          fallbackString={communityName}
          isAvatar={false}
          className="h-8 w-8"
        />
        <p className="text-title-2-demi">{communityName}</p>
      </span>
    </motion.div>
  )
}
