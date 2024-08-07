'use client'
import { CustomDialog, CustomDialogContent, CustomDialogTrigger } from '@components/custom/custom-dialog'
import { useEffect } from 'react'
import { useFeedModalStore } from './store'
import { Feed } from '@components/common/feed'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { UnseenMessageRibbon } from '@components/common/unseen-message-ribbon'
import { useShallow } from 'zustand/react/shallow'

type Props = {
  children?: React.ReactNode
  videos?: VideoPlayerModalType[]
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
  unreadMessageCount?: number
}

export function Mobile({
  children,
  open = false,
  startIndex = 0,
  videos,
  close,
  isLoading,
  isFetchingNextPage,
  fetchNextVideos,
  unreadMessageCount,
}: Props) {
  const { currentIndex, setCurrentIndex, setStateVideos } = useFeedModalStore(
    useShallow((state) => ({
      currentIndex: state.currentIndex,
      setCurrentIndex: state.setCurrentIndex,
      setStateVideos: state.setVideos,
    }))
  )

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
    if (isLoading || !videos) {
      return (
        <div className="absolute inset-0">
          <FeedShimmer.mobile />
        </div>
      )
    }

    return (
      <Feed.mobile
        isError={false}
        videos={videos}
        isFetchingNextPage={false}
        isLoading={false}
        startIndex={startIndex}
      />
    )
  }

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        <div className="relative h-full w-full overflow-clip bg-monochrome-white">
          <TopBar showClose className="fixed left-0 top-0" variant="transparent" onClose={close} />
          {/* Please done modify below condition to  unreadMessageCount && unreadMessageCount !== 0,
             it is creating the problem on showing the 0 on the UI */}
          {unreadMessageCount !== 0 && (
            <div className="absolute inset-0 z-10 flex h-fit w-full items-center justify-center ">
              <UnseenMessageRibbon messageCount={unreadMessageCount ?? 0} />
            </div>
          )}
          <InnerContent />
        </div>
      </CustomDialogContent>
    </CustomDialog>
  )
}
