import { CommentSheet, CommentSheetContent } from '@components/custom/comment-sheet'
import { CloseIcon } from '@icons/close-icon'
import { useCommentSheetStore } from './store'
import { Comments } from '@components/common/comments'
import { useState } from 'react'
import { type CommentListType } from '@lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import MentionInput from '../../comments/mention-input'

type Props = {
  videoId: string
  commentCount: number
  videoDetails: VideoPlayerModalType
}

// TODO: remove comment sheet with general sheet because there is no difference between.
// TODO: Here state Comment and setComments are bad they are causing multiple rerenders.
// Sheet is only used in mobile component for now.
export function Sheet({ commentCount, videoId, videoDetails }: Props) {
  const { isOpen, close, currentVideoId } = useCommentSheetStore((state) => ({
    isOpen: state.modalIsOpen,
    close: state.closeModal,
    currentVideoId: state.currentVideoId,
  }))
  const shouldOpen = isOpen && currentVideoId === videoId
  const [comments, setComments] = useState<CommentListType>([])

  return (
    <CommentSheet open={shouldOpen} modal={true}>
      <CommentSheetContent
        onInteractOutside={() => {
          close()
        }}>
        <div className="h-full w-full rounded-t-[18px] bg-background outline-none sm:rounded-t-none">
          <div className="flex h-12 w-full items-center justify-between border-b border-monochrome-9 px-3 ">
            <p className="text-title-3-demi">Comments{commentCount ? `(${commentCount})` : ''}</p>
            <CloseIcon
              onClick={() => {
                close()
              }}
            />
          </div>
          <div style={{ height: 'calc(100% - 60px)' }}>
            <Comments.withApi
              videoId={videoId}
              slug={videoDetails.video.slug}
              videoShareUrl={videoDetails.video.shareUrl}
              comments={comments}
              setComments={setComments}
            />
          </div>
        </div>
        <MentionInput
          setComments={setComments}
          videoId={videoDetails.video.id}
          loopId={videoDetails.loop.id}
          videoSlug={videoDetails.video?.slug}
          communityId={videoDetails.community.id}
        />
      </CommentSheetContent>
    </CommentSheet>
  )
}
