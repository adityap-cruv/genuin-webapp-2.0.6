/**
 * Main component that composes all action items for the desktop view.
 * This is a composite component that coordinates the individual action components,
 * managing their arrangement and passing the appropriate props to each.
 */
import React, { type ComponentProps } from 'react'
import { LinkAction } from './link'
import { RepostAction } from './repost'
import { ReactionAction } from './reaction'
import { CommentAction } from './comment'
import { ShareAction } from './share'
import { useFeedListContext } from '@/components/providers/feed-provider'
import { cn } from '@/lib/utils'
import { MenuAction } from './menu'

type ActionsProps = {
  /** Number of reactions/sparks on the content */
  sparkCount: number
  /** ID of the video */
  videoId: string
  /** URL for sharing the video */
  shareUrl: string
  /** Slug for the video URL */
  videoSlug: string
  /** Optional link attached to the video */
  attachedLink?: string | null
  /** Optional description text for the video */
  description?: string | null
  /** Whether the current user has already reacted to this content */
  isSparked?: boolean | null | undefined
  /** Number of comments on the video */
  commentCount?: number
} & ComponentProps<'div'>
export function Actions({
  shareUrl,
  sparkCount,
  videoId,
  videoSlug,
  attachedLink,
  description,
  isSparked,
  commentCount,
  className,
  onClick,
  ...restProps
}: ActionsProps) {
  // Get the function to update spark status in the feed list
  const { updateSparkStatus } = useFeedListContext()
  return (
    <div
      className={cn('flex w-10 flex-col items-center gap-2', className)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      {...restProps}>
      {/* Link action - only shown if there's an attached link */}
      {attachedLink && <LinkAction attachedLink={attachedLink} />}

      {/* Repost action */}
      <RepostAction videoId={videoId} videoSlug={videoSlug} shareUrl={shareUrl} />

      {/* Reaction (spark) action with count display */}
      <ReactionAction
        isSparked={isSparked}
        sparkCount={sparkCount}
        contentId={videoId}
        shareUrl={shareUrl}
        videoSlug={videoSlug}
        onSparkChange={(isSparked) => {
          // Update the spark status in the feed context when changed
          updateSparkStatus(videoId, isSparked)
        }}
      />

      {/* Comment action - only shown in fullscreen mode */}
      <CommentAction commentCount={commentCount} videoId={videoId} />

      {/* Share action */}
      <ShareAction videoId={videoId} shareUrl={shareUrl} description={description} />

      <MenuAction contentId={videoId} shareUrl={shareUrl} videoSlug={videoSlug} />
    </div>
  )
}
