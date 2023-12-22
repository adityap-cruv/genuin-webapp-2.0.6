import { type VideoSizeBoxType } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { useFeedListStore } from './store'
import { type UIEvent, useEffect, useRef } from 'react'
const DesktopPlayer = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

type DesktopProps = {
  sizeBox: VideoSizeBoxType
  // queryFuncResult: UseInfiniteQueryResult
  videos: VideoDataType[]
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
}

export function Desktop({ sizeBox, hasNextPage, isError, isFetchingNextPage, isLoading, videos }: DesktopProps) {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { setNewVideos, videoList, setCurrentIndex } = useFeedListStore((state) => ({
    setNewVideos: state.setVideoList,
    videoList: state.videoList,
    setCurrentIndex: state.setCurrentIndex,
  }))

  useEffect(() => {
    setNewVideos(videos)
  }, [videos])

  function updateCurrentIndex(index: number) {}

  useEffect(() => {
    const divElement = scrollDivRef.current
    if (!divElement) return
    let localTimeout: any = null
    function scrollHandler(this: HTMLDivElement, e: Event) {
      if (localTimeout) return
      localTimeout = setTimeout(() => {
        setCurrentIndex(Math.floor(this.scrollTop / this.clientHeight))

        // updateCurrentIndex(Math.floor(this.scrollTop / this.clientHeight))
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
      <div className="flex h-full w-full">
        <div
          ref={scrollDivRef}
          style={{ width: sizeBox.width, height: sizeBox.height }}
          className="snap-y snap-mandatory snap-always overflow-x-clip overflow-y-scroll">
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
        <DesktopDetails />
      </div>
    )
}

// function ListItem({ index, sizeBox, item }: { index: number; sizeBox: VideoSizeBoxType; item: VideoDataType }) {
//   const spanRef = useRef<HTMLSpanElement>(null)
//   const setCurrentIndex = useFeedListStore((state) => state.setCurrentIndex)

//   return (
//     )
// }
