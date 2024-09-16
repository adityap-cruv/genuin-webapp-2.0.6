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
import { memo, useEffect, useId, useState } from 'react'
import { Linkout } from '../../linkout'
import { useShallow } from 'zustand/react/shallow'
import { fetchLinkouts } from '../../linkout/api'
import { type LinkoutsType } from '../../linkout/schema'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'

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
}

export const Mobile = memo(function Mobile({ ...props }: MobileProps) {
  const { toggleMuted, muted, shouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      toggleMuted: state.toggleMuted,
      muted: state.muted,
      shouldPlay: state.shouldPlay,
    }))
  )

  return (
    <div className="relative h-full w-full">
      {muted && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            toggleMuted()
            void Analytics.track({
              eventName: 'Unmute',
              properties: { video_id: props.videoId },
            })
          }}
          className="absolute z-[3] h-full w-full ">
          <span className="absolute left-4 top-20">
            <AnimatedMuteIcon />
          </span>
        </div>
      )}
      <span className="absolute right-2 top-20 z-20 h-fit w-fit cursor-pointer">
        <WalletAmountBadge type="light" />
      </span>
      <div className="absolute flex h-full w-full items-center justify-center">
        <div
          className={cn(
            'rounded-full bg-monochrome-black/40 p-2 transition-all duration-300 ',
            !shouldPlay ? 'scale-125 opacity-100 ease-in' : 'scale-100 opacity-0 ease-out'
          )}>
          <Image
            src={icPlay}
            alt="volume-control"
            className={cn('pointer-events-none z-10 cursor-pointer rounded-full')}
          />
        </div>
      </div>
      <Details {...props} />
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
}: MobileProps) {
  const [linkouts, setLinkouts] = useState<LinkoutsType | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const detailsId = useId()

  useEffect(() => {
    let timeoutId: any
    const detailsElement = document.getElementById(detailsId)
    if (isActive && linkoutId) {
      void fetchLinkouts(linkoutId)
        .then((data) => {
          setLinkouts(data)
        })
        .catch((e) => {
          if (detailsElement) {
            detailsElement.style.setProperty('transform', 'translate(0px, 0px)')
          }
        })
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
  }, [isActive])

  return (
    <div className={cn('absolute bottom-16 left-0 flex w-full justify-between px-2 transition-all')}>
      <div id={detailsId} className="relative flex w-4/5 flex-col justify-end">
        <div className="z-10 mb-2 flex items-center">
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
            <ReadMore.withMention
              textArr={descriptionArr}
              className="w-full break-all text-body-1-demi text-monochrome-white"
            />
          </span>
        )}
        {isVisible && linkoutId && <Linkout.mobile linkouts={linkouts ?? []} linkoutId={linkoutId} videoId={videoId} />}
      </div>
      <div className="z-10">
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
