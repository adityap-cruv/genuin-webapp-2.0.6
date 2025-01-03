import Image from 'next/image'
import { useWalletBalanceHandler } from '@/services/wallet-handler'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useFeedListContext } from '@/components/providers/feed-provider'
import { videoSpark } from '@/lib/api/video'
import { ActionItem } from './action-item'
import Analytics from '@/services/analytics'
import icSpark from '@icons/player-controls/icBulb.svg'
import icSparkTrue from '@icons/player-controls/icSparkTrue.svg'
import { abbreviateNumber, openGeneratedLink, openModal } from '@/lib/utils'
import { sparkDeepLink } from '@/lib/get-deeplink'
import { useCallback } from 'react'

type SparkComponentProps = {
  isSparked?: boolean | null
  sparkCount: number
  videoId: string
  shareUrl: string
  videoSlug: string
}

export function Spark({ isSparked = false, sparkCount, videoId, shareUrl, videoSlug }: SparkComponentProps) {
  const { handleWalletBalance } = useWalletBalanceHandler()
  const { user, isMobile } = useGenuinOptions()
  const { updateSparkStatus } = useFeedListContext()

  const handleSparkClick = useCallback(async () => {
    if (window.location.pathname.includes('embed')) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
      return
    }

    try {
      // If there is no user then we will show the deep link modal.
      if (user) {
        // This call toggle spark status of particular video.
        const response = await videoSpark(videoId, 2, !isSparked)
        if (response.code === 200) {
          updateSparkStatus(videoId, !isSparked)
        }
      } else {
        // This call will generate the deep link for the video.
        await sparkDeepLink(videoSlug, shareUrl).then((generatedLink) => {
          if (!isMobile) {
            openModal({ deepLink: generatedLink, subtitle: 'Get the app to spark the video.' })
          } else {
            openGeneratedLink(generatedLink)
          }
        })
      }

      // If user is not logged in then we will not call the wallet balance api.
      if (!isSparked && user) {
        void handleWalletBalance({ action: 'spark', videoId, type: 'POST' })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }

    const properties = {
      content_category: 'loop',
      content_id: videoId,
      event_record_screen: 'feed',
      event_target_screen: 'none',
      user_id: user?.id,
    }
    void Analytics.track({
      eventName: 'Spark',
      properties,
    })
  }, [user, isSparked, videoId])

  return (
    <ActionItem title="Give spark!" onClick={handleSparkClick}>
      <Image src={isSparked ? icSparkTrue : icSpark} height={32} width={32} alt="spark" />
      <p className="flex justify-center text-body-1-demi text-monochrome-white">{abbreviateNumber(sparkCount)}</p>
    </ActionItem>
  )
}
