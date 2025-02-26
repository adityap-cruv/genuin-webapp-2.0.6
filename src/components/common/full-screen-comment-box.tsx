import React, { useRef, useState } from 'react'
import { CommentBox } from './feed/desktop-details'
import MentionInput from './comments/mention-input'
import { type CommentListType } from '@/lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'

interface FullScreenCommentBoxProps {
  videos: VideoPlayerModalType[]
  currentIndex: number
}

const FullScreenCommentBox = ({ videos, currentIndex }: FullScreenCommentBoxProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<CommentListType>([])
  return (
    <div className="relative aspect-reel h-full rounded-2xl bg-monochrome-white pb-16 pl-2">
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
    </div>
  )
}

export default FullScreenCommentBox
