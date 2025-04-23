import { Analytics } from '@/analytics'
import { useAuth } from '@/context/auth'
import {
  type ComponentProps,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { AuthenticationModal } from '../authentication'
import { performSparkAction } from './api'
import {
  cn,
  formatNumber,
  getUrlForReaction,
  modReactionUrlForTheme,
} from '@/utils'
import { useBrandDetails } from '@/context/brand-details'
import { ActionItem } from '../actions/action-item'

type ReactionComponentPropsType = {
  isReacted: boolean
  contentId: string
  shareUrl: string
  iconHeight?: number
  iconWidth?: number
  noOfReactions: number
  /**
   * Pass true if using spark functionality for comment.
   */
  forComment?: boolean
  onReactionStatusChange?: (contentId: string, isSparked: boolean) => void
} & ComponentProps<'div'>

export const Reaction = memo(function Reaction({
  contentId,
  noOfReactions,
  isReacted,
  shareUrl,
  forComment,
  className,
  iconHeight,
  iconWidth,
  onReactionStatusChange,
  onClick,
  ...restProps
}: ReactionComponentPropsType) {
  const [isLoading, setIsLoading] = useState(false)
  const { embedStyle, brandDetails, customizations } = useBrandDetails()
  const { user } = useAuth()

  const handleSparkClick = useCallback(
    async (e: any) => {
      onClick?.(e)
      Analytics.track(Analytics.EventNames.VideoSpark, {
        content_id: contentId,
      })
      if (embedStyle !== 'standard_wall' && !user) {
        window.open(shareUrl, '_blank')
        return
      }

      if (!user) {
        // @ts-expect-error desc
        if (window.genuinAuth) {
          // @ts-expect-error desc
          window.genuinAuth({ path: '/', action: 'spark' })
        } else {
          AuthenticationModal.open()
        }
        return
      } else {
        // Figure what new spark is going to be.
        const newIsReacted = !isReacted
        // Figure out what new spark count is going to be.
        setIsLoading(true)
        // Update state optimistically.
        onReactionStatusChange?.(contentId, newIsReacted)

        await performSparkAction({
          contentId,
          spark: !isReacted,
          type: forComment ? 'COMMENT' : 'VIDEO',
        })
          .then((res) => {
            if (!res) {
              // Reverse the effect in case of error.
              onReactionStatusChange?.(contentId, !newIsReacted)
            }
          })
          .finally(() => {
            setIsLoading(false)
          })
      }
    },
    [isReacted, user],
  )

  const iconToShow = useMemo(() => {
    const reaction = brandDetails?.reactions
    // In case there is no reactions in config then we will show the spark icon.
    if (!reaction)
      return getUrlForReaction(
        'spark',
        isReacted,
        forComment,
        customizations?.theme,
      )

    if (forComment) {
      return isReacted
        ? reaction?.keys.comment_selected.svg
        : reaction?.keys.comment_unselected.svg
    } else {
      return isReacted
        ? reaction?.keys.feed_selected.svg
        : reaction?.keys.feed_unselected.svg
    }
  }, [brandDetails?.reactions, isReacted, forComment])

  const reactionIcon = (
    <img
      src={modReactionUrlForTheme(iconToShow, customizations?.theme)}
      style={{ height: iconHeight, width: iconWidth }}
    />
  )

  return (
    <div
      onClick={handleSparkClick}
      title='React'
      className={cn(
        'cursor-pointer text-body-1-demi flex flex-col items-center',
        isLoading && 'pointer-events-none cursor-not-allowed',
        className,
      )}
      {...restProps}>
      {forComment ? (
        reactionIcon
      ) : (
        <ActionItem title={brandDetails.reactions.tooltip ?? ''}>
          {reactionIcon}
        </ActionItem>
      )}
      <p>{formatNumber(noOfReactions)}</p>
    </div>
  )
})
