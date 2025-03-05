import React, { type RefObject, useEffect, useState } from 'react'
import MentionInput from './comments/mention-input'
import { type CommentListType } from '@/lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { getVideosComments } from '@/lib/api/loop'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { FeedShimmer } from './shimmers/feed-shimmer'
import { Comments, NoComments, updateCommentReactionData } from './comments'

type DesktopDetailsProps = VideoPlayerModalType & { scrollDivRef: React.RefObject<HTMLDivElement> }

const CommentsLayout = ({ video, loop, community, owner, scrollDivRef }: DesktopDetailsProps) => {
  const [comments, setComments] = useState<CommentListType>([])

  return (
    <>
      <div className="sticky top-0 z-10">
        <p className="border-b border-t border-tertiary-200 bg-monochrome-white px-4 py-3 text-title-3-demi">
          Comments {video.commentCount !== 0 ? `(${video.commentCount})` : ''}
        </p>
      </div>
      <div className="h-full px-4 pt-2">
        <CommentBox
          videoId={video.id}
          slug={video.slug}
          videoShareUrl={video.shareUrl}
          parentRef={scrollDivRef}
          setComments={setComments}
          comments={comments}
        />
      </div>
      <MentionInput
        setComments={setComments}
        videoId={video.id}
        loopId={loop.id}
        videoSlug={video.slug}
        communityId={community.id}
        className="rounded-2xl"
      />
    </>
  )
}

function CommentBox({
  videoId,
  slug,
  videoShareUrl,
  parentRef,
  setComments,
  comments,
}: {
  videoId: string
  slug: string
  videoShareUrl: string
  parentRef: RefObject<HTMLDivElement>
  setComments: any
  comments: any
}) {
  const {
    data: commentPages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = getVideosComments(videoId)

  useEffect(() => {
    setComments(commentPages?.pages.flatMap((item) => item.comments))
  }, [commentPages])

  const { scrollYProgress } = useScroll({ container: parentRef, layoutEffect: false })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    value = Number(value.toFixed(1))
    if (value >= 0.8) void fetchNextPage()
  })

  if (isLoading) {
    return <FeedShimmer.comments iterations={2} />
  }

  if (comments && comments?.length !== 0)
    return (
      <div className="h-full overflow-visible">
        <Comments.withoutApi
          comments={comments}
          fetchNextPage={() => {}}
          hasNextPage={hasNextPage}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          videoId={videoId}
          slug={slug}
          videoShareUrl={videoShareUrl}
          onCommentReactionChange={(commentId, isReacted) => {
            updateCommentReactionData(videoId, commentId, isReacted)
          }}
        />
      </div>
    )

  return (
    <div className="h-full pb-20">
      <NoComments />
    </div>
  )
}

export default CommentsLayout
