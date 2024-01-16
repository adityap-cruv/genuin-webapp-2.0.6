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
import { Loader } from '@components/ui/loader'
import { cn } from '@lib/utils'

type Props = {
  children?: React.ReactNode
  videos?: VideoDataType[]
  /**
   * Index to start playing video from.
   * @default 0
   */
  startIndex: number
  fetchNextVideos: () => void
  fetchPreviousVideos?: (index: number) => void
  isFetchingNextPage: boolean
  isError: boolean
  /**
   * Controls if modal should open or not.
   * @default false
   */
  open: boolean
  close: () => void
  isLoading: boolean
}

export function Desktop({
  children,
  open = false,
  startIndex = 0,
  videos,
  close,
  isLoading,
  isFetchingNextPage,
  isError,
  fetchNextVideos,
  fetchPreviousVideos,
}: Props) {
  const videoSizeBox = useVideoSizeBoxModal()
  const { currentIndex, setCurrentIndex, setStateVideos } = useFeedModalStore((state) => ({
    currentIndex: state.currentIndex,
    setCurrentIndex: state.setCurrentIndex,
    setStateVideos: state.setVideos,
  }))

  useEffect(() => {
    if (videos) setStateVideos(videos)
  }, [videos])

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [startIndex])

  useEffect(() => {
    if (currentIndex === 1) fetchPreviousVideos?.(currentIndex)
    if (videos && !isFetchingNextPage && currentIndex >= videos?.length - 2) fetchNextVideos()
  }, [currentIndex])

  function InnerContent() {
    if (isLoading) return <Loader size="md" />
    if (videoSizeBox && videos)
      return (
        <SinglePlayer
          videoDetails={videos[currentIndex]}
          sizeBox={{ height: videoSizeBox.video.height, width: videoSizeBox.video.width }}
        />
      )
  }

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        {videoSizeBox && videos && (
          <span className="flex items-center gap-x-6">
            <div
              style={{ width: videoSizeBox.modal.width, height: videoSizeBox.modal.height }}
              className="relative min-w-[800px] overflow-clip rounded-2xl bg-monochrome-white">
              <CustomDialogClose
                onClick={() => {
                  close?.()
                }}
                className="absolute right-4 top-4 z-10">
                <X className="h-6 w-6" />
              </CustomDialogClose>
              <InnerContent />
            </div>
            <span className="flex flex-col gap-y-4">
              <button
                onClick={() => {
                  setCurrentIndex(currentIndex - 1)
                }}
                className={cn(
                  'rounded-full bg-monochrome-white/10 p-2 hover:bg-monochrome-white/20',
                  currentIndex === 0 ? 'opacity-40' : undefined
                )}>
                <Image src={icUpArrow} alt="" />
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(currentIndex + 1)
                }}
                className={cn(
                  'rounded-full bg-monochrome-white/10 p-2 hover:bg-monochrome-white/20',
                  currentIndex === videos?.length - 1 ? 'opacity-40' : undefined
                )}>
                <Image src={icDownArrow} alt="" />
              </button>
            </span>
          </span>
        )}
      </CustomDialogContent>
    </CustomDialog>
  )
}

type ProfileProps = {
  children?: React.ReactNode
  /**
   * If video is not available than it will show loader only.
   */
  video?: VideoDataType
  /**
   * Controls if modal should open or not.
   * @default false
   */
  open: boolean
  close: () => void
  /**
   * @default true
   */
  hasNextVideo: boolean
  /**
   * @default true
   */
  hasPreviousVideo: boolean
  getNextVideo: () => void
  getPreviousVideo: () => void
}

/**
 * For profile page their is different implementation for modal component in desktop.
 * @param param0
 * @returns
 */
export function Profile({
  children,
  open = false,
  video,
  close,
  hasNextVideo = true,
  hasPreviousVideo = true,
  getNextVideo,
  getPreviousVideo,
}: ProfileProps) {
  const videoSizeBox = useVideoSizeBoxModal()

  function InnerContent() {
    if (!video) return <Loader size="md" />
    if (videoSizeBox)
      return (
        <SinglePlayer
          videoDetails={video}
          sizeBox={{ height: videoSizeBox.video.height, width: videoSizeBox.video.width }}
        />
      )
  }

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        {videoSizeBox && (
          <span className="flex items-center gap-x-6">
            <div
              style={{ width: videoSizeBox.modal.width, height: videoSizeBox.modal.height }}
              className="relative min-w-[800px] overflow-clip rounded-2xl bg-monochrome-white">
              <CustomDialogClose
                onClick={() => {
                  close?.()
                }}
                className="absolute right-4 top-4 z-10">
                <X className="h-6 w-6" />
              </CustomDialogClose>
              <InnerContent />
            </div>
            <span className="flex flex-col gap-y-4">
              <button
                onClick={hasPreviousVideo ? getPreviousVideo : undefined}
                className={cn(
                  'rounded-full bg-monochrome-white/10 p-2 ',
                  !hasPreviousVideo ? 'opacity-40' : 'hover:bg-monochrome-white/20'
                )}>
                <Image src={icUpArrow} alt="" />
              </button>
              <button
                onClick={hasNextVideo ? getNextVideo : undefined}
                className={cn(
                  'rounded-full bg-monochrome-white/10 p-2 ',
                  !hasNextVideo ? 'opacity-40' : 'hover:bg-monochrome-white/20'
                )}>
                <Image src={icDownArrow} alt="" />
              </button>
            </span>
          </span>
        )}
      </CustomDialogContent>
    </CustomDialog>
  )
}
