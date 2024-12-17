import Image from 'next/image'
import { useWalletBalanceHandler } from '@/services/wallet-handler'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useFeedListContext } from '@/components/providers/feed-provider'
import { videoSpark } from '@/lib/api/video'
import { ActionItem } from './action-item'
import Analytics from '@/services/analytics'
import icSpark from '@icons/player-controls/icBulb.svg'
import icSparkTrue from '@icons/player-controls/icSparkTrue.svg'
import { abbreviateNumber, openModal } from '@/lib/utils'
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
  const { user } = useGenuinOptions()
  const { updateSparkStatus } = useFeedListContext()

  function toggleVideoSpark() {
    void videoSpark(videoId, 2, !isSparked)
      .then((res) => {
        if (res.code === 200) {
          updateSparkStatus(videoId, !isSparked)
        }
      })
      .catch((e) => {
        console.error('error in sparking ::', e)
      })
  }

  const handleSparkClick = useCallback(async () => {
    if (window.location.pathname.includes('embed')) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
      return
    }
    console.log('handleSparkClick')
    user
      ? toggleVideoSpark()
      : await sparkDeepLink(videoSlug, shareUrl).then((generatedLink) => {
          openModal({ deepLink: generatedLink, subtitle: 'Get the app to spark the video.' })
        })

    if (!isSparked) {
      void handleWalletBalance({ action: 'spark', videoId, type: 'POST' })
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
