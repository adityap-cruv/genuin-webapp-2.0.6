import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import ShareButton from '@/components/common/actions/share-button'
import SubscriptionButton from '@/components/common/actions/subscription-button'
import { getQueryKeyForLoopDetails } from '@/lib/utils/react-query/keys'
import { useQueryClient } from '@tanstack/react-query'
import { mapMemberJoinStatus } from '@/lib/utils'
import { JoinAsMemberButton } from './actions/Join-as-member'

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
  loggedInUserStatus: number
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
  isSubscribed,
  ldDescription,
  slug,
  loggedInUserStatus,
  ...props
}: Props) {
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
      {...props}>
      <div className="border-monochrome-9 bg-monochrome-white sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b px-6">
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

          <JoinAsMemberButton
            joinStatus={mapMemberJoinStatus(loggedInUserStatus)}
            chatId={chatId}
            groupName={loopName ?? ''}
            ldDescription={ldDescription}
            shareUrl={shareUrl}
            slug={slug}
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
      </div>
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
      {...props}>
      <div className="border-monochrome-9 bg-monochrome-white sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b px-6">
        <span className="flex items-center gap-x-2">
          <p className="text-title-2-demi line-clamp-1 break-all" title={loopName}>
            {loopName}
          </p>
        </span>
      </div>
    </motion.div>
  )
}
