import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { BellIconOff } from '@icons/bell-icon-off'
import { SubscribedBellIcon } from '@icons/subscribed-bell-icon'
import ShareButton from '@components/common/actions/ShareButton'

type Props = {
  /**
   * @default true
   */
  defaultOpen?: boolean
  /**
   * @default false
   */
  isOpen: boolean
  loopName: string
  shareUrl: string
  communitySlug: string
  chatId?: string
  isLoopSubscribed?: boolean
  handleSubscribeClick?: () => void
}

export const TopStickyBar = {
  mobile: Mobile,
  desktop: Desktop,
}

function Desktop({
  defaultOpen = true,
  isOpen = false,
  loopName,
  shareUrl,
  communitySlug,
  chatId,
  isLoopSubscribed,
  handleSubscribeClick,
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
        <p className="text-title-2-demi">{loopName}</p>
      </span>
      <span className="my-2 flex items-center gap-x-3">
        <Button
          size="custom"
          className="border border-primary p-[3px]"
          variant="outline"
          onClick={handleSubscribeClick}>
          {isLoopSubscribed && (
            <SubscribedBellIcon className="fill-primary stroke-primary"></SubscribedBellIcon>
          )}
          {!isLoopSubscribed && <BellIconOff className="stroke-new-off-white"></BellIconOff>}
        </Button>

        {/* Hidden by requirement. */}
        {/* <Button size="custom" variant="outline" className="border-primary px-4">
                <span className="flex items-center">
                  <Image src={icQuestion} alt="question" />
                  <p className="py-2 text-body-1-demi text-primary">Q&A</p>
                </span>
              </Button> */}

        <ShareButton url={shareUrl} />
      </span>
    </motion.div>
  )
}

function Mobile({ defaultOpen = true, isOpen = false, loopName, communitySlug, ...props }: Props) {
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
        <p className="text-title-2-demi">{loopName}</p>
      </span>
    </motion.div>
  )
}
