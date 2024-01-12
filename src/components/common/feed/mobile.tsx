import { type VideoSizeBoxType } from '@hooks/use-video-size-box'
import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import dynamic from 'next/dynamic'
import { type VideoDataType } from '@lib/schemas/video'
import { cn } from '@lib/utils'
import { useFeedListStore } from './store'
import { useEffect, useRef } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { useVideoSizeBoxMobile } from '@hooks/use-video-size-box-mobile'
import { analyticsService } from '../../../services/analytics_service'
import { usePlayerControlStore } from '../player/player-control-store'
const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.mobile))

type MobileProps = {
  sizeBox: VideoSizeBoxType
  videos: VideoDataType[]
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  /**
   * pass this number if you want to start from particular index.
   * @default 0
   */
  startIndex: number
}

// TODO: remove props sizebox
export function Mobile({
  videos,
  fetchNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  hasNextPage,
  startIndex,
  sizeBox,
}: MobileProps) {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { setCurrentIndex, setVideoList, currentIndex, videoList } = useFeedListStore((state) => ({
    setCurrentIndex: state.setCurrentIndex,
    setVideoList: state.setVideoList,
    currentIndex: state.currentIndex,
    videoList: state.videoList,
  }))
  // # If comment sheet is open than element should not be scrolled..
  const commentIsOpen = useCommentSheetStore((state) => state.modalIsOpen)
  const videoSizeBox = useVideoSizeBoxMobile()

  const currentTime = usePlayerControlStore((state) => state.currentTime)
  const duration = usePlayerControlStore((state) => state.duration)
  const progressValue = duration === 0 ? 0 : Math.round((currentTime / duration) * 100)
  let isCrossed = progressValue > 50

  useEffect(() => {
    if (!isFetchingNextPage && videoList.length - 3 <= currentIndex) {
      fetchNextPage?.()
    }
  }, [currentIndex])

  useEffect(() => {
    const element = scrollDivRef.current
    if (!element) return
    async function handleScroll(this: HTMLDivElement, e: Event) {
      const newIndex = Math.floor(this.scrollTop / this.clientHeight)
      if (newIndex > currentIndex && isCrossed) {
        await analyticsService({
          properties: {
            content_category: 'loop',
            content_id: videos[currentIndex].video.id,
            event_record_screen: 'feed',
            event_target_screen: 'none',
            video_length: duration,
            video_view_length: Math.round(currentTime),
          },
          eventName: 'Swipe Up',
        })

        await analyticsService({
          properties: {
            content_category: 'loop',
            content_id: videos[currentIndex].video.id,
            event_record_screen: 'feed',
            event_target_screen: 'none',
            video_length: duration,
            video_view_length: Math.round(currentTime),
          },
          eventName: 'Video Watched',
        })

        isCrossed = false
      } else if (newIndex < currentIndex && isCrossed) {
        await analyticsService({
          properties: {
            content_category: 'loop',
            content_id: videos[currentIndex].video.id,
            event_record_screen: 'feed',
            event_target_screen: 'none',
            video_length: duration,
            video_view_length: Math.round(currentTime),
          },
          eventName: 'Swipe Down',
        })

        await analyticsService({
          properties: {
            content_category: 'loop',
            content_id: videos[currentIndex].video.id,
            event_record_screen: 'feed',
            event_target_screen: 'none',
            video_length: duration,
            video_view_length: Math.round(currentTime),
          },
          eventName: 'Video Watched',
        })

        isCrossed = false
      }
      setCurrentIndex(newIndex)
    }

    element.addEventListener('scroll', handleScroll)
    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [scrollDivRef.current, isCrossed])

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [])

  useEffect(() => {
    const element = scrollDivRef.current
    element?.scroll({ top: element.clientHeight * startIndex, behavior: 'instant' })
  }, [])

  useEffect(() => {
    setVideoList(videos)
  }, [videos])

  if (videos && videoSizeBox)
    return (
      <div className="relative block overflow-clip">
        <div
          ref={scrollDivRef}
          style={{ height: videoSizeBox.height, width: videoSizeBox.width }}
          className={cn(
            'hide-scrollbar snap-y snap-mandatory snap-always overflow-x-clip  scroll-smooth',
            !commentIsOpen ? 'overflow-y-scroll' : 'overflow-y-hidden'
          )}>
          {videos.map((item, index) => {
            return (
              <div key={index} style={{ width: videoSizeBox.width, height: videoSizeBox.height }}>
                <Player
                  playIfInViewPort
                  isFirstPlayerInList={index === 0}
                  shouldPlay
                  loop
                  sizeBox={videoSizeBox}
                  videoData={item}
                />
              </div>
            )
          })}
        </div>
        <InfinityViewBox />
      </div>
    )
}

function InfinityViewBox() {
  const { videoList, currentIndex } = useFeedListStore((state) => ({
    currentIndex: state.currentIndex,
    videoList: state.videoList,
  }))
  const videoDetails = videoList[currentIndex]
  if (videoDetails)
    return (
      <span className="absolute bottom-0 w-full">
        <AnimatedInfinityView
          community={{
            name: videoDetails.community.name ?? '',
            handle: videoDetails.community.handle,
            profileImage: videoDetails.community.dp ?? '',
            slug: videoDetails.community.slug,
          }}
          loop={{
            name: videoDetails.loop.name ?? '',
            shareString: videoDetails.loop.share_string,
            slug: videoDetails.loop.slug,
          }}
        />
      </span>
    )
}
