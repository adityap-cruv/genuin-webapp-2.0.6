import { Loader } from '@components/ui/loader'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useSize } from '@hooks/useSize'
import { useRef } from 'react'
import icView from '@icons/icView.svg'
import icVideoBubble from '@icons/icVideoBubble.svg'
import icLoop from '@icons/icLoop.svg'
import { getPaginatedAllVideos, getPaginatedGenuinVideos, getPaginatedLoopVideos } from '@lib/api/profile'
import type { VideoDataType } from '@lib/schemas/video'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import dynamic from 'next/dynamic'
import { pushUrlWithoutReload } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
const PlayerModal = dynamic(
  async () => await import('@components/common/player-modal').then((comp) => comp.PlayerModal)
)

function getNickname() {
  return useParams().nickname as string
}

// todo need have design of error screens for all tabs and implment it.
// todo Work on optimizing this code.
// todo fetchNextPage is being called multiple times, solve it.
function GenuinVideos() {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = getPaginatedGenuinVideos(
    getNickname()
  )
  const { scrollYProgress } = useScroll({ container: divRef })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(6)) > 0.9 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })
  return (
    <div ref={divRef} className="md:h-full md:overflow-y-auto">
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong in loop videos.</div>}
      {data && (
        <TabBody
          videos={data?.pages.flatMap((page: { videos: any }) => page.videos)}
          fetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      )}
    </div>
  )
}

function LoopVideos() {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = getPaginatedLoopVideos(
    getNickname()
  )

  const { scrollYProgress } = useScroll({ container: divRef })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(6)) > 0.9 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })
  return (
    <div ref={divRef} className="md:h-full md:overflow-y-auto">
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong in loop videos.</div>}
      {data && (
        <TabBody
          videos={data?.pages.flatMap((page: { videos: any }) => page.videos)}
          fetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      )}
    </div>
  )
}

function AllVideos() {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = getPaginatedAllVideos(
    getNickname()
  )
  const { scrollYProgress } = useScroll({ container: divRef })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(6)) > 0.9 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  return (
    <div ref={divRef} className="md:h-full md:overflow-y-auto">
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong in all videos.</div>}
      {data && (
        <TabBody
          videos={data?.pages.flatMap((page) => page.videos)}
          fetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      )}
    </div>
  )
}

interface TabBodyProps {
  videos: VideoDataType[]
  hasNextPage?: boolean
  fetchingNextPage: boolean
}

function TabBody({ videos, hasNextPage, fetchingNextPage }: TabBodyProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { width, windowWidth } = useSize(divRef)
  // calculate tile width
  let tileWidth = width / 4
  if (windowWidth < 1024) tileWidth = width / 3

  return (
    <>
      <div ref={divRef} className="inline-grid w-full grid-cols-3 lg:grid-cols-4">
        {videos.map((video, index) => {
          // const isLoop = video.video_type === 'rt'
          return <Tile key={index} width={tileWidth} videoDetails={video} />
        })}
      </div>
      <div className="flex h-52 w-full items-center justify-center">
        {!hasNextPage && <p>All Caught up!!!</p>}
        {fetchingNextPage && <Loader size="md" />}
      </div>
    </>
  )
}

type TileProps = {
  width: number
  videoDetails: VideoDataType
}

function Tile({ width = -1, videoDetails }: TileProps) {
  return (
    <PlayerModal videoDetails={videoDetails}>
      <div
        onClick={(e) => {
          pushUrlWithoutReload({
            pathname: PATH_NAME.video(videoDetails.video.share_string),
            query: [{ key: 'l', value: videoDetails.loop?.share_string }],
          })
        }}
        className="relative p-[1px] duration-300 hover:scale-95 md:p-1">
        <Image
          src={videoDetails.video.thumbnail ?? ''}
          alt={videoDetails.video.description ?? 'Genuin Video'}
          className="bg-secondary object-cover"
          height={width * (16 / 9)}
          width={width}
          priority={true}
        />
        <div className="absolute left-0 top-0 h-full w-full p-1.5">
          {videoDetails.video_type === 'rt' && (
            <div className="flex h-full flex-col justify-between">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Image src={icView} alt="views" />
                  <p className="text-title-sm text-secondary-foreground">{videoDetails.video.view_count ?? 0}</p>
                </div>
                <Image src={icLoop} alt="loop" height={24} width={24} />
              </div>
              <div className="line-clamp-2 w-1/2 break-all text-title-sm text-secondary-foreground">
                {videoDetails.loop?.name}
              </div>
            </div>
          )}
          {videoDetails.video_type === 'public_video' && (
            <div className="flex h-full items-end">
              <div className="flex items-center">
                <Image src={icVideoBubble} alt="replies" />
                <p className="text-title-sm text-secondary-foreground">&nbsp;{videoDetails.video.reply_count ?? 0}</p>
                <Image src={icView} alt="view" />
                <p className="text-title-sm text-secondary-foreground">&nbsp;{videoDetails.video.view_count ?? 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlayerModal>
  )
}

export const VideosTab = {
  genuin: GenuinVideos,
  loop: LoopVideos,
  all: AllVideos,
}
