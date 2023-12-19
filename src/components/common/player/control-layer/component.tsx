import Link from 'next/link'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { DownloadDialog } from '@components/common/download-dialog'
import { PATH_NAME } from '@lib/utils/constants/path'
import icMute from '@icons/player-controls/icMute.svg'
import icUnmute from '@icons/player-controls/icUnmute.svg'
import icLoop from '@icons/icLoop.svg'
import icRightArrow from '@icons/icRightArrow.svg'
import { type VideoDataType } from '@lib/schemas/video'
import { usePlayerControlStore } from '../player-control-store'
import { Progress } from '@components/ui/progress'
import icPlay from '@icons/player-controls/icPlay.svg'
import icPause from '@icons/player-controls/icPause.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Badge } from '@components/ui/badge'
import { Actions } from './actions'

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
            isLoop={!!videoData.loop}
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
          className="absolute right-3 top-16 z-20 cursor-pointer sm:top-3"
          onClick={(e) => {
            toggleMuted()
            e.stopPropagation()
          }}
        />
        <Image
          src={shouldPlay ? icPause : icPlay}
          alt="volume-control"
          className="absolute left-3 top-16 z-20 hidden cursor-pointer sm:top-3 sm:block"
          onClick={(e) => {
            toggleShouldPlay()
            e.stopPropagation()
          }}
        />
        <div className="absolute bottom-0 left-0 w-full">
          <Loop videoData={videoData} />
          <CommunityReelSection videoData={videoData} />
        </div>
      </div>
    )
  }
}

function CommunityReelSection({ videoData }: Props) {
  return (
    <div className="mt-2 flex h-14 w-full items-center justify-between bg-monochrome-black/40 px-2">
      <div className="flex items-center gap-x-2">
        <CustomAvatar
          className="bg-red-40"
          imageUrl={videoData.loop?.profile_image ?? ''}
          fallbackString={videoData.loop?.name ?? ''}
          isAvatar={false}
        />
        <div className="flex flex-col">
          <p className="line-clamp-1 max-w-[150px] text-title-sm text-monochrome-white">{videoData.loop?.name}</p>
          <Link href={{ pathname: PATH_NAME.loop(videoData?.loop?.share_string) }}>
            <div className="flex items-center gap-x-2">
              <Image src={icLoop} alt="loop" />
              <p className="text-cap-lg text-monochrome-white/60">View Loop</p>
            </div>
          </Link>
        </div>
      </div>
      <div className="flex gap-x-2">
        <DownloadDialog title="Get the Genuin app" subtitle="Get the app to subscribe loop" asChild>
          <Button size="sm">
            <p className="text-title-sm text-monochrome-white">Subscribe</p>
          </Button>
        </DownloadDialog>
        <Image src={icRightArrow} alt="right" />
      </div>
    </div>
  )
}

function Loop({ videoData }: { videoData?: VideoDataType }) {
  return (
    <div className="flex justify-between">
      <div className="flex w-4/5 flex-col justify-end">
        <a href={PATH_NAME.profile(videoData?.owner.nickname)}>
          <Badge variant="default" className="mb-2 cursor-pointer hover:opacity-60">
            <p className="text-title-sm text-monochrome-white">
              @{videoData?.owner.nickname}
              <span>&nbsp;added</span>
            </p>
          </Badge>
        </a>
        <div className="flex items-center">
          <Link
            className="flex cursor-pointer items-center hover:opacity-60"
            href={{ pathname: PATH_NAME.loop(videoData?.loop?.share_string) }}>
            <CustomAvatar
              className="bg-red-40"
              imageUrl={videoData?.loop?.profile_image ?? ''}
              fallbackString={videoData?.loop?.name ?? ''}
              isAvatar={false}
            />
            <p className="line-clamp-1 px-2 text-title-md text-monochrome-white">{videoData?.loop?.name}</p>
          </Link>
          <Link
            href={{
              pathname: PATH_NAME.loop(videoData?.loop?.share_string),
              query: { v: videoData?.video.share_string },
            }}>
            <Button variant="outline" outlineColor="white" size="sm" className="[&>p]:hover:text-monochrome-black">
              <p className="text-title-sm text-monochrome-white">Watch</p>
            </Button>
          </Link>
        </div>
        <p className="line-clamp-3 h-min w-full py-2 text-body-sm text-monochrome-white">
          {videoData?.video.description}
        </p>
      </div>
      {/* todo configure share title and description correctly */}
      <Actions.mobile
        link={videoData?.video.link ?? ''}
        shareTitle={videoData?.video.description ?? ''}
        shareDescription={videoData?.video.description ?? ''}
        isLoop={true}
        videoData={videoData}
      />
    </div>
  )
}

function PlayerProgressBar() {
  const currentTime = usePlayerControlStore((state) => state.currentTime)
  const duration = usePlayerControlStore((state) => state.duration)
  return <Progress value={Math.round((currentTime / duration) * 100)} />
}
