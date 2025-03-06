import Link from 'next/link'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { CustomAvatar } from '@/components/custom/custom-avatar'
import { motion } from 'framer-motion'
import { GroupIcon } from '@icons/group-icon'
import { Linkout } from '../linkout'
import BrandBadgeIcon from '../brand-badge-icon'
import { ReadMore } from '../read-more'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { useEffect, useState } from 'react'

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

const FullScreenVideoDetails = ({
  videos,
  currentIndex,
  isActive,
  isFullScreen,
}: {
  videos: VideoPlayerModalType[]
  currentIndex: number
  isActive: boolean
  isFullScreen: boolean
}) => {
  const [showLinkouts, setShowLinkouts] = useState(false)

  useEffect(() => {
    const currentVideo = videos[currentIndex]
    if (!currentVideo?.video.linkoutId) return
    let timeoutId: NodeJS.Timeout | null = null

    // If video is active, show linkouts after 10 seconds.
    if (isActive) {
      timeoutId = setTimeout(() => {
        setShowLinkouts(true)
      }, 10000)
    } else {
      setShowLinkouts(false)
    }

    // Clear timeout if video is not active.
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isActive, videos, currentIndex])

  const currentVideo = videos[currentIndex]

  return (
    <div className="absolute bottom-4 left-0 flex w-full justify-between px-2">
      <div className="relative z-40 flex w-full flex-col justify-end">
        <div className="overflow-clip">
          <motion.div
            initial={currentVideo?.video.linkoutId ? (showLinkouts ? Animations.hidden : undefined) : undefined}
            animate={
              currentVideo?.video.linkoutId ? (showLinkouts ? Animations.visible : Animations.hidden) : undefined
            }>
            <div className="flex items-center">
              <Link
                className="flex cursor-pointer items-center hover:opacity-60"
                href={{
                  pathname: currentVideo?.owner?.brand?.brand_slug
                    ? PATH_NAME.brand(currentVideo.owner.brand.brand_slug)
                    : PATH_NAME.profile(currentVideo.owner.userName),
                }}>
                <CustomAvatar
                  className="h-9 w-9 bg-red-40"
                  imageUrl={currentVideo?.owner?.profileImage}
                  fallbackString={currentVideo?.owner?.name ?? 'U'}
                  isAvatar={currentVideo?.owner?.isAvatar}
                />
                <p className="line-clamp-1 break-all px-1 text-title-3-bold text-monochrome-white">
                  @{currentVideo?.owner?.userName}
                </p>
              </Link>
              {currentVideo?.owner?.brand && (
                <BrandBadgeIcon
                  userLogoType={currentVideo.owner.brand.brand_user_logo ?? undefined}
                  variant={'light'}
                />
              )}
            </div>
            <motion.div
              initial={currentVideo?.video.linkoutId ? (showLinkouts ? Animations.hidden : undefined) : undefined}
              animate={
                currentVideo?.video.linkoutId ? (showLinkouts ? Animations.fadeIn : Animations.fadeOut) : undefined
              }>
              {currentVideo?.video.linkoutId && (
                <Linkout.mobile
                  linkouts={currentVideo.video.linkouts}
                  linkoutId={currentVideo.video.linkoutId}
                  videoId={currentVideo.video.id}
                />
              )}
            </motion.div>
          </motion.div>
        </div>
        {currentVideo?.video.descriptionArr?.[0] && (
          <div className="py-2">
            <ReadMore.dynamic
              text={currentVideo.video.descriptionArr}
              className="w-full !break-words text-body-1-demi text-monochrome-white"
              maxLines={currentVideo?.video.linkoutId ? 1 : 2}
              shouldAnimate
              showViewMore={false}
              isFullScreen={isFullScreen}
              // isExpanded={false}
              // setIsExpanded={setIsExpanded}
            />
          </div>
        )}
        <div className="hide-scrollbar flex w-full gap-1 overflow-auto py-2">
          <Link
            href={PATH_NAME.community(currentVideo?.community?.slug)}
            className="flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1 pr-2">
            <CustomAvatar
              className="h-6 w-6"
              imageUrl={currentVideo?.community?.profileImage ?? ''}
              fallbackString="U"
              isAvatar={false}
            />
            <p className="whitespace-nowrap break-all text-cap-1-med leading-5 text-monochrome-white">
              {(currentVideo?.community?.name?.length ?? 0) > 24
                ? currentVideo?.community?.name?.slice(0, 24) + '...'
                : currentVideo?.community?.name ?? ''}
            </p>
          </Link>
          <Link
            href={PATH_NAME.loop(currentVideo?.loop?.slug)}
            className="flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1 pr-2">
            <div className="rounded-full bg-monochrome-white/20 p-1">
              <GroupIcon className="h-4 w-4" />
            </div>
            <p className="line-clamp-1 whitespace-nowrap text-cap-1-med leading-5 text-monochrome-white">
              {currentVideo?.loop?.name}
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FullScreenVideoDetails
