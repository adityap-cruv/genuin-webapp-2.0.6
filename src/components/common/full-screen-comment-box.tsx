import React, { useRef, useMemo } from 'react'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { CloseIcon } from '@icons/close-icon'
import { usePlayerControlStore } from './player/player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { motion } from 'framer-motion'
import CommentsLayout from './comments-layout'

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

  const commentBoxContent = useMemo(
    () => (
      <>
        <div
          ref={scrollDivRef}
          className="hide-scrollbar flex h-full flex-col overflow-hidden overflow-y-scroll rounded-2xl">
          <CommentsLayout
            community={videos[currentIndex].community}
            loop={videos[currentIndex].loop}
            video={videos[currentIndex].video}
            owner={videos[currentIndex].owner}
            scrollDivRef={scrollDivRef}
          />
        </div>
      </>
    ),
    [videos, currentIndex]
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
