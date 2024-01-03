'use client'
import {
  CustomDialog,
  CustomDialogClose,
  CustomDialogContent,
  CustomDialogTrigger,
} from '@components/custom/custom-dialog'
import { useVideoSizeBoxModal } from '@hooks/use-video-size-box-modal'
import { useEffect } from 'react'
import { type VideoDataType } from '@lib/schemas/video'
import { X } from 'lucide-react'
import { useFeedModalStore } from './store'
import { SinglePlayer } from '@components/common/feed/desktop'
import icUpArrow from '@icons/player-controls/icArrowUp.svg'
import icDownArrow from '@icons/player-controls/icArrowDown.svg'
import Image from 'next/image'

type Props = {
  children?: React.ReactNode
  videos: VideoDataType[]
  /**
   * Index to start playing video from.
   * @default 0
   */
  startIndex: number
  fetchNextVideos: () => void
  isFetchingNextPage: boolean
  isError: boolean
  /**
   * Controls if modal should open or not.
   * @default false
   */
  open: boolean
  close: () => void
}

export function Component({
  children,
  open = false,
  startIndex = 0,
  videos,
  close,
  isFetchingNextPage,
  isError,
  fetchNextVideos,
}: Props) {
  const videoSizeBox = useVideoSizeBoxModal()
  const { currentIndex, setCurrentIndex, setStateVideos } = useFeedModalStore((state) => ({
    currentIndex: state.currentIndex,
    setCurrentIndex: state.setCurrentIndex,
    setStateVideos: state.setVideos,
  }))

  useEffect(() => {
    setStateVideos(videos)
  }, [videos])

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [startIndex])

  // useEffect(() => {
  //   let timeOut: NodeJS.Timeout | null
  //   function wheelHandler(e: WheelEvent) {
  //     if (!timeOut) {
  //       timeOut = setTimeout(() => {
  //         if (e.deltaY > 0) {
  //           setCurrentIndex(currentIndex + 1)
  //         }
  //         if (e.deltaY < 0) {
  //           setCurrentIndex(currentIndex - 1)
  //         }
  //         timeOut = null
  //       }, 200)
  //     }
  //   }

  //   window.addEventListener('wheel', wheelHandler)
  //   return () => {
  //     window.removeEventListener('wheel', wheelHandler)
  //   }
  // }, [])

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        {videoSizeBox && (
          <span className="flex items-center gap-x-6">
            <div style={{ width: videoSizeBox.modal.width, height: videoSizeBox.modal.height }} className="relative">
              <CustomDialogClose
                onClick={() => {
                  close?.()
                }}
                className="absolute right-4 top-4 z-10">
                <X className="h-6 w-6" />
              </CustomDialogClose>
              <SinglePlayer
                videoDetails={videos[currentIndex]}
                className="overflow-clip rounded-2xl"
                sizeBox={{ height: videoSizeBox.video.height, width: videoSizeBox.video.width }}
              />
            </div>
            <span className="flex flex-col gap-y-4">
              <button
                onClick={() => {
                  setCurrentIndex(currentIndex - 1)
                }}
                className="rounded-full bg-monochrome-white/10 p-2 hover:bg-monochrome-white/20">
                <Image src={icUpArrow} alt="" />
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(currentIndex + 1)
                }}
                className="rounded-full bg-monochrome-white/10 p-2 hover:bg-monochrome-white/20">
                <Image src={icDownArrow} alt="" />
              </button>
            </span>
          </span>
        )}
      </CustomDialogContent>
    </CustomDialog>
  )
}
