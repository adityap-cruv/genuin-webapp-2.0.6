/**
 * Component that handles the comment action.
 * Only displayed when in fullscreen mode, and toggles the comment box when clicked.
 */
import { abbreviateNumber } from '@lib/utils'
import icComment from '@icons/player-controls/icon-comment.svg'
import Image from 'next/image'
import { ActionItem } from './action-item'
import { usePlayerControlStore } from '../../player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useCallback } from 'react'
import { useCommentSheetStore } from '../../comment-sheet/store'
import { useAnalyticsTracker } from './use-analytics-event'

type CommentActionProps = {
  videoId: string
  /** Number of comments on the content */
  commentCount?: number
}

export function CommentAction({ commentCount, videoId }: CommentActionProps) {
  const { isMobile } = useGenuinOptions()
  const { trackEvent } = useAnalyticsTracker()
  // Get player control state using shallow comparison to prevent unnecessary rerenders
  const { isFullScreen, toggleCommentBox } = usePlayerControlStore(
    useShallow((state) => ({
      isFullScreen: state.isFullScreen,
      toggleCommentBox: state.toggleCommentBox,
    }))
  )
  const { openComments, closeComments, commentsIsOpen } = useCommentSheetStore(
    useShallow((state) => ({
      openComments: state.openModal,
      closeComments: state.closeModal,
      commentsIsOpen: state.modalIsOpen,
    }))
  )

  // Callback to handle comment button click
  const handleCommentButtonClick = useCallback(() => {
    // If in mobile mode, toggle the comment box
    if (isMobile) {
      // If in mobile mode, toggle the comment box
      // If comments are open, close them; otherwise, open them
      if (commentsIsOpen) {
        closeComments()
      } else {
        openComments(videoId)
      }
    } else {
      if (!isFullScreen) {
        // If not in fullscreen mode, toggle the comment box
        toggleCommentBox()
      }
    }
    // Track the comment button click event
    trackEvent('RT Comment Clicked', videoId, {
      properties: {
        content_category: 'loop',
        event_record_screen: 'feed',
        event_target_screen: 'none',
      },
    })
  }, [isMobile, toggleCommentBox, commentsIsOpen, isMobile, isFullScreen])

  // Only show comment button in fullscreen mode
  if (!isFullScreen && !isMobile) return null

  return (
    <div>
      {/* Comment button that toggles the comment box */}
      <ActionItem title="Add Comments" onClick={handleCommentButtonClick}>
        <Image src={icComment} alt="comments" height={32} width={32} />
      </ActionItem>
      {/* Display comment count with abbreviation for large numbers */}
      <p className="flex justify-center text-body-1-demi text-monochrome-white">
        {abbreviateNumber(commentCount ?? 0)}
      </p>
    </div>
  )
}
