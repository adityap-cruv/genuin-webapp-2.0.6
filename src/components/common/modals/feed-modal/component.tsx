'use client'
import { Feed } from '@components/common/feed'
import {
  CustomDialog,
  CustomDialogClose,
  CustomDialogContent,
  CustomDialogTrigger,
} from '@components/custom/custom-dialog'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { useVideoSizeBoxModal } from '@hooks/use-video-size-box-modal'
import { getFeed } from '@lib/api/feed'
import { type VideoDataListType } from '@lib/schemas/video'
import { useLocalStorage } from '@lib/stores/local-storage'
import { X } from 'lucide-react'

type Props = {
  children: React.ReactNode
  videos: VideoDataListType
}

export function Component({ children }: Props) {
  const videoSizeBox = useVideoSizeBoxModal()
  const userId = useLocalStorage((state) => state.userId)
  const {
    data: page,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = getFeed({ feedType: 'home', userID: userId })
  const videos = page?.pages.flatMap((item) => item.reels)
  return (
    <CustomDialog>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent showDefaultClose={false}>
        {videoSizeBox && videos && (
          <div
            style={{ width: videoSizeBox.modal.width, height: videoSizeBox.modal.height }}
            className="relative rounded-lg bg-red">
            <CustomDialogClose className="absolute right-4 top-4 z-10">
              <X className="h-6 w-6" />
            </CustomDialogClose>
            <Feed.desktop
              videos={videos}
              isError={false}
              isFetchingNextPage={false}
              isLoading={false}
              sizeBox={{ height: videoSizeBox.video.height, width: videoSizeBox.video.width }}
            />
          </div>
        )}
      </CustomDialogContent>
    </CustomDialog>
  )
}
