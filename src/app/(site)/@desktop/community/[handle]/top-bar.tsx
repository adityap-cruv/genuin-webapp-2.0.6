import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'

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
}

export function TopBar({
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
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-monochrome-9 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar
          imageUrl={communityProfileImage}
          fallbackString={communityName}
          isAvatar={false}
          className="h-8 w-8"
        />
        <p className="text-title-lg font-semibold">{communityName}</p>
      </span>
      <span className="flex gap-x-2">
        <Button size="custom">
          <p className="px-4 py-2 text-body-sm">Join Community</p>
        </Button>
        <Button variant="outline" size="custom" className="border-2 border-primary p-0.5">
          <Image src={icShare} alt="share" className="h-6 w-6" />
        </Button>
      </span>
    </motion.div>
  )
}
