import { type VideoSizeBoxType } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { useFeedListStore } from './store'
import { useEffect, useRef } from 'react'
import { cn } from '@lib/utils'
const DesktopPlayer = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

type DesktopProps = {
  sizeBox: VideoSizeBoxType
  // queryFuncResult: UseInfiniteQueryResult
  videos: VideoDataType[]
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  className?: string
}

export function Desktop({
  sizeBox,
  fetchNextPage,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  videos,
  className,
}: DesktopProps) {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { setNewVideos, videoList, setCurrentIndex, currentIndex } = useFeedListStore((state) => ({
    setNewVideos: state.setVideoList,
    videoList: state.videoList,
    setCurrentIndex: state.setCurrentIndex,
    currentIndex: state.currentIndex,
  }))

  useEffect(() => {
    if (currentIndex > videoList.length - 3 && !isFetchingNextPage) {
      fetchNextPage?.()
    }
  }, [currentIndex])

  // TODO improvement pending
  useEffect(() => {
    setCurrentIndex(0)
  }, [])

  useEffect(() => {
    setNewVideos(videos)
  }, [videos])

  useEffect(() => {
    const divElement = scrollDivRef.current
    if (!divElement) return
    let localTimeout: any = null
    function scrollHandler(this: HTMLDivElement, e: Event) {
      if (localTimeout) return
      localTimeout = setTimeout(() => {
        setCurrentIndex(Math.floor(this.scrollTop / this.clientHeight))
        localTimeout = null
      }, 200)
    }

    divElement.addEventListener('scroll', scrollHandler)
    return () => {
      divElement.removeEventListener('scroll', scrollHandler)
    }
  }, [scrollDivRef])

  if (videoList)
    return (
      <div className={cn('flex h-full w-full', className)}>
        <div
          ref={scrollDivRef}
          style={{ width: sizeBox.width, height: sizeBox.height }}
          className="hide-scrollbar snap-y snap-mandatory snap-always overflow-x-clip overflow-y-scroll">
          {videoList.map((item, index) => {
            return (
              <div key={index}>
                <DesktopPlayer
                  playIfInViewPort
                  isFirstPlayerInList={index === 0}
                  shouldPlay
                  sizeBox={sizeBox}
                  videoData={item}
                  loop
                />
              </div>
            )
          })}
        </div>
        <DesktopDetails videoDetails={videoList[currentIndex]} />
      </div>
    )
}

type SinglePlayerProps = {
  videoDetails: VideoDataType
  sizeBox: VideoSizeBoxType
  className?: string
}

export function SinglePlayer({ sizeBox, videoDetails, className }: SinglePlayerProps) {
  return (
    <div className={cn('flex h-full w-full', className)}>
      <div style={{ width: sizeBox.width, height: sizeBox.height }} className="hide-scrollbar overflow-x-clip">
        <DesktopPlayer shouldPlay sizeBox={sizeBox} videoData={videoDetails} loop />
      </div>
      <DesktopDetails videoDetails={videoDetails} />
    </div>
  )
}
