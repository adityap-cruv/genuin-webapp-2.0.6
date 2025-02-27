import React, { useRef, useState, useEffect, useMemo } from 'react'
import { CommentBox } from './feed/desktop-details'
import MentionInput from './comments/mention-input'
import { type CommentListType } from '@/lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { CloseIcon } from '@icons/close-icon'
import { usePlayerControlStore } from './player/player-control-store'
import { useShallow } from 'zustand/react/shallow'

interface FullScreenCommentBoxProps {
  videos: VideoPlayerModalType[]
  currentIndex: number
}

const FullScreenCommentBox = ({ videos, currentIndex }: FullScreenCommentBoxProps) => {
  const { toggleCommentBox, isCommentBoxOpen } = usePlayerControlStore(
    useShallow((state) => ({
      toggleCommentBox: state.toggleCommentBox,
      isCommentBoxOpen: state.isCommentBoxOpen,
    }))
  )
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<CommentListType>([])
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1280)

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsMobileView(window.innerWidth < 1280)
      }, 100) // Debounce effect
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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

  return isMobileView ? (
    <Dialog open={isCommentBoxOpen}>
      <DialogContent showClose={false} className="mb-4 w-full min-w-[500px] p-0 sm:h-3/4 sm:p-0">
        <DialogClose className="absolute right-4 top-4 z-20 outline-none">
          <CloseIcon onClick={toggleCommentBox} />
        </DialogClose>
        {commentBoxContent}
      </DialogContent>
    </Dialog>
  ) : (
    <div className="relative my-4 min-w-[350px] rounded-2xl bg-monochrome-white pb-16 pl-2 xl:w-3/12">
      {commentBoxContent}
    </div>
  )
}

export default FullScreenCommentBox
