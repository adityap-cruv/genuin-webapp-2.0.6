'use client'
import { CustomDialog, CustomDialogContent, CustomDialogTrigger } from '@components/custom/custom-dialog'
import { useEffect } from 'react'
import { type VideoDataType } from '@lib/schemas/video'
import { useFeedModalStore } from './store'
import { Loader } from '@components/ui/loader'
import { Feed } from '@components/common/feed'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { TopBar } from '@components/layouts/mobile/top-bar'

type Props = {
  children?: React.ReactNode
  videos?: VideoDataType[]
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
  isLoading: boolean
}

export function Mobile({
  children,
  open = false,
  startIndex = 0,
  videos,
  close,
  isLoading,
  isFetchingNextPage,
  isError,
  fetchNextVideos,
}: Props) {
  const videoSizeBox = useVideoSizeBox(false)
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
    if (videos && !isFetchingNextPage && currentIndex >= videos?.length - 2) fetchNextVideos()
  }, [currentIndex])

  function InnerContent() {
    if (isLoading)
      return (
        <div style={{ width: videoSizeBox?.width, height: videoSizeBox?.height }} className="bg-monochrome-white">
          <Loader size="md" />
        </div>
      )
    if (videoSizeBox && videos)
      return (
        <Feed.mobile
          isError={false}
          videos={videos}
          isFetchingNextPage={false}
          isLoading={false}
          sizeBox={{ height: videoSizeBox.height, width: videoSizeBox.width }}
          startIndex={startIndex}
        />
      )
  }

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        {videoSizeBox && (
          <span className="flex items-center gap-x-6">
            <div className="relative h-full w-full overflow-clip bg-monochrome-white">
              <TopBar showClose className="fixed left-0 top-0" variant="trasparent" onClose={close} />
              {/* <CustomDialogClose
                onClick={() => {
                  close?.()
                }}
                className="absolute right-4 top-4 z-10">
                <X className="h-6 w-6 stroke-monochrome-white" />
              </CustomDialogClose> */}
              <InnerContent />
            </div>
          </span>
        )}
      </CustomDialogContent>
    </CustomDialog>
  )
}
