'use client'
import {
  CustomDialog,
  CustomDialogClose,
  CustomDialogContent,
  CustomDialogTrigger,
} from '@components/custom/custom-dialog'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useFeedModalStore } from './store'
import { SinglePlayer } from '@components/common/feed/desktop'
import icUpArrow from '@icons/player-controls/icArrowUp.svg'
import icDownArrow from '@icons/player-controls/icArrowDown.svg'
import Image from 'next/image'
import { Loader } from '@components/ui/loader'
import { cn } from '@lib/utils'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

type Props = {
  children?: React.ReactNode
  videos: VideoPlayerModalType[]
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
  const sizeBox = useGenuinOptions().sizeBoxes
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

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        <span className="flex items-center gap-x-6">
          <div
            style={{ height: sizeBox.modal.height, width: sizeBox.modal.width }}
            className="relative min-w-[800px] overflow-clip rounded-2xl bg-monochrome-white">
            <CustomDialogClose
              onClick={() => {
                close?.()
              }}
              className="absolute right-4 top-4 z-10 focus:outline-none">
              <X className="h-6 w-6" />
            </CustomDialogClose>
            {isLoading ? (
              <Loader size="md" />
            ) : (
              <SinglePlayer videoData={{ ...videos[currentIndex] }} sizeBox={sizeBox.modal.player} />
            )}
          </div>
          <span className="flex flex-col gap-y-4">
            <button
              disabled={currentIndex === 0}
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
              disabled={currentIndex === videos.length - 1}
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
      </CustomDialogContent>
    </CustomDialog>
  )
}

type ProfileProps = {
  children?: React.ReactNode
  /**
   * If video is not available than it will show loader only.
   */
  video: VideoPlayerModalType
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
  const sizeBox = useGenuinOptions().sizeBoxes

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        <span className="flex items-center gap-x-6">
          <div
            style={{ width: sizeBox.modal.width, height: sizeBox.modal.height }}
            className="relative min-w-[800px] overflow-clip rounded-2xl bg-monochrome-white">
            <CustomDialogClose
              onClick={() => {
                close?.()
              }}
              className="absolute right-4 top-4 z-10">
              <X className="h-6 w-6" />
            </CustomDialogClose>
            <SinglePlayer videoData={{ ...video }} sizeBox={{ ...sizeBox.modal.player }} />
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
      </CustomDialogContent>
    </CustomDialog>
  )
}
