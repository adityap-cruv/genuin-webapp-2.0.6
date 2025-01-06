import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { getCurrentShareUrl } from '@lib/utils'
import { ShareIcon } from '@icons/share-icon'
// import { JoinCommunityButton } from '@components/pages/community/join-community-button'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { JoinCommunityButton } from '@/components/common/join-community-button'

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
  role: CommunityUserRoleType
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
          handle={communityHandle}
          id={communityId}
          role={role}
          type={isCommunityPrivate ? 'private' : 'public'}
          isMobile={false}
        />
        <Button
          variant="outline"
          size="custom"
          className="border border-primary p-0.5 hover:border-primary-600"
          onClick={async () =>
            await shareFn({
              shareLink: getCurrentShareUrl({ url: shareUrl }),
              toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
            })
          }>
          <ShareIcon className="h-6 w-6 fill-primary hover:fill-primary-600" />
        </Button>
      </span>
    </motion.div>
  )
}
