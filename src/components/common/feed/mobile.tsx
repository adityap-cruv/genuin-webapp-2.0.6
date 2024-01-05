import { type VideoSizeBoxType } from '@hooks/use-video-size-box'
import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import dynamic from 'next/dynamic'
import { type VideoDataType } from '@lib/schemas/video'
import { cn } from '@lib/utils'
import { useFeedListStore } from './store'
import { useEffect, useRef } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
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

export function Mobile({
  videos,
  fetchNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  sizeBox,
  hasNextPage,
  startIndex,
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

  useEffect(() => {
    if (!isFetchingNextPage && videoList.length - 3 <= currentIndex) {
      fetchNextPage?.()
    }
  }, [currentIndex])

  useEffect(() => {
    const element = scrollDivRef.current
    if (!element) return
    function handleScroll(this: HTMLDivElement, e: Event) {
      const newIndex = Math.floor(this.scrollTop / this.clientHeight)
      setCurrentIndex(newIndex)
    }

    element.addEventListener('scroll', handleScroll)
    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [scrollDivRef.current])

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

  return (
    <div className="relative block overflow-clip">
      <div
        ref={scrollDivRef}
        style={{ width: sizeBox.width, height: sizeBox.height }}
        className={cn(
          'hide-scrollbar snap-y snap-mandatory snap-always overflow-x-clip  scroll-smooth',
          !commentIsOpen ? 'overflow-y-scroll' : 'overflow-y-hidden'
        )}>
        {videos.map((item, index) => {
          return (
            <div key={index} style={{ width: sizeBox.width, height: sizeBox.height }}>
              <Player
                playIfInViewPort
                isFirstPlayerInList={index === 0}
                shouldPlay
                loop
                sizeBox={sizeBox}
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
