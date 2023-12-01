import { Loader } from '@components/ui/loader'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useSize } from '@hooks/useSize'
import { useRef, useState } from 'react'
import icView from '@icons/icView.svg'
import icVideoBubble from '@icons/icVideoBubble.svg'
import icLoop from '@icons/icLoop.svg'
import { getPaginatedAllVideos, getPaginatedGenuinVideos, getPaginatedLoopVideos } from '@lib/api/profile'
import type { VideoDataType } from '@lib/schemas/video'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import dynamic from 'next/dynamic'
import { pushUrlWithoutReload } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useResponsive } from '@hooks/useResponsive'
import { isMobile } from 'react-device-detect'
const PlayerListModal = dynamic(
  async () => await import('@components/common/modals/player-list-modal').then((comp) => comp.PlayerListModal)
)

export const VideosTab = {
  genuin: GenuinVideos,
  loop: LoopVideos,
  all: AllVideos,
}

function getNickname() {
  return useParams().nickname as string
}

const SCROLL_LIMIT = 0.9
const PRECISION_COUNT = 6

// todo need have design of error screens for all tabs and implement it.
// todo Work on optimizing this code.
// todo fetchNextPage is being called multiple times, solve it.
function GenuinVideos() {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getPaginatedGenuinVideos(getNickname())
  const { isMd } = useResponsive()
  // if screen size is medium or more then it will take divRef as container. It has been done to work with infinite scroll feature.
  const { scrollYProgress } = useScroll({ container: isMd ? divRef : undefined })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(PRECISION_COUNT)) > SCROLL_LIMIT && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })
  return (
    <div ref={divRef} className="h-full overflow-y-auto">
      {isLoading && <Loader className={`${isMobile && 'pt-40'}`} size="md" />}
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
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = getPaginatedLoopVideos(getNickname())
  const { isMd } = useResponsive()
  const { scrollYProgress } = useScroll({ container: isMd ? divRef : undefined })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(PRECISION_COUNT)) > SCROLL_LIMIT && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })
  return (
    <div ref={divRef} className="h-full overflow-y-auto">
      {isLoading && <Loader className={`${isMobile && 'pt-40'}`} size="md" />}
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
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = getPaginatedAllVideos(getNickname())
  const { isMd } = useResponsive()
  const { scrollYProgress } = useScroll({ container: isMd ? divRef : undefined })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(PRECISION_COUNT)) > SCROLL_LIMIT && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  return (
    <div ref={divRef} className="h-full overflow-y-auto">
      {isLoading && <Loader className={`${isMobile && 'pt-40'}`} size="md" />}
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
  const [modalState, setModalState] = useState({ isOpen: false, currentIndex: -1 })

  // calculate tile width
  let tileWidth = width / 4
  if (windowWidth < 1024) tileWidth = width / 3

  if (videos.length === 0) {
    return (
      <div className={`flex h-full ${isMobile && 'pt-40'} w-full items-center justify-center text-title-lg text-secondary`}>No videos yet</div>
    )
  }

  return (
    <>
      <div ref={divRef} className="inline-grid w-full grid-cols-3 lg:grid-cols-4">
        {videos.map((video, index) => {
          return (
            <Tile
              key={index}
              width={tileWidth}
              videoDetails={video}
              onClick={(index) => {
                setModalState({ currentIndex: index, isOpen: true })
              }}
              tileIndex={index}
            />
          )
        })}
        {modalState.isOpen && (
          <PlayerListModal
            videosData={videos}
            startIndex={modalState.currentIndex}
            onOpenChange={(open) => {
              setModalState((x) => {
                x.isOpen = open
                return { ...x }
              })
            }}
            closeModal={() => {
              setModalState((x) => {
                x.isOpen = false
                return { ...x }
              })
            }}
          />
        )}
      </div>
      {fetchingNextPage && (
        <div className="flex h-52 w-full items-center justify-center">
          <Loader size="md" />
        </div>
      )}
    </>
  )
}

type TileProps = {
  width: number
  videoDetails: VideoDataType
  onClick?: (index: number) => void
  tileIndex: number
}

function Tile({ width = -1, videoDetails, onClick, tileIndex }: TileProps) {
  return (
    <div
      onClick={() => {
        pushUrlWithoutReload({
          pathname: PATH_NAME.video(videoDetails.video.share_string),
          query: [{ key: 'l', value: videoDetails.loop?.share_string }],
        })
        onClick?.(tileIndex)
      }}
      className="relative cursor-pointer p-[1px] duration-300 hover:scale-95 md:p-1">
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
            <div className="ml-1 line-clamp-2 break-all text-left text-title-sm text-secondary-foreground">
              {videoDetails.loop?.name}
            </div>
          </div>
        )}
        {videoDetails.video_type === 'public_video' && (
          <div className="flex h-full items-end">
            <div className="flex items-center p-2">
              <Image src={icVideoBubble} alt="replies" />
              <p className="text-title-sm text-secondary-foreground">&nbsp;{videoDetails.video.reply_count ?? 0}</p>
              <Image src={icView} alt="view" />
              <p className="text-title-sm text-secondary-foreground">&nbsp;{videoDetails.video.view_count ?? 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
