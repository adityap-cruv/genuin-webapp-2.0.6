import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import icQuestion from '@icons/icQuestion.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'

type Props = {
  /**
   * @default true
   */
  defaultOpen?: boolean
  /**
   * @default false
   */
  isOpen: boolean
  profileImage: string
  profileName: string
  profileNickname: string
  isAvatar: boolean
}

export const TopStickyBar = {
  mobile: Mobile,
  desktop: Desktop,
}

function Desktop({
  defaultOpen = true,
  isOpen = false,
  profileImage,
  profileName,
  profileNickname,
  isAvatar,
  ...props
}: Props) {
  const navAnimationControl = useAnimationControls()
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()

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
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-monochrome-9 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar imageUrl={profileImage} fallbackString={profileName} isAvatar={isAvatar} className="h-8 w-8" />
        {profileName ? (
          <p className="text-title-2-demi">{profileName}</p>
        ) : (
          <p className="text-title-2-demi">@{profileNickname}</p>
        )}
      </span>
      <Button
        variant="outline"
        size="custom"
        outlineColor="genuin-blue"
        className="my-1"
        onClick={async () =>
          await shareFn({
            shareLink: window.location.href + '?utm_source=app_web',
            toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
          })
        }>
        <span className="flex items-center p-1">
          <Image src={icShare} alt="share" height={24} width={24} />
        </span>
      </Button>
    </motion.div>
  )
}

function Mobile({
  defaultOpen = true,
  isOpen = false,
  profileImage,
  profileName,
  profileNickname,
  isAvatar,
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
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-monochrome-9 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar imageUrl={profileImage} fallbackString={profileName} isAvatar={isAvatar} className="h-8 w-8" />
        {profileName ? (
          <p className="text-title-2-demi">{profileName}</p>
        ) : (
          <p className="text-title-2-demi">@{profileNickname}</p>
        )}
      </span>
    </motion.div>
  )
}
