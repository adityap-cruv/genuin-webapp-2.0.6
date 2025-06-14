import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { ReadMore } from '@components/common/read-more'
import { type ComponentProps } from 'react'
import { Linkout } from '../../linkout'
import { motion } from 'motion/react'
import BrandBadgeIcon from '@components/common/brand-badge-icon'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { cn } from '@/lib/utils'
import useShowLinkouts from '@/hooks/use-show-linkouts'
import { CommunityPill } from '../../actions/community-pill'
import { GroupPill } from '../../actions/group-pill'
import { useFeedListContext } from '@/components/providers/feed-provider'

// All the animations props are defined here. to use in <Details/> component.
const Animations = {
  hidden: { translateY: 'calc(100% - 40px)' },
  visible: {
    translateY: '0%',
    transition: { duration: 0.5, ease: 'easeIn' },
  },
  fadeIn: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeIn' },
  },
  fadeOut: {
    opacity: 0,
    transition: { duration: 0 },
  },
}

type MobileDetailsProps = {
  videoDetails: VideoPlayerModalType
  isActive: boolean
  isExpanded?: boolean
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>
} & ComponentProps<'div'>

export function MobileDetails({
  videoDetails,
  isActive,
  isExpanded,
  setIsExpanded,
  className,
  style,
  ...restProps
}: MobileDetailsProps) {
  const { showLinkouts } = useShowLinkouts({ isActive, linkoutId: videoDetails.video.linkoutId })
  const { updateCommunityJoinStatus, updateSubscriberStatus } = useFeedListContext()

  const linkoutId = videoDetails.video.linkoutId
  const descriptionArr = videoDetails.video.descriptionArr

  const { owner, community, loop, video } = videoDetails

  return (
    <div className={cn('absolute bottom-0 left-0 flex w-full flex-col justify-between px-2 pb-4')} {...restProps}>
      <motion.div
        className="overflow-clip"
        initial={linkoutId ? (showLinkouts ? Animations.hidden : undefined) : undefined}
        animate={linkoutId ? (showLinkouts ? Animations.visible : Animations.hidden) : undefined}
        style={{ width: 'calc(100% - 50px)' }}>
        <div className="flex items-center">
          <Link
            className="flex cursor-pointer items-center hover:opacity-60"
            href={{
              pathname: owner.brand ? PATH_NAME.brand(owner.brand.brand_slug) : PATH_NAME.profile(owner.userName),
            }}>
            <CustomAvatar
              className="bg-red-40 h-9 w-9"
              imageUrl={owner.profileImage}
              fallbackString={owner.name ?? 'U'}
              isAvatar={owner.isAvatar}
            />
            <p className="text-title-3-bold text-monochrome-white line-clamp-1 px-1 break-all">@{owner.userName}</p>
          </Link>
          {owner.brand && <BrandBadgeIcon userLogoType={owner.brand?.brand_user_logo ?? undefined} variant={'light'} />}
        </div>
        <motion.div
          initial={linkoutId ? (showLinkouts ? Animations.hidden : undefined) : undefined}
          animate={linkoutId ? (showLinkouts ? Animations.fadeIn : Animations.fadeOut) : undefined}>
          {linkoutId && <Linkout.mobile linkouts={video.linkouts} linkoutId={linkoutId} videoId={video.id} />}
        </motion.div>
      </motion.div>
      {descriptionArr && (
        <div className="py-2" style={{ width: 'calc(100% - 50px)' }}>
          <ReadMore.dynamic
            position="overlay"
            text={descriptionArr}
            className="text-body-1-demi text-monochrome-white w-full !break-words"
            maxLines={linkoutId ? 1 : 2}
            shouldAnimate
            showViewMore={false}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </div>
      )}

      <div className="hide-scrollbar z-10 flex w-full gap-1 overflow-auto py-2">
        <CommunityPill
          handle={community.handle}
          id={community.id}
          name={community.name ?? ''}
          shareUrl={community.shareUrl}
          slug={community.slug}
          userRole={community.userRole}
          profileImage={community.profileImage ?? ''}
          type={community.type}
          onStatusChange={(role) => {
            updateCommunityJoinStatus(community.id, role)
          }}
        />

        <GroupPill
          id={loop.id}
          isSubscribed={loop.isSubscribed ?? false}
          name={loop.name ?? ''}
          shareUrl={loop.shareUrl ?? ''}
          slug={loop.slug}
          description={loop.description}
          onSuccess={(isSubscribed) => {
            updateSubscriberStatus(loop?.id, isSubscribed)
            updateCommunityJoinStatus(community.id, 'MEMBER')
          }}
        />
      </div>
    </div>
  )
}
