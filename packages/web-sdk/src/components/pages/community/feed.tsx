import { Loader } from '@/components/loader'
import { getCommunityFeed } from './api'
import { StandardWallList } from '@/components/standard-wall/list'
import { useEffect, useMemo, useState } from 'react'
import { GeneralError } from '@/components/general-error'
import { NoContents } from '@/components/no-contents'
import { getQueryKeyForCommunityFeed } from '@/utils/constants/keys'
import {
  updateCommentCount,
  updateCommunityJoinStatus,
  updateSparkStatus,
} from '@/utils/react-query/feed'

type FeedPropsType = {
  slug: string
}

export function Feed({ slug }: FeedPropsType) {
  const queryKey = getQueryKeyForCommunityFeed(slug)
  const {
    data: communityVideos,
    isLoading,
    isError,
    fetchNextPage,
  } = getCommunityFeed(slug)
  const [activeIndex, setActiveIndex] = useState(0)

  const videos = useMemo(
    () => communityVideos?.pages.flatMap((item) => item.videos),
    [communityVideos],
  )

  useEffect(() => {
    if (!videos || videos?.length === 0) return
    if (activeIndex === videos.length - 3) {
      fetchNextPage()
    }
  }, [videos, activeIndex])

  if (isLoading) {
    return (
      <div className='w-full flex h-full items-center justify-center'>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return <GeneralError />
  }

  if (!videos || videos.length === 0) {
    return <NoContents />
  }

  return (
    <StandardWallList
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      onInit={() => {}}
      swiperElementId={`standard-wall-for-community-feed-${slug}`}
      videoShouldPlay
      videos={videos}
      onJoinCommunityStatusChanged={(communityId, role) => {
        updateCommunityJoinStatus(queryKey, communityId, role)
      }}
      onSpark={(videoId, isSparked) => {
        updateSparkStatus(queryKey, videoId, isSparked)
      }}
      onCommentCountChange={(videoId, count) => {
        updateCommentCount(queryKey, videoId, count)
      }}
    />
  )
}
