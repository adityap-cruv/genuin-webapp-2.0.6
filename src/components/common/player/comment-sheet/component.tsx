import { CommentSheet, CommentSheetContent, CommentSheetPortal } from '@components/custom/comment-sheet'
import { X } from 'lucide-react'
import { usePlayerControlStore } from '../player-control-store'
import { useCommentSheetStore } from './store'
import { useEffect } from 'react'
import { Comments } from '@components/common/comments'

type Props = {
  container: React.MutableRefObject<HTMLDivElement | null>
  videoId: string
}

export function Sheet({ container, videoId }: Props) {
  const { isOpen, close, currentVideoId } = useCommentSheetStore((state) => ({
    isOpen: state.modalIsOpen,
    close: state.closeModal,
    currentVideoId: state.currentVideoId,
  }))
  const { pauseVideo, playVideo } = usePlayerControlStore((state) => ({
    pauseVideo: state.pause,
    playVideo: state.play,
  }))
  const shouldOpen = isOpen && currentVideoId === videoId

  useEffect(() => {
    if (shouldOpen) {
      document.getElementById('reel-list')?.classList.add('!overflow-y-hidden')
      pauseVideo()
    } else {
      document.getElementById('reel-list')?.classList.remove('!overflow-y-hidden')
      playVideo()
    }
  }, [shouldOpen])

  return (
    <CommentSheet open={shouldOpen} modal={false}>
      <CommentSheetPortal container={container.current}>
        <CommentSheetContent
          side="bottom"
          onInteractOutside={() => {
            close()
          }}>
          <div className="h-full w-full rounded-t-[18px] bg-background sm:rounded-t-none">
            <div className="flex w-full items-center justify-between p-3">
              <p className="text-title-lg">Comments</p>
              <X
                className="h-6 w-6 cursor-pointer stroke-secondary"
                onClick={() => {
                  close()
                }}
              />
            </div>
            <Comments videoId={videoId} />
          </div>
        </CommentSheetContent>
      </CommentSheetPortal>
    </CommentSheet>
  )
}
