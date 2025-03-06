import { useWalletBalanceHandler } from '@/services/wallet-handler'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { videoSpark } from '@/lib/api/video'
import { ActionItem } from './player/control-layer/actions/action-item'
import Analytics from '@/services/analytics'
import { abbreviateNumber, cn, getUrlForReaction, openModal } from '@/lib/utils'
import { sparkDeepLink } from '@/lib/get-deeplink'
import { type ComponentProps, useCallback, useMemo, useState } from 'react'

type ReactionsComponentProps = {
  isSparked: boolean
  sparkCount: number
  contentId: string
  shareUrl: string
  videoSlug: string
  iconHeight?: number
  iconWidth?: number
  /**
   * Pass true if using spark functionality for comment.
   */
  forComment?: boolean
  onSparkChange: (isSparked: boolean) => void
} & ComponentProps<'div'>

export function Reaction({
  isSparked = false,
  sparkCount,
  contentId,
  shareUrl,
  videoSlug,
  forComment = false,
  iconHeight = 32,
  iconWidth = 32,
  className,
  onClick,
  onSparkChange,
  ...restProps
}: ReactionsComponentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { handleWalletBalance } = useWalletBalanceHandler()
  const { user, config } = useGenuinOptions()

  const handleSparkClick = useCallback(async () => {
    if (window.location.pathname.includes('embed')) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
      return
    }

    try {
      setIsLoading(true)
      // If there is no user then we will show the deep link modal.
      if (user) {
        // This call toggle spark status of particular video.
        const response = await videoSpark(contentId, forComment ? 'COMMENT' : 'VIDEO', !isSparked)
        if (response) {
          onSparkChange?.(!isSparked)
        }
      } else {
        // This call will generate the deep link for the video.
        await sparkDeepLink(videoSlug, shareUrl, config.reactions.suffix, config.reactions.title).then(
          (generatedLink) => {
            openModal({
              deepLink: generatedLink,
              subtitle: `Get the app to ${config?.reactions?.title + ' ' + config?.reactions?.suffix} the video.`,
            })
          }
        )
      }

      // If user is not logged in then we will not call the wallet balance api.
      if (!isSparked && user && !forComment) {
        void handleWalletBalance({ action: 'spark', videoId: contentId, type: 'POST' })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setIsLoading(false)
    }

    const properties = {
      content_category: 'loop',
      content_id: contentId,
      event_record_screen: 'feed',
      event_target_screen: 'none',
      user_id: user?.id,
    }

    // TODO: Ask for comment spark action.
    void Analytics.track({
      eventName: 'Spark',
      properties,
    })
  }, [user, isSparked, contentId, onSparkChange, forComment])

  const iconToShow = useMemo(() => {
    const reaction = config?.reactions

    // In case there is no reactions in config then we will show the spark icon.
    if (!reaction) return getUrlForReaction('spark', isSparked, forComment)

    if (forComment) {
      return isSparked ? reaction?.keys.comment_selected.svg : reaction?.keys.comment_unselected.svg
    } else {
      return isSparked ? reaction?.keys.feed_selected.svg : reaction?.keys.feed_unselected.svg
    }
  }, [config?.reactions, isSparked, forComment])

  return (
    <div>
      <ActionItem
        title="React on the video!"
        className={cn(
          'flex cursor-pointer flex-col items-center text-monochrome-white',
          isLoading && 'pointer-events-none',
          className
        )}
        onClick={async (e) => {
          onClick?.(e)
          await handleSparkClick()
        }}
        {...restProps}>
        <img
          src={iconToShow}
          style={{ height: iconHeight, width: iconWidth }}
          height={iconHeight}
          width={iconWidth}
          alt="reaction"
        />
      </ActionItem>
      <p className="flex justify-center text-body-1-demi text-monochrome-white">
        {abbreviateNumber(sparkCount < 0 ? 0 : sparkCount)}
      </p>
    </div>
  )
}
