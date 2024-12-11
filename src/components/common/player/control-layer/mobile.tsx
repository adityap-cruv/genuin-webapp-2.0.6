import Link from 'next/link'
import Image from 'next/image'
import { PATH_NAME } from '@lib/utils/constants/path'
import { usePlayerControlStore } from '../player-control-store'
import icPlay from '@icons/player-controls/icPlay.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Actions } from './actions'
import { ReadMore } from '@components/common/read-more'
import { cn } from '@lib/utils'
import { AnimatedMuteIcon } from './animated-mute-icon'
import { TickIcon } from '@icons/tick-icon'
import { type DescriptionArrType } from '@lib/schemas/player/video'
import Analytics from '@services/analytics'
import { PlayerProgressBar } from './player-progress-bar'
import { memo, useEffect, useId, useState, useCallback } from 'react'
import { Linkout } from '../../linkout'
import { useShallow } from 'zustand/react/shallow'
import { type LinkoutsType } from '../../linkout/schema'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { PauseIcon } from '@icons/player-controls/pause-icon'

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
    } | null
  }
  clickableUrl: string | null
  linkouts?: LinkoutsType
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
      <div
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-monochrome-black/40 p-2 transition-all duration-300 ',
          !shouldPlay ? 'scale-125 opacity-100 ease-in' : 'scale-100 opacity-0 ease-out'
        )}>
        <Image
          src={icPlay}
          alt="volume-control"
          className={cn('pointer-events-none z-10 cursor-pointer rounded-full')}
        />
      </div>
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

// TODO: move Linkouts component to infinity view box component.
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
  setIsExpanded,
}: MobileProps) {
  const [isVisible, setIsVisible] = useState(false)
  const detailsId = useId()

  useEffect(() => {
    if (!linkoutId) return
    let timeoutId: any
    const detailsElement = document.getElementById(detailsId)
    if (isActive) {
      timeoutId = setTimeout(() => {
        setIsVisible(true)
        if (detailsElement) {
          detailsElement.style.setProperty('transform', 'translate(0px, 50px)')
        }
      }, 2900)
    }
    return () => {
      if (timeoutId) {
        const element = document.getElementById(detailsId)
        if (element) {
          element.style.setProperty('transform', 'translate(0px, 0px)')
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }
      setIsVisible(false)
    }
  }, [isActive, linkouts])

  return (
    <div className={cn('absolute bottom-16 left-0 flex w-full justify-between px-2 transition-all')}>
      <div id={detailsId} className="relative z-10 flex w-[85%] flex-col justify-end">
        <div
          className="z-10 mb-2 flex items-center"
          onClick={(e) => {
            e.stopPropagation()
          }}>
          {owner.brand ? (
            <div className="flex items-center">
              <Link
                className="flex cursor-pointer items-center hover:opacity-60"
                href={{ pathname: PATH_NAME.brand(owner.brand.brand_slug) }}>
                <CustomAvatar
                  className="bg-red-40"
                  imageUrl={owner.profileImage}
                  fallbackString={owner.name ?? 'U'}
                  isAvatar={owner.isAvatar}
                />
                <p className="line-clamp-1 px-2 text-title-3-bold text-monochrome-white">@{owner.userName}</p>
              </Link>
              <span className="flex items-center gap-0.5">
                <TickIcon className="h-3 w-3 fill-primary" />
                <p className="text-cap-2-demi text-primary">Brand</p>
              </span>
            </div>
          ) : (
            <Link
              className="flex cursor-pointer items-center hover:opacity-60"
              href={{ pathname: PATH_NAME.profile(owner.userName) }}>
              <CustomAvatar
                className="bg-red-40"
                imageUrl={owner.profileImage}
                fallbackString={owner.name ?? 'U'}
                isAvatar={owner.isAvatar}
              />
              <p className="line-clamp-1 px-2 text-title-3-bold text-monochrome-white">@{owner.userName}</p>
            </Link>
          )}
        </div>
        {descriptionArr?.[0] && (
          <span className="z-10 py-2">
            <ReadMore.dynamic
              text={descriptionArr}
              className="w-full !break-words text-body-1-demi text-monochrome-white"
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </span>
        )}

        {isVisible && linkoutId && <Linkout.mobile linkouts={linkouts} linkoutId={linkoutId} videoId={videoId} />}
      </div>
      <div className="z-10 flex items-end">
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
