import { Loader } from '@components/ui/loader'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useSize } from '@hooks/useSize'
import { useRef } from 'react'
import icView from '@icons/icView.svg'
import icVideoBubble from '@icons/icVideoBubble.svg'
import icLoop from '@icons/icLoop.svg'
import { getPaginatedAllVideos, getPaginatedGenuinVideos, getPaginatedLoopVideos } from '@lib/api/profile'
import { VideoDataType } from '@lib/schemas/video'
import { useMotionValueEvent, useScroll } from 'framer-motion'

function getNickname() {
  return useParams().nickname as string
}

// todo need have design of error screens for all tabs and implment it.
// todo Work on optimizing this code.
// todo solve pagination issue for small screens.
function GenuinVideos() {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = getPaginatedGenuinVideos(
    getNickname()
  )
  const { scrollYProgress } = useScroll({ container: divRef })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(6)) > 0.9 && !isFetchingNextPage) {
      fetchNextPage()
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
      fetchNextPage()
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
      fetchNextPage()
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
          const isLoop = video.video_type === 'rt'
          return (
            <Tile
              key={index}
              imageUrl={video.video.thumbnail || ''}
              width={tileWidth}
              type={isLoop ? 'loop' : 'public'}
              viewCount={video.video.view_count}
              alt={video.video.description || 'Genuin Video.'}
              loopName={video.loop ? video.loop.name ?? '' : ''}
              replyCount={video.video.reply_count ?? 0}
            />
          )
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
  imageUrl: string
  width: number
  alt?: string
  type: 'loop' | 'public'
  viewCount: number
  replyCount?: number
  loopName: string
}

function Tile({ imageUrl = '', width = -1, alt = '', viewCount, replyCount, type, loopName }: TileProps) {
  return (
    <div className="relative cursor-pointer p-[1px] duration-300 hover:scale-95 md:p-1">
      <Image
        src={imageUrl}
        alt={alt}
        className="bg-secondary object-cover blur-md"
        height={width * (16 / 9)}
        width={width}
        priority={true}
        onLoadingComplete={(img) => {
          img.classList.remove('blur-md')
        }}
      />
      <div className="absolute left-0 top-0 h-full w-full p-1.5">
        {type === 'loop' && (
          <div className="flex h-full flex-col justify-between">
            <div className="flex justify-between">
              <div className="flex items-center">
                <Image src={icView} alt="views" />
                <p className="text-title-sm text-secondary-foreground">{viewCount || 0}</p>
              </div>
              <Image src={icLoop} alt="loop" height={24} width={24} />
            </div>
            <div className="line-clamp-2 w-1/2 break-all text-title-sm text-secondary-foreground">{loopName}</div>
          </div>
        )}
        {type === 'public' && (
          <div className="flex h-full items-end">
            <div className="flex items-center">
              <Image src={icVideoBubble} alt="replies" />
              <p className="text-title-sm text-secondary-foreground">&nbsp;{replyCount || 0}</p>
              <Image src={icView} alt="view" />
              <p className="text-title-sm text-secondary-foreground">&nbsp;{viewCount || 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const VideosTab = {
  genuin: GenuinVideos,
  loop: LoopVideos,
  all: AllVideos,
}
