import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { openModal } from '@lib/utils'
import { ShareIcon } from '@icons/share-icon'
import { useGenuinOptions } from '@lib/stores/genuin-options'

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
  toggleSuscription?: () => void
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
  toggleSuscription,
  ...props
}: Props) {
  const navAnimationControl = useAnimationControls()
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
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
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-monochrome-9 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <p className="text-title-2-demi">{loopName}</p>
      </span>
      <span className="my-2 flex items-center gap-x-3">
        <Button
          size="custom"
          className={`${isLoopSubscribed && 'border border-primary '}`}
          variant={isLoopSubscribed ? 'outline' : 'default'}
          onClick={
            user
              ? () => {
                  toggleSuscription?.()
                }
              : () => {
                  openModal({
                    title: 'Get the Genuin app',
                    subtitle: (
                      <>
                        Get the app to subscribe to
                        <span className="font-bold"> {loopName}</span> Loop.
                      </>
                    ),
                  })
                }
          }>
          <p className={`px-4 py-1 text-title-3-demi ${isLoopSubscribed && 'text-primary'}`}>
            {isLoopSubscribed ? 'Subscribed' : 'Subscribe'}
          </p>
        </Button>

        {/* Hidden by requirement. */}
        {/* <Button size="custom" variant="outline" className="border-primary px-4">
                <span className="flex items-center">
                  <Image src={icQuestion} alt="question" />
                  <p className="py-2 text-body-1-demi text-primary">Q&A</p>
                </span>
              </Button> */}

        <Button
          variant="outline"
          size="custom"
          className="border border-primary p-0.5"
          onClick={async () => {
            await shareFn({
              shareLink: shareUrl,
              toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
            })
          }}>
          <ShareIcon className="h-6 w-6 fill-primary" />{' '}
        </Button>
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
