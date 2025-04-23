import { GeneralError } from '@/components/general-error'
import { NotFoundView } from '@/components/not-found-view'
import { useVideoDetails } from '@/components/pages/video/api'
import { Shimmer } from '@/components/shimmer'
import { StandardWallList } from '@/components/standard-wall/list'
import { useBaseContext } from '@/context/base'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'
import { useEffect } from 'react'

const STANDARD_WALL_VIDEO_ID = '__gen__sdk__standard-wall__video__class'

export function VideoPage({ slug }: { slug: string }) {
  const {
    isLoading,
    data: videoDetails,
    isError,
    error,
  } = useVideoDetails(slug)
  const { setVideos, videos } = useBaseContext()

  useEffect(() => {
    setVideos(videoDetails ? [videoDetails] : [])
  }, [videoDetails])

  if (isLoading) {
    return <Shimmer className='h-full w-full' />
  }

  if (error?.message === NOT_FOUND_ERROR_CODES.video) {
    return <NotFoundView type='video' />
  }

  if (isError || !videoDetails) {
    return <GeneralError />
  }

  return (
    <div>
      {videos.length > 0 && (
        <StandardWallList
          videoShouldPlay={true}
          activeIndex={0}
          onActiveIndexChange={() => {}}
          onInit={() => {}}
          swiperElementId={STANDARD_WALL_VIDEO_ID}
          videos={videos}
        />
      )}
    </div>
  )
}
