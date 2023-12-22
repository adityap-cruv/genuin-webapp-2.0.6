import { type VideoSizeBoxType } from '@hooks/use-video-size-box'
import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import dynamic from 'next/dynamic'
import { type VideoDataType } from '@lib/schemas/video'
import { useFeedListStore } from './store'
import { useEffect, useRef } from 'react'
const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.mobile))

type MobileProps = {
  sizeBox: VideoSizeBoxType
  videos: VideoDataType[]
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
}

export function Mobile({ videos, isError, isFetchingNextPage, isLoading, sizeBox, hasNextPage }: MobileProps) {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { setCurrentIndex, setVideoList } = useFeedListStore((state) => ({
    setCurrentIndex: state.setCurrentIndex,
    setVideoList: state.setVideoList,
  }))

  useEffect(() => {
    const element = scrollDivRef.current
    if (!element) return
    function handleScroll(this: HTMLDivElement, e: Event) {
      setCurrentIndex(Math.floor(this.scrollTop / this.clientHeight))
    }

    element.addEventListener('scroll', handleScroll)
    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [scrollDivRef.current])

  useEffect(() => {
    setVideoList(videos)
  }, [videos])

  return (
    <div className="relative block overflow-clip">
      <div
        ref={scrollDivRef}
        style={{ width: sizeBox.width, height: sizeBox.height }}
        className="hide-scrollbar snap-y snap-mandatory snap-always overflow-x-clip overflow-y-scroll scroll-smooth">
        {videos.map((item, index) => {
          return <Player key={index} isFirstPlayerInList={index === 0} shouldPlay sizeBox={sizeBox} videoData={item} />
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
            name: 'Testing',
            handle: 'testing',
            profileImage: 'no available',
          }}
          loop={{
            name: videoDetails.loop?.name ?? '',
            shareString: videoDetails.loop?.share_string ?? '',
          }}
        />
      </span>
    )
}
