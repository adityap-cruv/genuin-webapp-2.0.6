import { Feed } from '@/components/standard-wall/feed'
import { useBaseContext } from '@/context/base'
import { NoContents } from '@/components/no-contents'
import { FeedType } from '@/type'
import { useEffect, useRef } from 'react'
import { useSizeContext } from '@/context/size'
import { StandardWallShimmers } from '../shimmers/StandardWall'
import { useAuth } from '@/context/auth'
import { getUpdatedVideoDetails } from '../authentication/api/auth'

type StandardWallPropsType = {
  feedType: FeedType
}
export function StandardWall({ feedType }: StandardWallPropsType) {
  const { user } = useAuth()
  const prevUserRef = useRef(user)
  const { isLoading, videos, updateActiveFeed, setVideos } = useBaseContext()
  const {
    sizeBoxes: { video: videoSizeBox },
    isMobile,
  } = useSizeContext()

  // updated video details when user logs in
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        // Filter out null videos and get valid video IDs
        const videoIds = videos
          .filter((video): video is NonNullable<typeof video> => video !== null)
          .map((video) => video.video.uuid)

        if (videoIds.length === 0) return

        const response = await getUpdatedVideoDetails(videoIds)
        const data = Array.isArray(response) ? response : []
        const responseMap = new Map(data.map((item) => [item.video.uuid, item]))

        setVideos((prevVideos) =>
          prevVideos.map((video) => {
            // Handle null videos
            if (!video?.video?.uuid) return video

            const updated = responseMap.get(video.video.uuid)
            if (!updated) return video

            return {
              ...video,
              video: {
                ...video.video,
                no_of_sparks: updated.video.no_of_sparks,
                is_sparked: updated.video.is_sparked,
                no_of_comments: updated.video.no_of_comments,
              },
              loop: {
                ...video.loop,
                is_loop_subscribe: updated.loop.is_subscriber,
              },
              community: {
                ...video.community,
                logged_in_user_role: updated.community.logged_in_user_role,
              },
            }
          }),
        )
      } catch (error) {
        console.error('Error updating video details:', error)
      }
    }

    if (user && !prevUserRef.current && videos.length > 0) {
      void fetchVideoDetails()
    }

    // Update ref after effect
    prevUserRef.current = user
  }, [user, videos])

  useEffect(() => {
    updateActiveFeed(feedType)
  }, [feedType])

  // TODO: configure  the mobile view header here.
  return isLoading ? (
    <FeedShimmer
      isMobile={isMobile}
      videoWidth={videoSizeBox.width}
    />
  ) : videos.length === 0 ? (
    <NoContents />
  ) : (
    <Feed />
  )
}

function FeedShimmer({
  isMobile,
  videoWidth,
}: {
  isMobile: boolean
  videoWidth: number
}) {
  return isMobile ? (
    <StandardWallShimmers.mobile />
  ) : (
    <StandardWallShimmers.desktop videoWidth={videoWidth} />
  )
}
