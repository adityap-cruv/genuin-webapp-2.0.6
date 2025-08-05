import { useBaseContext } from '@/context/base'
import { cn, isCheckFifthVideoType } from '@/utils'
import { type ComponentProps } from 'react'
import { Reaction } from '../reaction'
import { Repost } from './repost'
import { Share } from './share'
import { Comment } from './comment'
import { Menu } from './menu'

type ActionComponentProps = {
  videoId: string
  videoSlug: string
  shareUrl: string
  noOfSparks: number
  forMobile?: boolean
  isSparked?: boolean
  showComment?: boolean
  noOfComments?: number
  videoShareUrl: string
  onCommentClick?: () => void
  onSpark?: (videoId: string, isSparked: boolean) => void
} & ComponentProps<'div'>

export function Actions({
  videoId,
  videoSlug,
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
  videoShareUrl,
  ...restProps
}: ActionComponentProps) {
  const { customizations, brandDetails, toggleSpark } = useBaseContext()
  const config = customizations?.enable_engagement_tools
  const isStandardWall = customizations?.view === 'standard_wall'
  return (
    <div
      className={cn(
        'flex flex-col gap-4 items-center justify-center z-40',
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
          shareUrl={videoShareUrl}
          isStandardWall={isStandardWall}
          videoSlug={videoSlug}
        />
      )}
      {config?.spark && (
        <Reaction
          className='[&_p]:!text-white'
          noOfReactions={noOfSparks}
          contentId={videoId}
          isReacted={isSparked ?? false}
          shareUrl={videoShareUrl}
          iconWidth={
            isCheckFifthVideoType(brandDetails?.brand_id) &&
            customizations?.view === 'carousel'
              ? 32
              : 36
          }
          {...(isCheckFifthVideoType(brandDetails?.brand_id) &&
          customizations?.view === 'carousel'
            ? { iconHeight: 32 }
            : {})}
          videoSlug={videoSlug}
          onReactionStatusChange={(videoId, isReacted) => {
            if (onSpark) {
              onSpark(videoId, isReacted)
            } else {
              toggleSpark(videoId)
            }
          }}
          textClassName={
            isCheckFifthVideoType(brandDetails?.brand_id) &&
            customizations?.view === 'carousel'
              ? 'text-[14px]'
              : ''
          }
        />
      )}
      {showComment && config?.comment && (
        <Comment
          videoId={videoId}
          shareUrl={videoShareUrl}
          noOfComments={noOfComments}
          onCommentClick={onCommentClick}
          isStandardWall={isStandardWall}
          textClassName={
            isCheckFifthVideoType(brandDetails?.brand_id) &&
            customizations?.view === 'carousel'
              ? 'text-[14px]'
              : ''
          }
        />
      )}
      {config?.share && (
        <Share
          videoId={videoId}
          shareUrl={shareUrl}
        />
      )}
      <Menu
        contentId={videoId}
        shareUrl={videoShareUrl}
        videoSlug={videoSlug}
      />
    </div>
  )
}
