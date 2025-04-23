import { useAdaptiveShare } from '@/hooks/useAdaptiveShare'
import { useToast } from '../ui/use-toast'
import { useCallback } from 'react'
import { Analytics } from '@/analytics'
import { ActionItem } from './action-item'
import { getIconLink } from '@/utils'

export function Share({
  videoId,
  shareUrl,
}: {
  videoId: string
  shareUrl: string
}) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()

  const handleShareClick = useCallback(() => {
    Analytics.track(Analytics.EventNames.VideoShared, { content_id: videoId })
    shareFn({
      shareLink: shareUrl,
      toast: () => {
        toast({ description: 'Link Copied!', duration: 1000 })
      },
    })
  }, [videoId, shareUrl])

  return (
    <ActionItem title='Share'>
      <img
        src={getIconLink('icShareWhite')}
        height={32}
        width={32}
        onClick={handleShareClick}
      />
    </ActionItem>
  )
}
