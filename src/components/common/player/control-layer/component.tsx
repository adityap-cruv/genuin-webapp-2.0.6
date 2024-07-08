import Link from 'next/link'
import Image from 'next/image'
import { PATH_NAME } from '@lib/utils/constants/path'
import { usePlayerControlStore } from '../player-control-store'
import { Progress } from '@components/ui/progress'
import icPlay from '@icons/player-controls/icPlay.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Actions } from './actions'
import { ReadMore } from '@components/common/read-more'
import { cn } from '@lib/utils'
import { AnimatedMuteIcon } from './animated-mute-icon'
import { TickIcon } from '@icons/tick-icon'
import { type DescriptionArrType } from '@lib/schemas/player/video'
import Analytics from '@services/analytics'

export const ControlLayer = {
  desktop: Desktop,
  mobile: Mobile,
}

type DesktopProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
  videoSlug?: string
  attachedLink?: string | null
  description?: string | null
  isSparked?: boolean | null | undefined
}

function Desktop({ shareUrl, sparkCount, videoId, attachedLink, description, isSparked, videoSlug }: DesktopProps) {
  const { toggleMuted, muted, shouldPlay } = usePlayerControlStore((state) => ({
    toggleMuted: state.toggleMuted,
    muted: state.muted,
    shouldPlay: state.shouldPlay,
  }))

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex h-full w-full items-center justify-center">
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
      {muted && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            toggleMuted()
            void Analytics.track({
              eventName: 'Unmute',
              properties: { video_id: videoId },
            })
          }}
          className="absolute inset-0 h-full w-full">
          <span className="absolute inset-0 left-6 top-6 h-fit w-fit cursor-pointer">
            <AnimatedMuteIcon />
          </span>
        </div>
      )}
      <div className="absolute bottom-0 right-0 pr-2">
        <Actions.desktop
          shareUrl={shareUrl}
          sparkCount={sparkCount}
          videoId={videoId}
          videoSlug={videoSlug}
          attachedLink={attachedLink}
          description={description}
          isSparked={isSparked}
        />
      </div>
      <PlayerProgressBar />
    </div>
  )
}

function Mobile({ ...props }: MobileProps) {
  const { toggleMuted, muted, shouldPlay } = usePlayerControlStore((state) => ({
    toggleMuted: state.toggleMuted,
    muted: state.muted,
    shouldPlay: state.shouldPlay,
  }))

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
      <div className="absolute flex h-full w-full items-center justify-center">
        <div
          className={cn(
            ' rounded-full bg-monochrome-black/40 p-2 transition-all duration-300 ',
            !shouldPlay ? 'scale-125 opacity-100 ease-in' : 'scale-100 opacity-0 ease-out'
          )}>
          <Image
            src={icPlay}
            alt="volume-control"
            className={cn('pointer-events-none z-10 cursor-pointer rounded-full')}
          />
        </div>
      </div>
      <div className="absolute bottom-16 left-0 w-full ">
        <Loop {...props} />
      </div>
      <PlayerProgressBar />
    </div>
  )
}
type MobileProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
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
    brand?:
      | {
          brand_id: number
          brand_slug: string
        }
      | undefined
      | null
  }
}

function Loop({
  shareUrl,
  sparkCount,
  commentCount,
  slug,
  videoId,
  attachedLink,
  descriptionArr,
  descriptionText,
  owner,
  isSparked,
}: MobileProps) {
  return (
    <div className="flex justify-between px-2">
      <div className="flex w-4/5 flex-col justify-end">
        <div className="z-10 flex items-center">
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
              <div className="flex items-center gap-0.5">
                <TickIcon className="h-3 w-3 fill-primary" />
                <p className="text-cap-2-demi text-primary">Brand</p>
              </div>
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
        {Array.isArray(descriptionArr) ? (
          <span className="z-10 py-2">
            <ReadMore.withMention
              textArr={descriptionArr}
              className="w-full break-all text-body-1-demi text-monochrome-white"
            />
          </span>
        ) : (
          <span className="z-10 py-2">
            <ReadMore.default
              text={descriptionText}
              className="w-full break-all text-body-1-demi text-monochrome-white"
            />
          </span>
        )}
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

function PlayerProgressBar() {
  const currentTime = usePlayerControlStore((state) => state.currentTime)
  const duration = usePlayerControlStore((state) => state.duration)
  let progressValue = 0
  if (duration !== 0) progressValue = Math.round((currentTime / duration) * 100)

  return <Progress value={progressValue} className="absolute bottom-0 left-0 h-[2px] transition-[width]" />
}
