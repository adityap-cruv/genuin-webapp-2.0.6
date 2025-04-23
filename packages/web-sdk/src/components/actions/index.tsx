import { useBaseContext } from '@/context/base'
import { cn } from '@/utils'
import { type ComponentProps } from 'react'
import { Reaction } from '../reaction'
import { Repost } from './repost'
import { Share } from './share'
import { Comment } from './comment'

type ActionComponentProps = {
  videoId: string
  shareUrl: string
  noOfSparks: number
  forMobile?: boolean
  isSparked?: boolean
  showComment?: boolean
  noOfComments?: number
  onCommentClick?: () => void
  onSpark?: (videoId: string, isSparked: boolean) => void
} & ComponentProps<'div'>

export function Actions({
  videoId,
  shareUrl,
  noOfSparks,
  showComment,
  noOfComments,
  isSparked,
  onCommentClick,
  className,
  forMobile,
  onClick,
  onSpark,
  ...restProps
}: ActionComponentProps) {
  const { customizations, toggleSpark } = useBaseContext()
  const config = customizations?.enable_engagement_tools
  const isStandardWall = customizations?.view === 'standard_wall'

  return (
    <div
      className={cn(
        'flex flex-col gap-4 items-center justify-center',
        className,
      )}
      {...restProps}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}>
      {config?.repost && (
        <Repost
          videoId={videoId}
          shareUrl={shareUrl}
          isStandardWall={isStandardWall}
        />
      )}
      {config?.spark && (
        <Reaction
          className='[&_p]:!text-white'
          noOfReactions={noOfSparks}
          contentId={videoId}
          isReacted={isSparked ?? false}
          shareUrl={shareUrl}
          onReactionStatusChange={(videoId, isReacted) => {
            if (onSpark) {
              onSpark(videoId, isReacted)
            } else {
              toggleSpark(videoId)
            }
          }}
        />
      )}
      {showComment && config?.comment && (
        <Comment
          videoId={videoId}
          shareUrl={shareUrl}
          noOfComments={noOfComments}
          onCommentClick={onCommentClick}
          isStandardWall={isStandardWall}
        />
      )}
      {config?.share && (
        <Share
          videoId={videoId}
          shareUrl={shareUrl}
        />
      )}
    </div>
  )
}
