import React, { useRef, useState, useMemo } from 'react'
import { CommentBox } from './feed/desktop-details'
import MentionInput from './comments/mention-input'
import { type CommentListType } from '@/lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { CloseIcon } from '@icons/close-icon'
import { usePlayerControlStore } from './player/player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { motion } from 'framer-motion'

interface FullScreenCommentBoxProps {
  videos: VideoPlayerModalType[]
  currentIndex: number
  isMobileCommentView: boolean
}

const FullScreenCommentBox = ({ videos, currentIndex, isMobileCommentView }: FullScreenCommentBoxProps) => {
  const { toggleCommentBox, isCommentBoxOpen } = usePlayerControlStore(
    useShallow((state) => ({
      toggleCommentBox: state.toggleCommentBox,
      isCommentBoxOpen: state.isCommentBoxOpen,
    }))
  )
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<CommentListType>([])

  const commentBoxContent = useMemo(
    () => (
      <>
        <div ref={scrollDivRef} className="flex flex-col overflow-auto overflow-x-clip rounded-2xl">
          <div className="sticky top-0 z-10">
            <p className="border-b border-t border-tertiary-200 bg-monochrome-white px-4 py-3 text-title-3-demi">
              Comments{' '}
              {videos[currentIndex].video.commentCount !== 0 ? `(${videos[currentIndex].video.commentCount})` : ''}
            </p>
          </div>
          <div className="h-full px-4 pt-2">
            <CommentBox
              videoId={videos[currentIndex].video.id}
              slug={videos[currentIndex].video.slug}
              videoShareUrl={videos[currentIndex].video.shareUrl}
              parentRef={scrollDivRef}
              setComments={setComments}
              comments={comments}
            />
          </div>
        </div>
        <MentionInput
          setComments={setComments}
          videoId={videos[currentIndex].video.id}
          loopId={videos[currentIndex].loop.id}
          videoSlug={videos[currentIndex].video.slug}
          communityId={videos[currentIndex].community.id}
          className="rounded-2xl"
        />
      </>
    ),
    [comments, videos, currentIndex]
  )

  return isMobileCommentView ? (
    <Dialog open={isCommentBoxOpen}>
      <DialogContent showClose={false} className="mb-4 w-full min-w-[500px] p-0 sm:h-3/4 sm:p-0">
        <DialogClose className="absolute right-4 top-4 z-20 outline-none">
          <CloseIcon onClick={toggleCommentBox} />
        </DialogClose>
        {commentBoxContent}
      </DialogContent>
    </Dialog>
  ) : (
    <motion.div
      key="fullscreen-comment-box"
      className="h-full "
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}>
      <div
        style={{
          height: 'calc(100% - 32px)',
        }}
        className="relative my-4 rounded-2xl bg-monochrome-white pb-16 pl-2">
        {commentBoxContent}
      </div>
    </motion.div>
  )
}

export default FullScreenCommentBox
