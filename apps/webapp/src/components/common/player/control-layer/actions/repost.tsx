/**
 * Component that handles reposting content.
 * Manages different behaviors for logged-in vs anonymous users,
 * and embedded vs non-embedded contexts.
 */
import { openModal } from '@lib/utils'
import icRepost from '@icons/player-controls/icon-remix.svg'
import Image from 'next/image'
import { RepostModal } from '@components/common/modals/repost'
import { repostDeepLink } from '@/lib/get-deeplink'
import { useWalletBalanceHandler } from '@/services/wallet-handler'
import { useSearchParams } from 'next/navigation'
import { ActionItem } from './action-item'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useAnalyticsTracker } from './use-analytics-event'
import { useCallback } from 'react'

type RepostActionProps = {
  /** ID of the video being reposted */
  videoId: string
  /** Slug for the video URL */
  videoSlug: string
  /** URL for sharing the video */
  shareUrl: string
}

// behavior is same for mobile and desktop.
export function RepostAction({ videoId, videoSlug, shareUrl }: RepostActionProps) {
  // Get wallet handler to check if user has enough balance for reposting
  const { handleWalletBalance } = useWalletBalanceHandler()
  // Get current user info
  const { user } = useGenuinOptions((state) => ({ user: state.user }))
  // Get URL parameters for deep linking
  const searchParams = Object.fromEntries(useSearchParams())
  // Get analytics tracker
  const { trackEvent } = useAnalyticsTracker()

  /**
   * Handle the repost action
   * - Checks wallet balance
   * - Opens modal for logged-in users, generates deep link for anonymous users
   * - Tracks analytics event
   */
  const handleRepost = useCallback(async () => {
    // handling wallet balance for reposting
    await handleWalletBalance({ action: 'repost', videoId, type: 'POST' })

    if (user) {
      // For logged-in users, open the repost modal
      RepostModal.open(videoId)
    } else {
      // For anonymous users, generate a deep link to the app
      await repostDeepLink({ videoSlug, shareUrl, searchParams }).then((generatedLink) => {
        openModal({ deepLink: generatedLink, subtitle: 'Download app to repost the video.' })
      })
    }

    // Track the repost event
    trackEvent('Repost', videoId)
  }, [])

  return (
    <ActionItem title="Repost" onClick={handleRepost}>
      <Image src={icRepost} alt="repost" height={32} width={32} />
    </ActionItem>
  )
}
