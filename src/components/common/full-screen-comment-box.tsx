import React, { useRef, useState, useEffect } from 'react'
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
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1080)
    }

    handleResize() // Initialize on mount
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const commentBoxContent = (
    <>
      <div ref={scrollDivRef} className="flex h-full flex-col overflow-auto overflow-x-clip rounded-2xl">
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
      />
    </>
  )

  return isMobileView ? (
    <Dialog open={isMobileView && isCommentBoxOpen}>
      <DialogContent showClose={false} className="mb-4 h-1/2 min-w-[500px] max-w-md">
        <DialogClose className="absolute right-4 top-4 z-20 outline-none">
          <CloseIcon
            onClick={() => {
              toggleCommentBox()
            }}
          />
        </DialogClose>
        {commentBoxContent}
      </DialogContent>
    </Dialog>
  ) : (
    <div className="relative h-full w-full rounded-2xl bg-monochrome-white pb-16 pl-2 lg:w-3/12">
      {commentBoxContent}
    </div>
  )
}

export default FullScreenCommentBox
