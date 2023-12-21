import { type VideoSizeBoxType } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { useFeedListStore } from './store'
import { type UseInfiniteQueryResult } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
const DesktopPlayer = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

type DesktopProps = {
  sizeBox: VideoSizeBoxType
  queryFuncResult: UseInfiniteQueryResult
}

export function Desktop({ sizeBox, queryFuncResult }: DesktopProps) {
  const { data: videoPages, isLoading, isError, hasNextPage, isFetchingNextPage } = queryFuncResult

  const { setNewVideos, videoList, setCurrentIndex } = useFeedListStore((state) => ({
    setNewVideos: state.setVideoList,
    videoList: state.videoList,
    setCurrentIndex: state.setCurrentIndex,
  }))

  useEffect(() => {
    const newList = videoPages?.pages.flatMap((item: any) => {
      return item.videos as VideoDataType[]
    })
    if (newList) setNewVideos(newList)
  }, [videoPages])

  return (
    <>
      <div
        style={{ width: sizeBox.width, height: sizeBox.height }}
        className="snap-y snap-mandatory overflow-auto scroll-smooth">
        {videoList.map((item, index) => {
          return <ListItem index={index} key={index} item={item} sizeBox={sizeBox} />
        })}
      </div>
      <DesktopDetails />
    </>
  )
}

function ListItem({ index, sizeBox, item }: { index: number; sizeBox: VideoSizeBoxType; item: VideoDataType }) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(spanRef, { amount: 0.9 })
  const setCurrentIndex = useFeedListStore((state) => state.setCurrentIndex)
  useEffect(() => {
    if (inView) setCurrentIndex(index)
  }, [inView])
  return (
    <span ref={spanRef} className="snap-start">
      <DesktopPlayer
        playIfInViewPort
        isFirstPlayerInList={index === 0}
        shouldPlay
        sizeBox={sizeBox}
        videoData={item}
        loop
      />
    </span>
  )
}
