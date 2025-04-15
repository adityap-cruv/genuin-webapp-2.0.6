// import type { FetchVideosReturnType, InfiniteQueryResultForTreeStructureType, VideoType } from './types'
import type { VideoType } from './types'
import { PlayIcon } from 'lucide-react'
import { type ComponentProps, memo, type ReactElement } from 'react'
import { VideoNodeLoader } from './loader'
import { abbreviateNumber, cn } from '@/lib/utils'
import { CustomImage } from '../custom/custom-image'

type VideosNodePropsType = {
  availableVideosCount: number
  totalVideoCount: number
  children: Array<ReactElement<typeof VideoItem>>
  // TODO ADD LATEST react-query VERSION
  queryResult: any
}

// TODO: Ask design team what to show when isFetchingNextPage is true. for now have put a loading text.
export function VideosNode({
  availableVideosCount,
  totalVideoCount,
  children,
  queryResult: { fetchNextPage, isFetchingNextPage },
}: VideosNodePropsType) {
  const hasMoreVideos = totalVideoCount - availableVideosCount > 0
  const pendingVideosCount = totalVideoCount - availableVideosCount

  return (
    <>
      <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {children}
        {isFetchingNextPage &&
          Array.from({
            length: pendingVideosCount > 8 ? 8 : pendingVideosCount,
          }).map((_, i) => {
            return <VideoNodeLoader key={i} />
          })}
      </div>
      {hasMoreVideos && (
        <div className="mt-4 flex w-full items-center justify-center">
          <p
            onClick={() => {
              void fetchNextPage()
            }}
            className={cn(
              'cursor-pointer text-cap-1-demi text-tertiary md:text-body-1-demi',
              isFetchingNextPage && 'pointer-events-none'
            )}
            title="Click to see more!">
            {isFetchingNextPage ? 'Loading' : `See ${pendingVideosCount} more`}
          </p>
        </div>
      )}
    </>
  )
}

type VideoItem = ComponentProps<'div'> & { videoDetails: VideoType }

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const VideoItem = memo(function VideoItem({
  videoDetails: { sparkCount, thumbnail },
  className,
  ...restProps
}: VideoItem) {
  return (
    <div
      className={cn(
        'group/video-card relative aspect-reel overflow-clip rounded bg-tertiary hover:cursor-pointer',
        className
      )}
      {...restProps}>
      <CustomImage src={thumbnail ?? ''} fill alt="videos" className="object-contain" />
      <div className="absolute bottom-2 left-2 flex items-center gap-0.5">
        <PlayIcon className="h-3 w-3 stroke-monochrome-white md:h-4 md:w-4" />
        <p className="text-cap-1-demi text-monochrome-white">{abbreviateNumber(sparkCount) ?? 0}</p>
      </div>
      <div className="absolute inset-0 hidden h-full w-full items-center justify-center rounded bg-monochrome-black/40 group-hover/video-card:flex">
        <PlayIcon className="fill-monochrome-white stroke-monochrome-white" />
      </div>
    </div>
  )
})
