import React, { type RefObject, useMemo } from 'react'
import MentionInput from './mention-input'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { getVideosComments } from '@/lib/api/loop'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { Comments, NoComments, updateCommentReactionData } from '.'

type DesktopDetailsProps = VideoPlayerModalType & { scrollDivRef: React.RefObject<HTMLDivElement> }

const CommentsLayout = ({ video, loop, community, owner, scrollDivRef }: DesktopDetailsProps) => {
  return (
    <>
      <div className="sticky top-0 z-10">
        <p className="border-tertiary-200 bg-monochrome-white text-title-3-demi border-t border-b px-4 py-3">
          Comments {video.commentCount !== 0 ? `(${video.commentCount})` : ''}
        </p>
      </div>
      <div className="h-full px-4 pt-2">
        <CommentBox videoId={video.id} slug={video.slug} videoShareUrl={video.shareUrl} parentRef={scrollDivRef} />
      </div>
      <MentionInput videoId={video.id} loopId={loop.id} videoSlug={video.slug} communityId={community.id} />
    </>
  )
}

function CommentBox({
  videoId,
  slug,
  videoShareUrl,
  parentRef,
}: {
  videoId: string
  slug: string
  videoShareUrl: string
  parentRef: RefObject<HTMLDivElement>
}) {
  const {
    data: commentPages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = getVideosComments(videoId)

  const { scrollYProgress } = useScroll({ container: parentRef, layoutEffect: false })

  const comments = useMemo(() => commentPages?.pages.flatMap((page) => page.comments), [commentPages])

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    value = Number(value.toFixed(1))
    if (value >= 0.8) void fetchNextPage()
  })

  if (isLoading) {
    return <FeedShimmer.comments iterations={2} />
  }

  if (isError || !comments || comments.length === 0)
    return (
      <div className="h-full pb-20">
        <NoComments />
      </div>
    )

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
}

export default CommentsLayout
