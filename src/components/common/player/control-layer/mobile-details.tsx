import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { ReadMore } from '@components/common/read-more'
import { type ComponentProps } from 'react'
import { Linkout } from '../../linkout'
import { GroupIcon } from '@icons/group-icon'
import { motion } from 'framer-motion'
import BrandBadgeIcon from '@components/common/brand-badge-icon'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { cn } from '@/lib/utils'
import useShowLinkouts from '@/hooks/use-show-linkouts'

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

  const linkoutId = videoDetails.video.linkoutId
  const descriptionArr = videoDetails.video.descriptionArr

  const { owner, community, loop, video } = videoDetails

  return (
    <>
      <div className="absolute bottom-0 h-24 w-full bg-gradient-to-b from-[#11111100] to-[#111111b3]" />
      <div
        className={cn('absolute bottom-0 left-0 flex w-full flex-col justify-between px-2')}
        style={{ width: 'calc(100% - 50px)', ...style }}
        {...restProps}>
        <motion.div
          className="overflow-clip"
          initial={linkoutId ? (showLinkouts ? Animations.hidden : undefined) : undefined}
          animate={linkoutId ? (showLinkouts ? Animations.visible : Animations.hidden) : undefined}>
          <div className="flex items-center">
            <Link
              className="flex cursor-pointer items-center hover:opacity-60"
              href={{
                pathname: owner.brand ? PATH_NAME.brand(owner.brand.brand_slug) : PATH_NAME.profile(owner.userName),
              }}>
              <CustomAvatar
                className="h-9 w-9 bg-red-40"
                imageUrl={owner.profileImage}
                fallbackString={owner.name ?? 'U'}
                isAvatar={owner.isAvatar}
              />
              <p className="line-clamp-1 break-all px-1 text-title-3-bold text-monochrome-white">@{owner.userName}</p>
            </Link>
            {owner.brand && (
              <BrandBadgeIcon userLogoType={owner.brand?.brand_user_logo ?? undefined} variant={'light'} />
            )}
          </div>
          <motion.div
            initial={linkoutId ? (showLinkouts ? Animations.hidden : undefined) : undefined}
            animate={linkoutId ? (showLinkouts ? Animations.fadeIn : Animations.fadeOut) : undefined}>
            {linkoutId && <Linkout.mobile linkouts={video.linkouts} linkoutId={linkoutId} videoId={video.id} />}
          </motion.div>
        </motion.div>
        {descriptionArr && (
          <div className="py-2">
            <ReadMore.dynamic
              position="overlay"
              text={descriptionArr}
              className="w-full !break-words text-body-1-demi text-monochrome-white"
              maxLines={linkoutId ? 1 : 2}
              shouldAnimate
              showViewMore={false}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </div>
        )}
        <div className="hide-scrollbar flex w-full gap-1 overflow-auto py-2">
          <Link
            href={PATH_NAME.community(community.slug)}
            className="flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1 pr-2">
            <CustomAvatar
              className="h-6 w-6"
              imageUrl={community.profileImage ?? ''}
              fallbackString="U"
              isAvatar={false}
            />
            {community.name && (
              <p className="whitespace-nowrap break-all text-cap-1-med leading-5 text-monochrome-white">
                {community.name.length > 24 ? community.name?.slice(0, 24) + '...' : community.name}
              </p>
            )}
          </Link>
          <Link
            href={PATH_NAME.loop(loop.slug)}
            className="flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1 pr-2">
            <div className="rounded-full bg-monochrome-white/20 p-1">
              <GroupIcon className="h-4 w-4" />
            </div>
            <p className="line-clamp-1 whitespace-nowrap text-cap-1-med leading-5 text-monochrome-white">{loop.name}</p>
          </Link>
        </div>
      </div>
    </>
  )
}
