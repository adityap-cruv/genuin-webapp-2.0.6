import { Feed } from '@/components/standard-wall/feed'
import { useBaseContext } from '@/context/base'
import { Shimmer } from '@/components/shimmer'
import { NoContents } from '@/components/no-contents'
import { FeedType } from '@/type'
import { useEffect } from 'react'
type StandardWallPropsType = {
  feedType: FeedType
}
export function StandardWall({ feedType }: StandardWallPropsType) {
  const { isLoading, videos, updateActiveFeed } = useBaseContext()

  useEffect(() => {
    updateActiveFeed(feedType)
  }, [feedType])

  // TODO: configure  the mobile view header here.
  return isLoading ? (
    <FeedShimmer />
  ) : videos.length === 0 ? (
    <NoContents />
  ) : (
    <Feed />
  )
}
function FeedShimmer() {
  return <Shimmer className='h-full w-full' />
}
