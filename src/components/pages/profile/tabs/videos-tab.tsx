import { Loader } from '@components/ui/loader'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useSize } from '@hooks/useSize'
import { useRef } from 'react'
import icView from '@icons/icView.svg'
import icLoop from '@icons/icLoop.svg'
import { getAllVideos, getGenuinVideos, getLoopVideos } from '@lib/api/profile'

function getNickname() {
  return useParams().nickname as string
}

// todo need have design of error screens for all tabs and implment it.
// todo pagination pending
function GenuinVideos() {
  const { data, isLoading, isError } = getGenuinVideos(getNickname())
  if (isLoading) return <Loader size="md" />
  if (isError) return <div>Something went wrong in genuin videos.</div>
  return <TabBody data={data} />
}

function LoopVideos() {
  const { data, isLoading, isError } = getLoopVideos(getNickname())
  if (isLoading) return <Loader size="md" />
  if (isError) return <div>Something went wrong in loop videos.</div>
  return <TabBody data={data} />
}

function AllVideos() {
  const { data, isLoading, isError } = getAllVideos(getNickname())
  if (isLoading) return <Loader size="md" />
  if (isError) return <div>Something went wrong in all videos.</div>
  return (
    <div className="overflow-visible overflow-x-hidden md:h-full md:overflow-y-auto">
      <TabBody data={data} />
    </div>
  )
}

function TabBody({ data }: { data: any }) {
  const { videos, end_of_videos: end } = data
  const divRef = useRef<HTMLDivElement>(null)
  const { width, windowWidth } = useSize(divRef)
  // calculate tile width
  let tileWidth = width / 4
  if (windowWidth < 1024) tileWidth = width / 3

  return (
    <>
      <div ref={divRef} className="inline-grid w-full grid-cols-3 lg:grid-cols-4">
        {videos.map((video: any, index: number) => {
          const isLoop = video.video_type === 'rt'
          return (
            <Tile
              key={index}
              imageUrl={video.video.video_thumbnail}
              width={tileWidth}
              type={isLoop ? 'loop' : 'public'}
              viewCount={video.video.view_count}
              alt="pass alt text"
              loopName={isLoop ? video.video?.group?.group_name : ''}
              replyCount={0}
            />
          )
        })}
      </div>
      <div className="flex h-52 w-full items-center justify-center">{end && <p>All Caught up!!!</p>}</div>
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
            <div className="line-clamp-2 w-1/2 break-words text-title-sm text-secondary-foreground">{loopName}</div>
          </div>
        )}
        {type === 'public' && (
          <div className="flex h-full items-end">
            <div className="flex items-center">
              <Image src={icView} alt="replies" />
              <p className="text-title-sm text-secondary-foreground">{replyCount || 0}</p>
              <Image src={icView} alt="view" />
              <p className="text-title-sm text-secondary-foreground">{viewCount || 0}</p>
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
