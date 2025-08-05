import { Analytics } from '@/analytics'
import { useAuth } from '@/context/auth'
import {
  type ComponentProps,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { performSparkAction } from './api'
import {
  cn,
  formatNumber,
  getUrlForReaction,
  modReactionUrlForTheme,
} from '@/utils'
import { useBrandDetails } from '@/context/brand-details'
import { ActionItem } from '../actions/action-item'
import { sparkDeepLink } from '../download-app/get-deeplink'
import { useModalHandler } from '@/hooks/useModalHandler'
import { useBaseContext } from '@/context/base'
import { ActionPopover } from '../action-popover'
import { useSizeContext } from '@/context/size'

type ReactionComponentPropsType = {
  isReacted: boolean
  contentId: string
  videoSlug?: string
  shareUrl: string
  iconHeight?: number
  iconWidth?: number
  noOfReactions: number
  textClassName?: string
  /**
   * Pass true if using spark functionality for comment.
   */
  forComment?: boolean
  onReactionStatusChange?: (contentId: string, isSparked: boolean) => void
} & ComponentProps<'div'>

export const Reaction = memo(function Reaction({
  contentId,
  videoSlug,
  noOfReactions,
  isReacted,
  shareUrl,
  forComment,
  className,
  iconHeight,
  iconWidth,
  onReactionStatusChange,
  onClick,
  textClassName,
  ...restProps
}: ReactionComponentPropsType) {
  const [isLoading, setIsLoading] = useState(false)
  const { action, toggleAction, embedData } = useBaseContext()
  const { embedStyle, brandDetails, customizations } = useBrandDetails()
  const { user } = useAuth()
  const { openModal } = useModalHandler()
  const { isMobile } = useSizeContext()

  const performReactionAction = async () => {
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

  useEffect(() => {
    if (action && action === 'spark' && user) {
      performReactionAction()
      toggleAction()
    }
  }, [action])

  const returnQueryParams = useCallback((): string => {
    try {
      if (typeof shareUrl === 'string') {
        const url = new URL(shareUrl)
        url.searchParams.set('action', 'spark')
        if (videoSlug) url.searchParams.set('video', videoSlug)
        return url.search.substring(1) // Remove the leading '?'
      }
      return ''
    } catch (e) {
      return ''
    }
  }, [shareUrl, videoSlug])

  const handleSparkClick = useCallback(
    async (e: any) => {
      onClick?.(e)
      Analytics.track(Analytics.EventNames.VideoSpark, {
        content_id: contentId,
      })
      if (window.genuinAuth && !user) {
        window.genuinAuth({
          path: '/',
          action: 'spark',
          returnQueryParams: returnQueryParams(),
        })
      } else if (embedStyle !== 'standard_wall' && !user) {
        window.open(shareUrl, '_blank')
        return
      } else if (!user) {
        await sparkDeepLink(
          videoSlug ?? '',
          shareUrl,
          brandDetails.reactions.suffix,
          brandDetails.reactions.title,
        ).then((generatedLink) => {
          openModal({
            deepLink: generatedLink,
            subtitle: `Download app to ${brandDetails?.reactions?.title + ' ' + brandDetails?.reactions?.suffix} the video.`,
          })
        })
        return
      } else {
        // Figure what new spark is going to be.
        performReactionAction()
      }
    },
    [isReacted, user, contentId],
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

  if (
    brandDetails.brand_id === 2357 &&
    !user &&
    (embedData?.authInfo?.signInUrl || embedData?.authInfo?.signUpUrl) &&
    isMobile
  ) {
    return (
      <ActionPopover
        offSet={
          forComment
            ? window.innerWidth * 0.037
            : window.innerWidth - window.innerWidth * 0.17
        }
        content={forComment ? 'to like this comment.' : 'to like this Short.'}
        children={
          <div
            title='React'
            className={cn(
              'cursor-pointer text-body-1-demi flex flex-col items-center',
              isLoading && 'pointer-events-none cursor-not-allowed',
              className,
            )}
            {...restProps}>
            {forComment ? (
              reactionIcon
            ) : isMobile ? (
              <>{reactionIcon}</>
            ) : (
              <div className='p-2 rounded-full bg-secondary-400 cursor-pointer'>
                {reactionIcon}
              </div>
            )}
            <p className={cn(textClassName)}>{formatNumber(noOfReactions)}</p>
          </div>
        }
        params={returnQueryParams()}
      />
    )
  }

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
      <p className={cn(textClassName)}>{formatNumber(noOfReactions)}</p>
    </div>
  )
})
