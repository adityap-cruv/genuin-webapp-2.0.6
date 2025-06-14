import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { usePlayerControlStore } from '../player-control-store'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Actions } from './actions'
import { ReadMore } from '@components/common/read-more'
import { cn } from '@lib/utils'
import { type DescriptionArrType } from '@lib/schemas/player/video'
import { Scrubber } from './scrubber'
import { memo, useCallback } from 'react'
import { Linkout } from '../../linkout'
import { useShallow } from 'zustand/react/shallow'
import { type LinkoutsType } from '../../linkout/schema'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { PauseIcon } from '@icons/player-controls/pause-icon'
import { GroupIcon } from '@icons/group-icon'
import { motion } from 'motion/react'
import BrandBadgeIcon from '@components/common/brand-badge-icon'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { handleTapBehavior, PlayingState } from './playing-state'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { AnimatedMuteButton } from './mute-button'
import useShowLinkouts from '@/hooks/use-show-linkouts'

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
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>
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
  const config = useGenuinOptions(useShallow((state) => state.config))
  const { renderIn, shouldShowIHeartDemo, isIHeartPlaying } = useIHeartDemoStates()
  const showIHeartDemo = renderIn === 'root' && shouldShowIHeartDemo

  const handleScreenClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      const tapBehavior = config.web_configs?.tap_behavior ?? 3 // Default to 3 if not configured
      handleTapBehavior({
        tapBehavior,
        muted,
        shouldPlay,
        toggleMuted,
        setShouldPlay,
        videoId: props.videoId,
      })
    },
    [shouldPlay, muted, setShouldPlay, toggleMuted, config.web_configs?.tap_behavior, props.videoId]
  )

  const openClickableUrl = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (clickableUrl) window.open(clickableUrl, '_blank')
    },
    [clickableUrl]
  )

  const handlePlayPause = useCallback(
    (e: any) => {
      e.stopPropagation()
      setShouldPlay(!shouldPlay)
    },
    [shouldPlay, setShouldPlay]
  )

  return (
    <div className="relative h-full w-full">
      <PlayingState />
      <div
        onClick={clickableUrl ? openClickableUrl : handleScreenClick}
        className={cn('absolute inset-0', clickableUrl && 'cursor-pointer')}>
        <div className="item-center relative top-20 left-4 flex w-fit gap-2">
          {clickableUrl && (
            <span
              onClick={handlePlayPause}
              className="bg-monochrome-black/40 flex h-10 w-10 items-center justify-center rounded-full">
              {!shouldPlay ? <PlayIcon variant="light" /> : <PauseIcon variant="light" />}
            </span>
          )}
          <span onClick={clickableUrl ? handleScreenClick : undefined} className="h-fit w-fit cursor-pointer">
            <AnimatedMuteButton shouldAnimate videoId={props.videoId} />
          </span>
        </div>
      </div>
      {!isIHeartPlaying && showIHeartDemo && !muted && (
        <img
          src="https://media.begenuin.com/iheart_demo/equalizer.gif"
          alt="gif"
          className="absolute top-20 right-4 z-10 h-12 w-12"
        />
      )}
      <div className="absolute top-20 right-2 z-20 h-fit w-fit cursor-pointer">
        <WalletAmountBadge type="light" />
      </div>
      <Details {...props} clickableUrl={clickableUrl} />
      <Scrubber spriteUrl="" />
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
  const { showLinkouts } = useShowLinkouts({ isActive, linkoutId })

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
                  className="bg-red-40 h-9 w-9"
                  imageUrl={owner.profileImage}
                  fallbackString={owner.name ?? 'U'}
                  isAvatar={owner.isAvatar}
                />
                <p className="text-title-3-bold text-monochrome-white line-clamp-1 px-1 break-all">@{owner.userName}</p>
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
        {descriptionArr && (
          <div className="py-2">
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
        <div className="hide-scrollbar flex w-full gap-1 overflow-auto py-2">
          <Link
            href={PATH_NAME.community(communitySlug)}
            className="bg-monochrome-black/40 flex items-center gap-1 rounded-full p-1 pr-2">
            <CustomAvatar className="h-6 w-6" imageUrl={communityImage ?? ''} fallbackString="U" isAvatar={false} />
            <p className="text-cap-1-med text-monochrome-white leading-5 break-all whitespace-nowrap">
              {communityName.length > 24 ? communityName.slice(0, 24) + '...' : communityName}
            </p>
          </Link>
          <Link
            href={PATH_NAME.loop(loopSlug)}
            className="bg-monochrome-black/40 flex items-center gap-1 rounded-full p-1 pr-2">
            <div className="bg-monochrome-white/20 rounded-full p-1">
              <GroupIcon className="h-4 w-4" />
            </div>
            <p className="text-cap-1-med text-monochrome-white line-clamp-1 leading-5 whitespace-nowrap">{loopName}</p>
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
