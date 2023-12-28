'use client'
import { Feed } from '@components/common/feed'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataListType } from '@lib/schemas/video'
import { X } from 'lucide-react'

type Props = {
  children: React.ReactNode
  videos: VideoDataListType
}

export function Component({ children, videos }: Props) {
  const videoSizeBox = useVideoSizeBox(false)
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="h-full w-full overflow-auto">
        {videoSizeBox && (
          <div style={{ height: videoSizeBox.height, width: videoSizeBox.width * 2 }}>
            <Feed.desktop
              sizeBox={videoSizeBox}
              isError={false}
              isFetchingNextPage={false}
              isLoading={false}
              videos={videos}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
