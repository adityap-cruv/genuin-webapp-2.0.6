import Link from 'next/link'
import Image from 'next/image'
import { PATH_NAME } from '@lib/utils/constants/path'
import icMute from '@icons/player-controls/icMute.svg'
import icUnmute from '@icons/player-controls/icUnmute.svg'
import { type VideoDataType } from '@lib/schemas/video'
import { usePlayerControlStore } from '../player-control-store'
import { Progress } from '@components/ui/progress'
import icPlay from '@icons/player-controls/icPlay.svg'
import icPause from '@icons/player-controls/icPause.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Actions } from './actions'
import { ReadMore } from '@components/common/read-more'

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
        <Image
          src={!muted ? icUnmute : icMute}
          alt="volume-control"
          className="absolute right-3 top-16 z-20 cursor-pointer sm:top-3"
          onClick={(e) => {
            toggleMuted()
            e.stopPropagation()
          }}
        />
        <Image
          src={shouldPlay ? icPause : icPlay}
          alt="volume-control"
          className="absolute left-3 top-16 z-20 cursor-pointer sm:top-3"
          onClick={(e) => {
            toggleShouldPlay()
            e.stopPropagation()
          }}
        />
        <div className="absolute bottom-0 right-0 pr-2">
          <Actions.desktop
            link={videoData?.video.link ?? ''}
            shareTitle={videoData?.video.description ?? ''}
            shareDescription={videoData?.video.description ?? ''}
            videoData={videoData}
          />
          <PlayerProgressBar />
        </div>
      </div>
    )
  }
}

function Mobile({ videoData }: Props) {
  const { toggleMuted, muted, shouldPlay, toggleShouldPlay } = usePlayerControlStore((state) => ({
    toggleMuted: state.toggleMuted,
    muted: state.muted,
    shouldPlay: state.shouldPlay,
    toggleShouldPlay: state.toggleShouldPlay,
  }))

  if (videoData) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={!muted ? icUnmute : icMute}
          alt="volume-control"
          className="absolute right-3 top-16 z-10 cursor-pointer"
          onClick={(e) => {
            toggleMuted()
            e.stopPropagation()
          }}
        />
        <Image
          src={shouldPlay ? icPause : icPlay}
          alt="volume-control"
          className="absolute left-3 top-16 z-10 cursor-pointer"
          onClick={(e) => {
            toggleShouldPlay()
            e.stopPropagation()
          }}
        />
        <div className="absolute bottom-12 left-0 w-full">
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
      <div className="flex justify-between px-2">
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
          <ReadMore
            text={videoData?.video.description ?? ''}
            className="w-full py-2 text-body-sm text-monochrome-white"
          />
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
  return (
    <Progress
      value={Math.round((currentTime / duration) * 100)}
      className="absolute bottom-0 left-0 h-[2px] transition-[width]"
    />
  )
}
