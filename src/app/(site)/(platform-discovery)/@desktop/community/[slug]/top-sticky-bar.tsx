import { CustomAvatar } from '@components/custom/custom-avatar'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { JoinCommunityButton } from '@components/pages/community/join-community-button'
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
  communityName: string
  communityProfileImage: string
  communityHandle: string
  communityId: string
  shareUrl: string
  role: any
  isCommunityPrivate: boolean
  isJoinRequested: boolean
}

export function TopStickyBar({
  defaultOpen = true,
  isOpen = false,
  communityName,
  communityProfileImage,
  communityHandle,
  communityId,
  shareUrl,
  role,
  isCommunityPrivate,
  isJoinRequested,
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
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-tertiary-200 bg-monochrome-white px-6"
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
        <JoinCommunityButton
          buttonText="Join Community"
          isJoinRequested={isJoinRequested}
          handle={communityHandle}
          id={communityId}
          userRole={role}
          isCommunityPrivate={isCommunityPrivate}
        />
        <ShareButton url={shareUrl} />
      </span>
    </motion.div>
  )
}
