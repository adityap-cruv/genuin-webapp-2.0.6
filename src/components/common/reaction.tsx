import Image from 'next/image'
import { useWalletBalanceHandler } from '@/services/wallet-handler'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { videoSpark } from '@/lib/api/video'
import { ActionItem } from './player/control-layer/actions/action-item'
import Analytics from '@/services/analytics'
import { abbreviateNumber, cn, getUrlForReaction, openModal } from '@/lib/utils'
import { sparkDeepLink } from '@/lib/get-deeplink'
import { type ComponentProps, useCallback, useState } from 'react'

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
        await sparkDeepLink(videoSlug, shareUrl).then((generatedLink) => {
          openModal({ deepLink: generatedLink, subtitle: 'Get the app to react on the video.' })
        })
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

  return (
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
      <Image
        src={getUrlForReaction(config?.reaction_type ?? 'spark', Boolean(isSparked), forComment)}
        height={iconHeight}
        width={iconWidth}
        alt="reaction"
      />
      <p className="text-body-1-demi">{abbreviateNumber(sparkCount < 0 ? 0 : sparkCount)}</p>
    </ActionItem>
  )
}
