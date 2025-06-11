import { motion, useAnimationControls, type MotionProps } from 'framer-motion'
import { useEffect } from 'react'
import ShareButton from '@/components/common/actions/share-button'
import SubscriptionButton from '@/components/common/actions/subscription-button'
import { getQueryKeyForLoopDetails } from '@/lib/utils/react-query/keys'
import { useQueryClient } from '@tanstack/react-query'

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
  chatId: string
  isSubscribed: boolean
  slug: string
  ldDescription: string
}

export const TopStickyBar = {
  mobile: Mobile,
  desktop: Desktop,
}

type DesktopProps = Props & React.HTMLAttributes<HTMLDivElement> & MotionProps

function Desktop({
  defaultOpen = true,
  isOpen = false,
  loopName,
  shareUrl,
  communitySlug,
  chatId,
  isSubscribed,
  ldDescription,
  slug,
  ...props
}: DesktopProps) {
  const navAnimationControl = useAnimationControls()
  const queryClient = useQueryClient()

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
      className="border-monochrome-9 bg-monochrome-white sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <p className="text-title-2-demi">{loopName}</p>
      </span>
      <span className="my-2 flex items-center gap-x-3">
        <SubscriptionButton
          isSubscribed={isSubscribed}
          chatId={chatId}
          groupName={loopName}
          ldDescription={ldDescription}
          shareUrl={shareUrl}
          slug={slug}
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: getQueryKeyForLoopDetails(slug),
              type: 'all',
            })
          }}
        />

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

type MobileProps = Props & React.HTMLAttributes<HTMLDivElement> & MotionProps

function Mobile({ defaultOpen = true, isOpen = false, loopName, communitySlug, ...props }: MobileProps) {
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
      className="border-monochrome-9 bg-monochrome-white sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <p className="text-title-2-demi line-clamp-1 break-all" title={loopName}>
          {loopName}
        </p>
      </span>
    </motion.div>
  )
}
