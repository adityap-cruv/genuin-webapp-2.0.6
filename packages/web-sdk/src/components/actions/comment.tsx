import { Analytics } from '@/analytics'
import { useCallback } from 'react'
import { ActionItem } from './action-item'
import { cn, formatNumber, getIconLink } from '@/utils'
import { useExpandViewContext } from '@/components/expand-view/context'

export function Comment({
  videoId,
  shareUrl,
  noOfComments,
  onCommentClick,
  isStandardWall,
  textClassName,
}: {
  videoId: string
  shareUrl: string
  noOfComments?: number
  onCommentClick?: () => void
  isStandardWall: boolean
  textClassName?: string
}) {
  const { isFullScreen, toggleCommentBox } = useExpandViewContext()

  const handleCommentClick = useCallback(() => {
    Analytics.track(Analytics.EventNames.VideoComment, {
      content_id: videoId,
    })
    if (isFullScreen) {
      toggleCommentBox()
    } else {
      if (!isStandardWall) {
        window.open(shareUrl, '_blank')
        return
      }
    }
    onCommentClick?.()
  }, [
    videoId,
    shareUrl,
    onCommentClick,
    isStandardWall,
    toggleCommentBox,
    isFullScreen,
  ])

  return (
    <div
      onClick={handleCommentClick}
      className='flex flex-col items-center'>
      <ActionItem title='Add Comments'>
        <img
          src={getIconLink('icCommentWhite')}
          height={32}
          width={32}
        />
      </ActionItem>
      <p
        className={cn(
          '__gen__sdk__text__body__2 __gen__sdk__font__weight__demi __gen__sdk__text__white',
          textClassName,
        )}>
        {formatNumber(noOfComments ?? 0)}
      </p>
    </div>
  )
}
