import Link from 'next/link'
import Image from 'next/image'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type VideoDataType } from '@lib/schemas/video'
import { usePlayerControlStore } from '../player-control-store'
import { Progress } from '@components/ui/progress'
import icPlay from '@icons/player-controls/icPlay.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Actions } from './actions'
import { ReadMore } from '@components/common/read-more'
import { cn } from '@lib/utils'
import { AnimatedMuteIcon } from './animated-mute-icon'

export const ControlLayer = {
  desktop: Desktop,
  mobile: Mobile,
}

interface Props {
  videoData: VideoDataType
}

function Desktop({ videoData }: Props) {
  const { toggleMuted, muted, shouldPlay, toggleShouldPlay } = usePlayerControlStore((state) => ({
    toggleMuted: state.toggleMuted,
    muted: state.muted,
    shouldPlay: state.shouldPlay,
    toggleShouldPlay: state.toggleShouldPlay,
  }))

  if (videoData) {
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
            }}
            className="absolute inset-0 h-full w-full">
            <span className="absolute inset-0 left-6 top-6 h-fit w-fit cursor-pointer">
              <AnimatedMuteIcon />
            </span>
          </div>
        )}
        <div className="absolute bottom-0 right-0 pr-2">
          <Actions.desktop
            link={videoData?.video.link ?? ''}
            shareTitle={videoData?.video.description ?? ''}
            shareDescription={videoData?.video.description ?? ''}
            videoData={videoData}
          />
        </div>
        <PlayerProgressBar />
      </div>
    )
  }
}

// TODO: Copy youtubes behavior.
function Mobile({ videoData }: Props) {
  const { toggleMuted, muted, shouldPlay } = usePlayerControlStore((state) => ({
    toggleMuted: state.toggleMuted,
    muted: state.muted,
    shouldPlay: state.shouldPlay,
  }))

  if (videoData) {
    return (
      <div className="relative h-full w-full">
        {muted && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              toggleMuted()
            }}
            className="absolute z-[6] h-full w-full">
            <span className="absolute left-5 top-14">
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
        <div className="absolute bottom-12 left-0 z-[5] w-full">
          <Loop videoData={videoData} />
        </div>
        <PlayerProgressBar />
      </div>
    )
  }
}

function Loop({ videoData }: { videoData?: VideoDataType }) {
  if (videoData)
    return (
      <div className="flex justify-between  px-2">
        <div className="flex w-4/5 flex-col justify-end">
          <div className="flex items-center">
            <Link
              className="flex cursor-pointer items-center hover:opacity-60"
              href={{ pathname: PATH_NAME.profile(videoData.owner.nickname) }}>
              <CustomAvatar
                className="bg-red-40"
                imageUrl={videoData.owner.profile_image ?? ''}
                fallbackString={videoData.loop?.name ?? ''}
                isAvatar={videoData?.owner.is_avatar}
              />
              <p className="line-clamp-1 px-2 text-title-md text-monochrome-white">@{videoData.owner.nickname}</p>
            </Link>
          </div>
          <span className="py-2">
            <ReadMore
              text={videoData?.video.description ?? ''}
              className="line-clamp-2 w-full break-all text-body-sm text-monochrome-white"
            />
          </span>
        </div>
        {/* TODO: configure share title and description correctly */}
        <Actions.mobile
          link={videoData?.video.link ?? ''}
          shareTitle={videoData?.video.description ?? ''}
          shareDescription={videoData?.video.description ?? ''}
          videoData={videoData}
        />
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
