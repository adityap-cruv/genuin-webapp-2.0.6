import { CommentSheet, CommentSheetContent, CommentSheetPortal } from '@components/custom/comment-sheet'
import { X } from 'lucide-react'
import { usePlayerControlStore } from '../player-control-store'
import { useCommentSheetStore } from './store'
import { useEffect } from 'react'
import { Comments } from '@components/common/comments'
import { DownloadDialog } from '@components/common/download-dialog'
import Image from 'next/image'
import icAudioRecord from '@icons/audioRecord.svg'
import icVideoRecord from '@icons/videoRecord.svg'

type Props = {
  container: React.MutableRefObject<HTMLDivElement | null>
  videoId: string
  noOfComments: number
}

// Sheet is only used in mobile component for now.
export function Sheet({ container, videoId, noOfComments }: Props) {
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
          <div className="h-full w-full rounded-t-[18px] bg-background outline-none sm:rounded-t-none">
            <div className="flex h-12 w-full items-center justify-between border-b border-monochrome-9 px-3 ">
              <p className="text-body-lg text-secondary">Comments{noOfComments !== 0 ? `(${noOfComments})` : ''}</p>
              <X
                className="h-6 w-6 cursor-pointer stroke-secondary"
                onClick={() => {
                  close()
                }}
              />
            </div>
            <div style={{ height: 'calc(100% - 60px)' }}>
              <Comments.withApi videoId={videoId} />
            </div>
          </div>
          <CommentInput />
        </CommentSheetContent>
      </CommentSheetPortal>
    </CommentSheet>
  )
}

function CommentInput() {
  return (
    <div className="sticky bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 px-2 py-3 shadow-md">
      <DownloadDialog title="Get the Genuin app" subtitle="Get the app to comment on this video." asChild>
        <div className="flex w-full flex-1 items-center gap-x-4">
          <div
            placeholder="Add a comment"
            className="h-full w-2/3 rounded-full border-2 border-monochrome-9 bg-monochrome-white py-2 pl-6">
            <p className="text-start text-title-3-demi text-monochrome">Add a Comment</p>
          </div>
          <Image src={icAudioRecord} alt="audio record" className="h-8 w-8" />
          <Image src={icVideoRecord} alt="audio record" className="h-8 w-8" />
        </div>
      </DownloadDialog>
    </div>
  )
}
