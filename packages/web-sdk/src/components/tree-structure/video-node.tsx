import type {
  FetchVideosReturnType,
  InfiniteQueryResultForTreeStructureType,
  VideoType,
} from './types'
import { abbreviateNumber, cn } from '@/utils'
import { CustomImage } from '../custom-image'
import { PlayIcon } from 'lucide-react'
import { type ComponentProps, memo, type ReactElement } from 'react'
import { VideoNodeLoader } from './loader'

type VideosNodePropsType = {
  availableVideosCount: number
  totalVideoCount: number
  children: Array<ReactElement<typeof VideoItem>>
  queryResult: InfiniteQueryResultForTreeStructureType<FetchVideosReturnType>
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
      <div className='w-full gap-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'>
        {children}
        {isFetchingNextPage &&
          Array.from({
            length: pendingVideosCount > 8 ? 8 : pendingVideosCount,
          }).map((_, i) => {
            return <VideoNodeLoader key={i} />
          })}
      </div>
      {hasMoreVideos && (
        <div className='mt-4 w-full flex items-center justify-center'>
          <p
            onClick={() => {
              fetchNextPage()
            }}
            className={cn(
              'cursor-pointer text-tertiary text-cap-1-demi md:text-body-1-demi',
              isFetchingNextPage && 'pointer-events-none',
            )}
            title='Click to see more!'>
            {isFetchingNextPage ? 'Loading' : `See ${pendingVideosCount} more`}
          </p>
        </div>
      )}
    </>
  )
}

type VideoItem = ComponentProps<'div'> & { videoDetails: VideoType }

export const VideoItem = memo(function VideoItem({
  videoDetails: { sparkCount, thumbnail },
  className,
  ...restProps
}: VideoItem) {
  return (
    <div
      className={cn(
        'group/video-card relative aspect-reel overflow-clip rounded bg-tertiary hover:cursor-pointer',
        className,
      )}
      {...restProps}>
      <CustomImage
        src={thumbnail ?? ''}
        className='object-cover h-full w-full'
        title='Click to see video!'
      />
      <div className='absolute bottom-2 left-2 flex items-center gap-0.5'>
        <PlayIcon className='stroke-white h-3 w-3 md:h-4 md:w-4' />
        <p className='text-cap-1-demi md:text-body-1-med text-white'>
          {abbreviateNumber(sparkCount) ?? 0}
        </p>
      </div>
      <div className='absolute inset-0 h-full w-full items-center justify-center hidden rounded bg-black/40 group-hover/video-card:flex'>
        <PlayIcon className='fill-white stroke-white' />
      </div>
    </div>
  )
})
