import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { usePlayerControlStore } from '../player-control-store'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Actions } from './actions'
import { ReadMore } from '@components/common/read-more'
import { cn } from '@lib/utils'
import { AnimatedMuteIcon } from './animated-mute-icon'
import { type DescriptionArrType } from '@lib/schemas/player/video'
import Analytics from '@services/analytics'
import { PlayerProgressBar } from './player-progress-bar'
import { memo, useEffect, useState, useCallback } from 'react'
import { Linkout } from '../../linkout'
import { useShallow } from 'zustand/react/shallow'
import { type LinkoutsType } from '../../linkout/schema'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { PauseIcon } from '@icons/player-controls/pause-icon'
import { GroupIcon } from '@icons/group-icon'
import { motion } from 'framer-motion'
import BrandBadgeIcon from '@components/common/brand-badge-icon'

type MobileProps = {
  isActive: boolean
  sparkCount: number
  videoId: string
  shareUrl: string
  videoSlug?: string
  linkoutId?: number | null
  attachedLink?: string | null
  descriptionArr?: DescriptionArrType | null
  descriptionText?: string | null
  commentCount: number
  slug: string
  isSparked?: boolean | null | undefined
  owner: {
    userName: string
    profileImage: string
    isAvatar: boolean
    name?: string | null
    brand?: {
      brand_id: number
      brand_slug: string
      brand_user_logo: number
    } | null
  }
  clickableUrl: string | null
  linkouts?: LinkoutsType
  communityName: string
  communitySlug: string
  communityImage: string
  loopName: string
  loopSlug: string
  isExpanded?: boolean
  setIsExpanded?: (showMore: boolean) => void
}

export const Mobile = memo(function Mobile({ clickableUrl, ...props }: MobileProps) {
  const { toggleMuted, muted, shouldPlay, setShouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      toggleMuted: state.toggleMuted,
      muted: state.muted,
      shouldPlay: state.shouldPlay,
      setShouldPlay: state.setShouldPlay,
    }))
  )

  function handleToggleMuted(e: any) {
    e.stopPropagation()
    toggleMuted()
    void Analytics.track({
      eventName: 'Unmute',
      properties: { video_id: props.videoId },
    })
  }

  function openClickableUrl(e: any) {
    e.stopPropagation()
    if (clickableUrl) window.open(clickableUrl, '_blank')
  }

  const handlePlayPause = useCallback(
    (e: any) => {
      e.stopPropagation()
      setShouldPlay(!shouldPlay)
    },
    [shouldPlay]
  )

  return (
    <div className="relative h-full w-full">
      {/* <div
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-monochrome-black/40 p-2 transition-all duration-300 ',
          !shouldPlay ? 'scale-125 opacity-100 ease-in' : 'scale-100 opacity-0 ease-out'
        )}>
        <Image
          src={icPlay}
          alt="volume-control"
          className={cn('pointer-events-none z-10 cursor-pointer rounded-full')}
        />
      </div> */}
      {(muted || !!clickableUrl) && (
        <div
          onClick={clickableUrl ? openClickableUrl : handleToggleMuted}
          className={cn('absolute inset-0', clickableUrl && 'cursor-pointer')}>
          <div className="relative left-6 top-20 flex w-fit gap-2">
            {clickableUrl && (
              <span onClick={handlePlayPause} className="rounded-lg bg-monochrome-white p-2">
                {!shouldPlay ? <PlayIcon className="stroke-secondary" /> : <PauseIcon className="stroke-secondary" />}
              </span>
            )}
            {muted && (
              <span onClick={clickableUrl ? handleToggleMuted : undefined} className="h-fit w-fit cursor-pointer">
                <AnimatedMuteIcon />
              </span>
            )}
          </div>
        </div>
      )}
      <span className="absolute right-2 top-20 z-20 h-fit w-fit cursor-pointer">
        <WalletAmountBadge type="light" />
      </span>

      <Details {...props} clickableUrl={clickableUrl} />
      <PlayerProgressBar />
    </div>
  )
})

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

function Details({
  shareUrl,
  sparkCount,
  commentCount,
  slug,
  videoId,
  attachedLink,
  descriptionArr,
  descriptionText,
  owner,
  isActive,
  linkoutId,
  isSparked,
  linkouts,
  isExpanded,
  communityImage,
  communityName,
  communitySlug,
  loopName,
  loopSlug,
  setIsExpanded,
}: MobileProps) {
  const [showLinkouts, setShowLinkouts] = useState(false)

  // // This logic is to show linkouts after 10 second of video play.
  // useEffect(() => {
  //   if (!linkoutId) return
  //   let timeoutId: NodeJS.Timeout | null = null

  //   // If video is active, show linkouts after 10 seconds.
  //   if (isActive) {
  //     timeoutId = setTimeout(() => {
  //       setShowLinkouts(true)
  //     }, 10000)
  //   }

  //   // Clear timeout if video is not active.
  //   return () => {
  //     if (timeoutId) {
  //       clearTimeout(timeoutId)
  //       timeoutId = null
  //     }
  //     setShowLinkouts(false)
  //   }
  // }, [isActive])

  // This logic is to show linkouts after 10 second of video play.
  useEffect(() => {
    if (!linkoutId) return
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
  }, [isActive, linkoutId])

  return (
    <div className="absolute bottom-4 left-0 flex w-full justify-between px-2">
      <div className="relative z-10 flex w-[85%] flex-col justify-end">
        <div className="overflow-clip">
          <motion.div
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
              {owner.brand && <BrandBadgeIcon userLogoType={owner.brand?.brand_user_logo} variant={'light'} />}
            </div>
            <motion.div
              initial={linkoutId ? (showLinkouts ? Animations.hidden : undefined) : undefined}
              animate={linkoutId ? (showLinkouts ? Animations.fadeIn : Animations.fadeOut) : undefined}>
              {linkoutId && <Linkout.mobile linkouts={linkouts} linkoutId={linkoutId} videoId={videoId} />}
            </motion.div>
          </motion.div>
        </div>
        {descriptionArr?.[0] && (
          <div className="py-2">
            <ReadMore.dynamic
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
            href={PATH_NAME.community(communitySlug)}
            className="flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1 pr-2">
            <CustomAvatar className="h-6 w-6" imageUrl={communityImage ?? ''} fallbackString="U" isAvatar={false} />
            <p className="whitespace-nowrap break-all text-cap-1-med leading-5 text-monochrome-white">
              {communityName.length > 24 ? communityName.slice(0, 24) + '...' : communityName}
            </p>
          </Link>
          <Link
            href={PATH_NAME.loop(loopSlug)}
            className="flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1 pr-2">
            <div className="rounded-full bg-monochrome-white/20 p-1">
              <GroupIcon className="h-4 w-4" />
            </div>
            <p className="line-clamp-1 whitespace-nowrap text-cap-1-med leading-5 text-monochrome-white">{loopName}</p>
          </Link>
        </div>
      </div>
      <div className="z-10 flex items-end justify-center">
        <Actions.mobile
          commentCount={commentCount}
          shareUrl={shareUrl}
          sparkCount={sparkCount}
          videoId={videoId}
          videoSlug={slug}
          attachedLink={attachedLink}
          description={descriptionText}
          isSparked={isSparked}
        />
      </div>
    </div>
  )
}
