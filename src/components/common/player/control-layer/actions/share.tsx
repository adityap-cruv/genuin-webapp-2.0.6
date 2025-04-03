/**
 * Component that handles sharing content.
 * Uses platform-specific sharing functionality or opens in a new tab for embedded contexts.
 */
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import icShare from '@icons/player-controls/icon-share.svg'
import Image from 'next/image'
import { ActionItem } from './action-item'
import { useAnalyticsTracker } from './use-analytics-event'

type ShareActionProps = {
  /** ID of the video being shared */
  videoId: string
  /** URL for sharing the video */
  shareUrl: string
  /** Optional description text for the share */
  description?: string | null
}

// Same for mobile and desktop
export function ShareAction({ videoId, shareUrl, description }: ShareActionProps) {
  // Get platform-adaptive share function
  const { shareFn } = useAdaptiveShare()
  // Get toast notification function
  const { toast } = useToast()
  // Get analytics tracker
  const { trackEvent } = useAnalyticsTracker()

  /**
   * Handle the share action
   * - Opens URL in new tab for embedded context
   * - Uses platform-specific share API for non-embedded context
   * - Shows toast notification when link is copied
   * - Tracks analytics event
   */
  const handleShare = async () => {
    // For non-embedded context, use platform share API
    await shareFn({
      description: description ?? '',
      title: description ?? '',
      shareLink: shareUrl,
      toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
    })

    // Track the share event
    trackEvent('Video Shared', videoId)
  }

  return (
    <ActionItem title="Share" onClick={handleShare}>
      <Image src={icShare} alt="share" height={32} width={32} />
    </ActionItem>
  )
}
