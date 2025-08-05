import { Analytics } from '@/analytics'
import { useAuth } from '@/context/auth'
import { useCallback } from 'react'
import { getIconLink } from '@/utils'
import {
  useRepostModalContext,
  RepostModalProvider,
} from '@/components/repost/context'
import { ActionItem } from './action-item'
import { RepostModal } from '../repost'
import { repostDeepLink } from '../download-app/get-deeplink'
import { useModalHandler } from '@/hooks/useModalHandler'
import { useSearchParams } from 'wouter'

function RepostComponent({
  videoId,
  isStandardWall,
  shareUrl,
  videoSlug,
}: {
  videoId: string
  isStandardWall: boolean
  shareUrl: string
  videoSlug: string
}) {
  const { user } = useAuth()
  const { open: repostModalOpen } = useRepostModalContext()
  const searchParams = useSearchParams()
  const { openModal } = useModalHandler()

  const handleRepostClick = useCallback(async () => {
    Analytics.track(Analytics.EventNames.VideoRepost, { content_id: videoId })
    if (window.genuinAuth && !user) {
      window.genuinAuth({ path: '/', action: 'repost' })
    } else if (!isStandardWall && !user) {
      window.open(shareUrl, '_blank')
      return
    } else if (user) {
      repostModalOpen(videoId)
    } else {
      await repostDeepLink({ videoSlug, shareUrl, searchParams }).then(
        (generatedLink) => {
          openModal({
            deepLink: generatedLink,
            subtitle: 'Download app to repost the video.',
          })
        },
      )
    }
  }, [user, isStandardWall])

  return (
    <ActionItem title='Repost'>
      <img
        src={getIconLink('icRepostWhite')}
        height={32}
        width={32}
        onClick={handleRepostClick}
      />
    </ActionItem>
  )
}

export function Repost(props: {
  videoId: string
  isStandardWall: boolean
  shareUrl: string
  videoSlug: string
}) {
  return (
    <RepostModalProvider>
      <RepostComponent {...props} />
      <RepostModal.ui />
    </RepostModalProvider>
  )
}
